import { WalletHelper } from '@e2e/helpers/wallet.helper';
import { BitcoinRPCUtil } from '@e2e/helpers/rpc.helper';
import { ApiHelper } from '@e2e/helpers/api.helper';
import { parseSilentBlock } from '@e2e/helpers/common.helper';
import { Payment } from 'bitcoinjs-lib';
import { generateScantweak } from '@e2e/helpers/common.helper';
import { convertToSatoshi } from '@e2e/helpers/common.helper';

describe('Silent Pay Indexer Tests', () => {
    let walletHelper: WalletHelper;
    let bitcoinRPCUtil: BitcoinRPCUtil;
    let apiHelper: ApiHelper;
    let initialAddress: string;
    let p2wkhOutputs: Payment[];
    let taprootOutput: Payment;
    let utxos: { txid: string; vout: number; value: number; rawTx: string }[];

    beforeAll(async () => {
        walletHelper = new WalletHelper();
        bitcoinRPCUtil = new BitcoinRPCUtil();
        apiHelper = new ApiHelper();

        await bitcoinRPCUtil.createWallet('test_wallet');
        initialAddress = await bitcoinRPCUtil.getNewAddress();
        taprootOutput = walletHelper.generateAddresses(1, 'p2tr')[0];
        p2wkhOutputs = walletHelper.generateAddresses(6, 'p2wpkh');
        await bitcoinRPCUtil.mineToAddress(101, initialAddress);

        const txidList = [];
        for (const output of p2wkhOutputs) {
            const txid = await bitcoinRPCUtil.sendToAddress(output.address, 1);
            txidList.push(txid);
        }
        await bitcoinRPCUtil.mineToAddress(6, initialAddress);

        utxos = [];
        for (let i = 0; i < 6; i++) {
            for (let vout = 0; vout < 2; vout++) {
                const utxo = await bitcoinRPCUtil.getTxOut(txidList[i], vout);

                if (
                    utxo &&
                    utxo.scriptPubKey.address === p2wkhOutputs[i].address
                ) {
                    utxos.push({
                        txid: txidList[i],
                        vout: vout,
                        value: convertToSatoshi(utxo.value),
                        rawTx: await bitcoinRPCUtil.getRawTransaction(
                            txidList[i],
                        ),
                    });
                    break;
                }
            }
        }
    });

    it('should ensure that the correct silent block is fetched', async () => {
        const transaction = walletHelper.craftTransaction(
            utxos.slice(0, 6),
            taprootOutput, // Send 5.99 BTC to taproot address with .01 BTC fee
        );

        await bitcoinRPCUtil.sendRawTransaction(transaction.toHex());
        const blockHash = (
            await bitcoinRPCUtil.mineToAddress(1, initialAddress)
        )[0];

        await new Promise((resolve) => setTimeout(resolve, 30000));
        const response = await apiHelper.get(
            `/silent-block/hash/${blockHash}`,
            {
                responseType: 'arraybuffer',
            },
        );

        const decodedBlock = parseSilentBlock(response.data);
        const transactions = decodedBlock.transactions;
        expect(transactions).toHaveLength(1);
        const foundTx = transactions[0];

        expect(foundTx.outputs.length).toBe(1);
        const output = foundTx.outputs[0];
        expect(output).toBeDefined();
        expect(output.value).toEqual(convertToSatoshi(5.999));

        const taprootPubKeyBuffer = Buffer.from(taprootOutput.pubkey).toString(
            'hex',
        );

        expect(output.pubkey).toEqual(taprootPubKeyBuffer);

        const scantweak = generateScantweak(transaction, p2wkhOutputs);
        expect(foundTx.scanTweak).toEqual(scantweak);
    });
});
