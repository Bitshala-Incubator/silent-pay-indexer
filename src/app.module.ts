import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '@/configuration';
import { TransactionsModule } from '@/transactions/transactions.module';
import { validate } from 'class-validator';

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
                return {
                    type: 'postgres',
                    host: configService.get('db.host'),
                    port: configService.get('db.port'),
                    username: configService.get('db.username'),
                    password: configService.get('db.password'),
                    databaseName: configService.get('db.databaseName'),
                    synchronize: configService.get('db.synchronize'),
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
