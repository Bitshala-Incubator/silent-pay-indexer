import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PROVIDERS_INJECTION_TOKEN } from '@/block-providers/providers/provider-utils';
import { Provider } from '@/block-providers/providers/provider';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class SchedulerService implements OnModuleInit {
    private backchannelUrl: string;
    private provider: Provider;

    public constructor(
        @Inject(PROVIDERS_INJECTION_TOKEN) private providers: Provider[],
        private configService: ConfigService,
        private readonly commandBus: CommandBus,
    ) {
        this.provider = this.resolveProvider();
    }

    onModuleInit() {
        this.provider.init();
    }

    public resolveProvider(): Provider {
        const targetProviderName = this.configService.get<string>('provider');
        const provider = this.providers.find(
            (it) => it.PROVIDER_NAME === targetProviderName,
        );
        if (!provider) {
            throw new Error(
                `No provider with given name, '${targetProviderName}'`,
            );
        }
        return provider;
    }

    // TODO: Make it more dynamic
    @Cron('10 * * * * *')
    async fetchBlockData() {
        const transactionlist = await this.provider.load();
        for (const txn of transactionlist) {
            await this.commandBus.execute(txn);
        }
    }
}
