import { UTXO, WalletHelper, AddressType } from '@e2e/helpers/wallet.helper';
import { transformTransaction } from '@e2e/helpers/common.helper';
import { IndexerService } from '@/indexer/indexer.service';
import { initialiseDep } from '@e2e/setup';
import { ApiHelper } from '@e2e/helpers/api.helper';
import { SilentBlocksService } from '@/silent-blocks/silent-blocks.service';

describe('Indexer', () => {
    let apiHelper: ApiHelper;
    let indexerService: IndexerService;
    let silentBlockService: SilentBlocksService;
    let walletHelper: WalletHelper;
    let shutdownDep: () => Promise<void>;

    beforeAll(async () => {
        shutdownDep = await initialiseDep();
        walletHelper = new WalletHelper();
        indexerService = new IndexerService();
        silentBlockService = new SilentBlocksService({} as any);
        apiHelper = new ApiHelper();

        await walletHelper.initializeSpendableAmount();
    });

    afterAll(async () => {
        await shutdownDep();
    });

    const addressTypes: AddressType[] = [
        AddressType.P2WPKH,
        AddressType.P2SH_P2WPKH,
        AddressType.P2PKH,
        AddressType.P2TR,
    ];

    it.each(addressTypes)(
        '%s - should ensure that the correct silent block is fetched',
        async (addressType) => {
            const taprootOutput = walletHelper.generateAddresses(
                1,
                AddressType.P2TR,
            )[0];
            const outputs = walletHelper.generateAddresses(6, addressType);
            const utxos: UTXO[] = [];

            for (const [index, output] of outputs.entries()) {
                const utxo = await walletHelper.addAmountToAddress(
                    output,
                    1,
                    addressType,
                    index,
                );
                utxos.push(utxo);
            }

            const [transaction, txid, blockHash] =
                await walletHelper.craftAndSpendTransaction(
                    utxos,
                    taprootOutput,
                    5.999,
                    0.001,
                );

            const transformedTransaction = transformTransaction(
                transaction,
                txid,
                blockHash,
                walletHelper.currentBlockCount,
                outputs,
                indexerService,
            );

            const silentBlock = silentBlockService.encodeSilentBlock([
                transformedTransaction,
            ]);

            await new Promise((resolve) => setTimeout(resolve, 15000));
            const response = await apiHelper.get(
                `/silent-block/hash/${blockHash}`,
                {
                    responseType: 'arraybuffer',
                },
            );

            expect(response.data as Buffer).toEqual(silentBlock);
        },
    );
});
