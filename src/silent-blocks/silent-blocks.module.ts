import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '@/transactions/transaction.entity';
import { TransactionsService } from '@/transactions/transactions.service';
import { SilentBlocksController } from '@/silent-blocks/silent-blocks.controller';
import { SilentBlocksService } from '@/silent-blocks/silent-blocks.service';
import { SilentBlocksGateway } from '@/silent-blocks/silent-blocks.gateway';

@Module({
    imports: [TypeOrmModule.forFeature([Transaction])],
    providers: [TransactionsService, SilentBlocksService, SilentBlocksGateway],
    controllers: [SilentBlocksController],
    exports: [SilentBlocksService],
})
export class SilentBlocksModule {}
