import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '@/configuration';
import { TransactionsModule } from '@/transactions/transactions.module';
import { SilentBlocksModule } from '@/silent-blocks/silent-blocks.module';
import { OperationStateModule } from '@/operation-state/operation-state.module';
import { BlockProviderModule } from '@/block-data-providers/block-provider.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import {
    WinstonModule,
    utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import { WinstonModuleOptions } from 'nest-winston/dist/winston.interfaces';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot(),
        CacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                ttl: configService.get<number>('cache.ttl', 5000),
            }),
        }),
        ConfigModule.forRoot({
            ignoreEnvFile: true,
            load: [configuration],
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'sqlite',
                database: configService.get<string>('db.path'),
                synchronize: configService.get<boolean>('db.synchronize'),
                autoLoadEntities: true,
            }),
        }),
        TransactionsModule,
        SilentBlocksModule,
        OperationStateModule,
        BlockProviderModule,
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => [
                {
                    ttl: configService.get<number>('throttler.ttl', 1000),
                    limit: configService.get<number>('throttler.limit', 5),
                },
            ],
        }),
        WinstonModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (
                configService: ConfigService,
            ): WinstonModuleOptions => {
                const isVerbose =
                    configService.get<boolean>('app.verbose') ?? false;
                const isDebug =
                    configService.get<boolean>('app.debug') ?? false;
                return {
                    level: isVerbose ? 'verbose' : isDebug ? 'debug' : 'info',
                    levels: {
                        error: 0,
                        warn: 1,
                        info: 2,
                        http: 3,
                        debug: 4,
                        verbose: 5,
                        silly: 6,
                    },
                    transports: [
                        // File transport - logs everything to log.txt
                        new winston.transports.File({
                            filename: 'app.log',
                            format: winston.format.combine(
                                winston.format.timestamp({
                                    format: 'YYYY-MM-DD HH:mm:ss',
                                }),
                                winston.format.errors({ stack: true }),
                                winston.format.printf(
                                    ({
                                        timestamp,
                                        level,
                                        context,
                                        message,
                                    }) => {
                                        return `[${timestamp}] [${level.toUpperCase()}] [${
                                            context || 'Application'
                                        }] ${message}`;
                                    },
                                ),
                            ),
                            maxsize: 5242880, // 5MB
                            maxFiles: 5,
                        }),
                        // Console transport - for development
                        new winston.transports.Console({
                            format: winston.format.combine(
                                winston.format.timestamp(),
                                winston.format.ms(),
                                nestWinstonModuleUtilities.format.nestLike(),
                            ),
                        }),
                    ],
                };
            },
        }),
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
