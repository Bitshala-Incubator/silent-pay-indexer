import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OperationStateModule } from '@/operation-state/operation-state.module';
import { OperationStateService } from '@/operation-state/operation-state.service';
import { IndexerModule } from '@/indexer/indexer.module';
import { IndexerService } from '@/indexer/indexer.service';
import { ProviderType } from '@/common/enum';
import { BitcoinCoreProvider } from '@/block-data-providers/bitcoin-core/provider';
import { EsploraProvider } from '@/block-data-providers/esplora/provider';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [
        OperationStateModule,
        IndexerModule,
        ConfigModule,
        EventEmitterModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'BlockDataProvider',
            inject: [
                ConfigService,
                IndexerService,
                OperationStateService,
                EventEmitter2,
            ],
            useFactory: (
                configService: ConfigService,
                indexerService: IndexerService,
                operationStateService: OperationStateService,
                eventEmitter: EventEmitter2,
            ) => {
                switch (configService.get<ProviderType>('providerType')) {
                    case ProviderType.ESPLORA:
                        return new EsploraProvider(
                            configService,
                            indexerService,
                            operationStateService,
                            eventEmitter,
                        );
                    case ProviderType.BITCOIN_CORE_RPC:
                        return new BitcoinCoreProvider(
                            configService,
                            indexerService,
                            operationStateService,
                            eventEmitter,
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
