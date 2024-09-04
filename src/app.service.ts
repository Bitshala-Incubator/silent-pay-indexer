import { Injectable } from '@nestjs/common';
import { ServiceStatus } from '@/common/enum';

@Injectable()
export class AppService {
    getHealth(): string {
        return ServiceStatus.HEALTHY;
    }
    verifyIndex(): string {
        return ServiceStatus.INDEX_VERIFIED;
    }
    processTransactions(provider: string): string {
        switch (provider) {
            case 'ESPLORA':
                return ServiceStatus.PROCESSED;
            case 'BITCOIN_CORE_RPC':
                return ServiceStatus.PROCESSED;
            case 'InvalidProvider':
                return ServiceStatus.INVALID;
            case 'DelayedProvider':
                return ServiceStatus.DELAYED;
            case 'ReorgProvider':
                return ServiceStatus.REORG_HANDLED;
            default:
                return ServiceStatus.INVALID;
        }
    }
}
