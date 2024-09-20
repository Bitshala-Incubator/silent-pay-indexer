import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OperationStateModule } from '@/operation-state/operation-state.module';
import { OperationStateService } from '@/operation-state/operation-state.service';
import { IndexerModule } from '@/indexer/indexer.module';
import { IndexerService } from '@/indexer/indexer.service';
import { ProviderType } from '@/common/enum';
import { BitcoinCoreProvider } from '@/block-data-providers/bitcoin-core/provider';
import { EsploraProvider } from '@/block-data-providers/esplora/provider';

@Module({
    imports: [OperationStateModule, IndexerModule, ConfigModule],
    controllers: [],
    providers: [
        {
            provide: 'BlockDataProvider',
            inject: [ConfigService, IndexerService, OperationStateService],
            useFactory: (
                configService: ConfigService,
                indexerService: IndexerService,
                operationStateService: OperationStateService,
            ) => {
                switch (configService.get<ProviderType>('providerType')) {
                    case ProviderType.ESPLORA:
                        return new EsploraProvider(
                            configService,
                            indexerService,
                            operationStateService,
                        );
                    case ProviderType.BITCOIN_CORE_RPC:
                        return new BitcoinCoreProvider(
                            configService,
                            indexerService,
                            operationStateService,
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
