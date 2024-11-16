import { WalletHelper, UTXO } from '@e2e/helpers/wallet.helper';
import { BitcoinRPCUtil } from '@e2e/helpers/rpc.helper';
import { ApiHelper } from '@e2e/helpers/api.helper';
import { parseSilentBlock, SilentBlock } from '@e2e/helpers/common.helper';
import { generateScanTweak } from '@e2e/helpers/common.helper';
import { btcToSats } from '@e2e/helpers/common.helper';
import { IndexerService } from '@/indexer/indexer.service';

describe('Indexer', () => {
    let apiHelper: ApiHelper;
    let blockHash: string;
    let expectedSilentBlock: SilentBlock;

    beforeAll(async () => {
        const walletHelper = new WalletHelper();
        const bitcoinRPCUtil = new BitcoinRPCUtil();
        const indexerService = new IndexerService();
        apiHelper = new ApiHelper();

        await bitcoinRPCUtil.createWallet('test_wallet');
        const initialAddress = await bitcoinRPCUtil.getNewAddress();
        const taprootOutput = walletHelper.generateAddresses(1, 'p2tr')[0];
        const p2wkhOutputs = walletHelper.generateAddresses(6, 'p2wpkh');
        await bitcoinRPCUtil.mineToAddress(101, initialAddress);

        const txidList = [];
        for (const output of p2wkhOutputs) {
            const txid = await bitcoinRPCUtil.sendToAddress(output.address, 1);
            txidList.push(txid);
        }
        await bitcoinRPCUtil.mineToAddress(6, initialAddress);

        const utxos: UTXO[] = [];
        for (let i = 0; i < 6; i++) {
            for (let vout = 0; vout < 2; vout++) {
                const utxo = await bitcoinRPCUtil.getTxOut(txidList[i], vout);

                if (
                    utxo &&
                    utxo.scriptPubKey &&
                    utxo.scriptPubKey.address === p2wkhOutputs[i].address
                ) {
                    utxos.push({
                        txid: txidList[i],
                        vout: vout,
                        value: btcToSats(utxo.value),
                        rawTx: await bitcoinRPCUtil.getRawTransaction(
                            txidList[i],
                        ),
                    });
                    break;
                }
            }
        }
        const transaction = walletHelper.craftTransaction(
            utxos,
            taprootOutput, // Send 5.999 BTC to taproot address with .001 BTC fee
        );

        const txid = await bitcoinRPCUtil.sendRawTransaction(
            transaction.toHex(),
        );
        blockHash = (await bitcoinRPCUtil.mineToAddress(1, initialAddress))[0];

        const expectedScanTweak = generateScanTweak(
            transaction,
            p2wkhOutputs,
            indexerService,
        );

        expectedSilentBlock = {
            type: 0,
            transactions: [
                {
                    txid: txid,
                    outputs: [
                        {
                            value: btcToSats(5.999),
                            pubkey: taprootOutput.pubkey.toString('hex'),
                            vout: 0,
                        },
                    ],
                    scanTweak: expectedScanTweak,
                },
            ],
        };

        await new Promise((resolve) => setTimeout(resolve, 15000));
    });

    it('should ensure that the correct silent block is fetched', async () => {
        const response = await apiHelper.get(
            `/silent-block/hash/${blockHash}`,
            {
                responseType: 'arraybuffer',
            },
        );

        const decodedBlock = parseSilentBlock(response.data);
        expect(decodedBlock).toMatchObject(expectedSilentBlock);
    });
});
