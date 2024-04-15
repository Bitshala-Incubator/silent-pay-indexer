import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '@/configuration';
import { TransactionsModule } from '@/transactions/transactions.module';
import { validate } from 'class-validator';
import { DbConfig } from './dbConfiguration';

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
            useFactory: (configService: ConfigService) => {
                const dbConfig = new DbConfig(configService);
                validate(dbConfig).then((errors) => {
                    for (const error of errors) {
                        console.error(error.toString());
                    }

                    throw new Error('Invalid config');
                });

                return {
                    type: 'postgres',
                    ...dbConfig.db,
                    autoLoadEntities: true,
                };
            },
        }),
        TransactionsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
