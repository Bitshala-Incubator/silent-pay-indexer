import { CacheInterceptor } from '@nestjs/cache-manager';
import {
    Controller,
    Get,
    Param,
    ParseBoolPipe,
    Query,
    Res,
    UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { SilentBlocksService } from '@/silent-blocks/silent-blocks.service';

@Controller('silent-block')
export class SilentBlocksController {
    constructor(private readonly silentBlocksService: SilentBlocksService) {}

    @Get('height/:height')
    @UseInterceptors(CacheInterceptor)
    async getSilentBlockByHeight(
        @Param('height') blockHeight: number,
        @Res() res: Response,
        @Query('filterSpent', new ParseBoolPipe({ optional: true }))
        filterSpent = false,
    ) {
        const buffer = await this.silentBlocksService.getSilentBlockByHeight(
            blockHeight,
            filterSpent,
        );

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    }

    @Get('hash/:hash')
    @UseInterceptors(CacheInterceptor)
    async getSilentBlockByHash(
        @Param('hash') blockHash: string,
        @Res() res: Response,
        @Query('filterSpent', new ParseBoolPipe({ optional: true }))
        filterSpent = false,
    ) {
        const buffer = await this.silentBlocksService.getSilentBlockByHash(
            blockHash,
            filterSpent,
        );

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    }

    @Get('latest-height')
    @UseInterceptors(CacheInterceptor)
    async getLatestIndexedBlockHeight() {
        const height =
            await this.silentBlocksService.getLatestIndexedBlockHeight();
        return { height };
    }
}
