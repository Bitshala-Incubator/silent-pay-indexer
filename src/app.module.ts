import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '@/configuration';
import { TransactionsModule } from '@/transactions/transactions.module';
import { commandHandlers } from '@/commands/handlers';
import { OperationStateModule } from '@/operation-state/operation-state.module';
import { SchedulerService } from '@/block-providers/scheduler/scheduler.service';
import { BitcoinCoreProvider } from '@/block-providers/providers/bitcoin-core/provider';
import { PROVIDERS_INJECTION_TOKEN } from '@/block-providers/providers/provider-utils';
import { Provider } from '@/block-providers/providers/provider';
import { ScheduleModule } from '@nestjs/schedule';
import { CqrsModule } from '@nestjs/cqrs';

const blockProviders = [BitcoinCoreProvider];

const GroupedBlockProviders = {
    provide: PROVIDERS_INJECTION_TOKEN,
    useFactory: (...args: Provider[]) => [...args],
    inject: [...blockProviders],
};

@Module({
    imports: [
        ConfigModule.forRoot({
            ignoreEnvFile: true,
            load: [configuration],
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('db.host'),
                port: configService.get<number>('db.port'),
                username: configService.get<string>('db.username'),
                password: configService.get<string>('db.password'),
                database: configService.get<string>('db.databaseName'),
                synchronize: configService.get<boolean>('db.synchronize'),
                autoLoadEntities: true,
            }),
        }),
        TransactionsModule,
        OperationStateModule,
        ScheduleModule.forRoot(),
        CqrsModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        ...commandHandlers,
        SchedulerService,
        ...blockProviders,
        GroupedBlockProviders,
    ],
})
export class AppModule {}
