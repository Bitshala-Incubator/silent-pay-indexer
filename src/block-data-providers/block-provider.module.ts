import { Module } from '@nestjs/common';
import { EsploraProvider } from '@/block-data-providers/esplora.provider';
import { ConfigService } from '@nestjs/config';
import { OperationStateModule } from '@/operation-state/operation-state.module';
import { OperationStateService } from '@/operation-state/operation-state.service';
import { IndexerModule } from '@/indexer/indexer.module';
import { IndexerService } from '@/indexer/indexer.service';

@Module({
    imports: [OperationStateModule, IndexerModule],
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
                return new EsploraProvider(
                    configService,
                    indexerService,
                    operationStateService,
                );
            },
        },
    ],
    exports: [],
})
export class BlockProviderModule {}
