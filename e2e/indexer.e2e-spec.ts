import { UTXO, WalletHelper } from '@e2e/helpers/wallet.helper';
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
        indexerService = new IndexerService({} as any);
        silentBlockService = new SilentBlocksService({} as any);
        apiHelper = new ApiHelper();

        await walletHelper.initilise_spendable_amount();
    });

    afterAll(async () => {
        await shutdownDep();
    });

    it('p2wpkh - should ensure that the correct silent block is fetched', async () => {
        const taprootOutput = walletHelper.generateAddresses(1, 'p2tr')[0];
        const p2wkhOutputs = walletHelper.generateAddresses(6, 'p2wpkh');
        const utxos: UTXO[] = [];

        for (const output of p2wkhOutputs) {
            const utxo = await walletHelper.addAmountToAddress(output, 1);
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
            walletHelper.current_block_count,
            p2wkhOutputs,
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
    });
});
