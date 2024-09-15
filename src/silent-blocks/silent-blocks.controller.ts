import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { SilentBlocksService } from '@/silent-blocks/silent-blocks.service';

@Controller('silent-block')
export class SilentBlocksController {
    constructor(private readonly silentBlocksService: SilentBlocksService) {}

    @Get('height/:blockHeight')
    async getSilentBlockByHeight(
        @Param('blockHeight') blockHeight: number,
        @Res() res: Response,
    ) {
        const buffer = await this.silentBlocksService.getSilentBlockByHeight(
            blockHeight,
        );

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    }

    @Get('hash/:blockHash')
    async getSilentBlockByHash(
        @Param('blockHash') blockHash: string,
        @Res() res: Response,
    ) {
        const buffer = await this.silentBlocksService.getSilentBlockByHash(
            blockHash,
        );

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    }
}
