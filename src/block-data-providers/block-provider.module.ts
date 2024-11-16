import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OperationStateModule } from '@/operation-state/operation-state.module';
import { OperationStateService } from '@/operation-state/operation-state.service';
import { IndexerModule } from '@/indexer/indexer.module';
import { IndexerService } from '@/indexer/indexer.service';
import { ProviderType } from '@/common/enum';
import { BitcoinCoreProvider } from '@/block-data-providers/bitcoin-core/provider';
import { EsploraProvider } from '@/block-data-providers/esplora/provider';
import { BlockStateService } from '@/block-state/block-state.service';
import { BlockStateModule } from '@/block-state/block-state.module';
import { DbTransactionModule } from '@/db-transaction/db-transaction.module';
import { DbTransactionService } from '@/db-transaction/db-transaction.service';

@Module({
    imports: [
        OperationStateModule,
        IndexerModule,
        ConfigModule,
        BlockStateModule,
        DbTransactionModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'BlockDataProvider',
            inject: [
                ConfigService,
                IndexerService,
                OperationStateService,
                BlockStateService,
                DbTransactionService,
            ],
            useFactory: (
                configService: ConfigService,
                indexerService: IndexerService,
                operationStateService: OperationStateService,
                blockStateService: BlockStateService,
                dbTransactionService: DbTransactionService,
            ) => {
                switch (configService.get<ProviderType>('providerType')) {
                    case ProviderType.ESPLORA:
                        return new EsploraProvider(
                            configService,
                            indexerService,
                            operationStateService,
                            blockStateService,
                            dbTransactionService,
                        );
                    case ProviderType.BITCOIN_CORE_RPC:
                        return new BitcoinCoreProvider(
                            configService,
                            indexerService,
                            operationStateService,
                            blockStateService,
                            dbTransactionService,
                        );
                    default:
                        throw Error('unrecognised provider type in config');
                }
            },
        },
    ],
    exports: [],
})
export class BlockProviderModule {}
