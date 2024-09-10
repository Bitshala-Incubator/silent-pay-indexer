import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DatabaseHelper } from '../e2e/helpers/database.helper';
import { BitcoinRPCUtil } from '../e2e/helpers/rpc.helper';

describe('Block Height E2E Test', () => {
    let app: INestApplication;
    let databaseHelper: DatabaseHelper;
    let bitcoinRPCUtil: BitcoinRPCUtil;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            providers: [DatabaseHelper, BitcoinRPCUtil],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        databaseHelper = moduleFixture.get<DatabaseHelper>(DatabaseHelper);
        bitcoinRPCUtil = moduleFixture.get<BitcoinRPCUtil>(BitcoinRPCUtil);

        await databaseHelper.init();
    });

    afterAll(async () => {
        await databaseHelper.close();
        await app.close();
    });

    it('should match the block height from the database with the Bitcoin Core RPC', async () => {
        const result = await databaseHelper.getIndexedBlockHeight();

        const firstItem = result[0];
        const expectedBlockHeight = firstItem.indexedBlockHeight;

        expect(expectedBlockHeight).not.toBeNull();

        const rpcBlockHeight = await bitcoinRPCUtil.getBlockHeight();

        expect(expectedBlockHeight).toEqual(rpcBlockHeight);
    });
});
