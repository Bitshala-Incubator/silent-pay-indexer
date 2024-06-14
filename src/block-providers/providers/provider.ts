import { ProviderName } from '@/block-providers/providers/provider-utils';
import { IndexTransactionCommand } from '@/commands/impl/index-transaction.command';

export abstract class Provider {
    public abstract readonly PROVIDER_NAME: ProviderName;
    public abstract START_BLOCK: number;

    public async load(): Promise<IndexTransactionCommand[]> {
        return null;
    }

    public async init() {
        return null;
    }
}
