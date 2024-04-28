import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
    IndexTransactionCommand,
    TransactionInput,
} from '@/commands/impl/index-transaction.command';
import { createTaggedHash, extractPubKeyFromScript } from '@/common/common';
import { publicKeyCombine, publicKeyTweakMul } from 'secp256k1';
import {
    Transaction,
    TransactionOutput,
} from '@/transactions/transaction.entity';
import { TransactionsService } from '@/transactions/transactions.service';

@CommandHandler(IndexTransactionCommand)
export class IndexTransactionHandler
    implements ICommandHandler<IndexTransactionCommand>
{
    constructor(private readonly transactionsService: TransactionsService) {}

    async execute(command: IndexTransactionCommand) {
        const eligibleOutputPubKeys: TransactionOutput[] = [];

        // verify if the transaction contains at least one BIP341 P2TR output
        // this output could be a potential silent payment
        let vout = 0;
        for (const output of command.vout) {
            if (this.isP2TR(output.scriptPubKey)) {
                eligibleOutputPubKeys.push({
                    pubKey: output.scriptPubKey.substring(4),
                    value: output.value,
                    vout: vout,
                });
            }
            vout++;
        }

        if (eligibleOutputPubKeys.length === 0) return;

        // verify that the transaction does not spend an output with SegWit version > 1
        // this would make the transaction ineligible for silent payment v0
        for (const input of command.vin) {
            // grab the first op code of the prevOutScript
            const firstOpCode = parseInt(input.prevOutScript.slice(0, 2), 16);

            // if the first op code is in the range OP_2-OP_16 (0x52-0x60)
            // then the transaction is ineligible
            if (0x52 <= firstOpCode && firstOpCode <= 0x60) return;
        }

        // extract the input public keys from the transaction
        const pubKeys: Buffer[] = [];
        for (const input of command.vin) {
            const pubKey = extractPubKeyFromScript(
                Buffer.from(input.prevOutScript, 'hex'),
                Buffer.from(input.scriptSig, 'hex'),
                input.witness?.map((w) => Buffer.from(w, 'hex')),
            );
            if (pubKey) pubKeys.push(pubKey);
        }

        if (pubKeys.length === 0) return;

        const smallestOutpoint = this.getSmallestOutpoint(command.vin);
        const sumOfPublicKeys = Buffer.from(publicKeyCombine(pubKeys, true));

        const inputHash = createTaggedHash(
            'BIP0352/Inputs',
            Buffer.concat([smallestOutpoint, sumOfPublicKeys]),
        );

        // A * inputHash
        const scanTweak = Buffer.from(
            publicKeyTweakMul(sumOfPublicKeys, inputHash, true),
        );

        const transaction = new Transaction();
        transaction.id = command.txid;
        transaction.blockHeight = command.blockHeight;
        transaction.blockHash = command.blockHash;
        transaction.scanTweak = scanTweak.toString('hex');
        transaction.outputs = eligibleOutputPubKeys;
        transaction.isSpent = false;

        await this.transactionsService.saveTransaction(transaction);
    }

    private isP2TR(spk: string): boolean {
        if (spk.match(/^5120[0-9a-fA-F]{64}$/)) return true;
    }

    private getSmallestOutpoint(vins: TransactionInput[]): Buffer {
        const outpoints = vins.map((vin) => {
            const n = Buffer.alloc(4);
            n.writeUInt32LE(vin.vout);
            return Buffer.concat([Buffer.from(vin.txid, 'hex').reverse(), n]);
        });

        let smallest = outpoints[0];
        for (const outpoint of outpoints) {
            if (outpoint.compare(smallest) < 0) smallest = outpoint;
        }
        return smallest;
    }
}
