import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from '@/app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('/health')
    getHealth(): string {
        return this.appService.getHealth();
    }

    @Get('/verify-index')
    verifyIndex(): string {
        return this.appService.verifyIndex();
    }

    @Get('/process-transactions/:provider')
    processTransactions(@Param('provider') provider: string): string {
        return this.appService.processTransactions(provider);
    }
}
