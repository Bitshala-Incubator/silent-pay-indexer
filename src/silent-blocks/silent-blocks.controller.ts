import { Controller, Get, Param, Query, Res } from '@nestjs/common';
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
        @Query('filterSpent') filterSpentFlag = 'false',
        @Res() res: Response,
    ) {
        // Convert  to boolean
        const filterSpent = filterSpentFlag === 'true';

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
}
