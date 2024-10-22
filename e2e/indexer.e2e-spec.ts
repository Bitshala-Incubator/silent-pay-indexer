import { UTXO, WalletHelper } from '@e2e/helpers/wallet.helper';
import { transactionToEntity } from '@e2e/helpers/common.helper';
import { initialiseDep } from '@e2e/setup';
import { ApiHelper } from '@e2e/helpers/api.helper';
import { SilentBlocksService } from '@/silent-blocks/silent-blocks.service';

describe('Indexer', () => {
    let apiHelper: ApiHelper;
    let walletHelper: WalletHelper;
    let shutdownDep: () => Promise<void>;

    beforeAll(async () => {
        shutdownDep = await initialiseDep();
        walletHelper = new WalletHelper();
        apiHelper = new ApiHelper();

        await walletHelper.initializeWallet();
    });

    afterAll(async () => {
        await shutdownDep();
    });

    it('p2wpkh - should ensure that the correct silent block is fetched', async () => {
        const taprootOutput = walletHelper.generateAddresses(1, 'p2tr')[0];
        const p2wkhOutputs = walletHelper.generateAddresses(6, 'p2wpkh');
        const utxos: UTXO[] = [];

        for (const output of p2wkhOutputs) {
            const utxo = await walletHelper.addFundToUTXO(output, 1);
            utxos.push(utxo);
        }

        const { transaction, txid, blockhash } =
            await walletHelper.craftAndSendTransaction(
                utxos,
                taprootOutput,
                5.999,
                0.001,
            );

        const blockCount = await walletHelper.getBlockCount();
        const transformedTransaction = transactionToEntity(
            transaction,
            txid,
            blockhash,
            blockCount,
            p2wkhOutputs,
        );

        const silentBlock = new SilentBlocksService(
            {} as any,
            {} as any,
        ).encodeSilentBlock([transformedTransaction]);

        await new Promise((resolve) => setTimeout(resolve, 15000));
        const response = await apiHelper.get(
            `/silent-block/hash/${blockhash}`,
            {
                responseType: 'arraybuffer',
            },
        );

        expect(response.data).toEqual(silentBlock);
    });
});
