import { Injectable } from '@nestjs/common';
import { ServiceStatus } from '@/common/enum';

@Injectable()
export class AppService {
    getHealth(): string {
        return ServiceStatus.HEALTHY;
    }
}
