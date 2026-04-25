import { Injectable } from '@nestjs/common';
import { StorageService } from '@/storage/storage.service';
import { OperationStateData } from '@/storage/interfaces';

@Injectable()
export class OperationStateService {
    constructor(private readonly storageService: StorageService) {}

    async getOperationState(id: string): Promise<OperationStateData> {
        return this.storageService.getOperationState(id);
    }
}
