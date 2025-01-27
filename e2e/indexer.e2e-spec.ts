import { UTXO, WalletHelper, AddressType } from '@e2e/helpers/wallet.helper';
import { btcToSats, transactionToEntity } from '@e2e/helpers/common.helper';
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

    it.each(Object.values<AddressType>(AddressType))(
        '%s - should ensure that the correct silent block is fetched',
        async (addressType) => {
            const taprootOutput = walletHelper.generateAddresses(
                1,
                AddressType.P2TR,
            )[0];
            const outputs = walletHelper.generateAddresses(6, addressType);
            const utxos: UTXO[] = [];

            for (const [index, output] of outputs.entries()) {
                const utxo: UTXO = {
                    ...(await walletHelper.addFundToUTXO(output, 1)),
                    addressType,
                    index,
                };
                utxos.push(utxo);
            }

            const { transaction, txid, blockHash } =
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
                blockHash,
                blockCount,
                outputs,
            );

            const silentBlock = new SilentBlocksService(
                {} as any,
                {} as any,
            ).encodeSilentBlock([transformedTransaction]);

            // remove this once Web Socket is implemented
            await new Promise((resolve) => setTimeout(resolve, 15000));
            const response = await apiHelper.get(
                `/silent-block/hash/${blockHash}`,
                {
                    responseType: 'arraybuffer',
                },
            );

            expect(response.data).toEqual(silentBlock);
        },
    );

    it('Should exclude spent transactions when the "FilterSpent" flag is set to true', async () => {
        const taprootOutput = walletHelper.generateAddresses(
            1,
            AddressType.P2TR,
        )[0];
        const outputs = walletHelper.generateAddresses(6, AddressType.P2WPKH);
        const utxos: UTXO[] = [];

        for (const [index, output] of outputs.entries()) {
            const utxo = await walletHelper.addFundToUTXO(output, 1);
            utxos.push({ ...utxo, addressType: AddressType.P2WPKH, index });
        }

        const { transaction, txid, blockHash } =
            await walletHelper.craftAndSendTransaction(
                utxos,
                taprootOutput,
                5.999,
                0.001,
            );

        const utxo: UTXO = {
            rawTx: transaction.toHex(),
            txid,
            vout: 0,
            value: btcToSats(5.999),
            addressType: AddressType.P2TR,
            index: 0,
        };

        await walletHelper.craftAndSendTransaction(
            [utxo],
            taprootOutput,
            5.998,
            0.001,
        );

        await new Promise((resolve) => setTimeout(resolve, 30000));
        const response = await apiHelper.get(
            `/silent-block/hash/${blockHash}?filterSpent=true`,
            {
                responseType: 'arraybuffer',
            },
        );

        const silentBlock = new SilentBlocksService(
            {} as any,
            {} as any,
        ).encodeSilentBlock([]);

        expect(response.data).toEqual(silentBlock);
    });
});
