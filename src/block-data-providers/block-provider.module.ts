import { Module } from '@nestjs/common';
import { EsploraProvider } from '@/block-data-providers/esplora.provider';
import { ConfigService } from '@nestjs/config';
import { OperationStateModule } from '@/operation-state/operation-state.module';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { OperationStateService } from '@/operation-state/operation-state.service';

@Module({
    imports: [OperationStateModule, CqrsModule],
    controllers: [],
    providers: [
        {
            provide: 'BlockDataProvider',
            inject: [ConfigService, CommandBus, OperationStateService],
            useFactory: (
                configService: ConfigService,
                commandBus: CommandBus,
                operationStateService: OperationStateService,
            ) => {
                return new EsploraProvider(
                    configService,
                    commandBus,
                    operationStateService,
                );
            },
        },
    ],
    exports: [],
})
export class BlockProviderModule {}
