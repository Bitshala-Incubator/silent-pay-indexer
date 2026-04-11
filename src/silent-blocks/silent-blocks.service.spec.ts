import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { TransactionsService } from '@/transactions/transactions.service';
import { SilentBlocksService } from '@/silent-blocks/silent-blocks.service';
import { silentBlockEncodingFixture } from '@/silent-blocks/silent-blocks.service.fixtures';
import { SilentBlocksGateway } from '@/silent-blocks/silent-blocks.gateway';
import { BlockStateService } from '@/block-state/block-state.service';
import { StorageService } from '@/storage/storage.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('SilentBlocksService', () => {
    let service: SilentBlocksService;
    let storageService: StorageService;
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'silent-blocks-test-'));

        const module: TestingModule = await Test.createTestingModule({
            imports: [CacheModule.register()],
            providers: [
                SilentBlocksService,
                TransactionsService,
                StorageService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: (key: string) => {
                            if (key === 'db.path') return tmpDir;
                            return null;
                        },
                    },
                },
                {
                    provide: SilentBlocksGateway,
                    useValue: jest.fn(),
                },
                {
                    provide: BlockStateService,
                    useValue: {
                        getCurrentBlockState: jest.fn(),
                    },
                },
            ],
        }).compile();

        storageService = module.get<StorageService>(StorageService);
        await storageService.onModuleInit();
        service = module.get<SilentBlocksService>(SilentBlocksService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it.each(silentBlockEncodingFixture)(
        'should encode a silent block correctly by block height: $blockHeight',
        async ({ transactions, blockHeight, encodedBlockHex }) => {
            // Seed data via StorageService
            const batch = storageService.createBatch();
            for (const tx of transactions) {
                storageService.saveTransaction(batch, {
                    ...tx,
                    outputs: tx.outputs.map((o) => ({
                        ...o,
                        transactionId: tx.id,
                    })),
                });
            }
            await batch.commit();

            const encodedBlock = await service.getSilentBlockByHeight(
                blockHeight,
                false,
            );

            expect(encodedBlock.toString('hex')).toEqual(encodedBlockHex);
        },
    );

    it.each(silentBlockEncodingFixture)(
        'should encode a silent block correctly by block hash: $blockHash',
        async ({ transactions, blockHash, encodedBlockHex }) => {
            const batch = storageService.createBatch();
            for (const tx of transactions) {
                storageService.saveTransaction(batch, {
                    ...tx,
                    outputs: tx.outputs.map((o) => ({
                        ...o,
                        transactionId: tx.id,
                    })),
                });
            }
            await batch.commit();

            const encodedBlock = await service.getSilentBlockByHash(
                blockHash,
                false,
            );

            expect(encodedBlock.toString('hex')).toEqual(encodedBlockHex);
        },
    );

    it('should omit spent Outputs if filterSpent is set to true', async () => {
        const fixture = silentBlockEncodingFixture[0];

        // Save initial transactions
        const batch = storageService.createBatch();
        for (const tx of fixture.transactions) {
            storageService.saveTransaction(batch, {
                ...tx,
                outputs: tx.outputs.map((o) => ({
                    ...o,
                    transactionId: tx.id,
                })),
            });
        }
        await batch.commit();

        // Fetch and verify filtered outputs
        let encodedBlock = await service.getSilentBlockByHash(
            fixture.blockHash,
            true,
        );

        expect(encodedBlock.toString('hex')).toEqual(
            fixture.filteredOutputEncodedBlockHex,
        );

        // Mark all outputs as spent
        const spentBatch = storageService.createBatch();
        const allOutpoints: [string, number][] = [];
        for (const tx of fixture.transactions) {
            for (const out of tx.outputs) {
                allOutpoints.push([tx.id, out.vout]);
            }
        }
        await storageService.markOutputsSpent(spentBatch, allOutpoints);
        await spentBatch.commit();

        encodedBlock = await service.getSilentBlockByHash(
            fixture.blockHash,
            true,
        );

        expect(encodedBlock.toString('hex')).toEqual('0000');
    });

    afterEach(async () => {
        await storageService.onModuleDestroy();
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });
});
