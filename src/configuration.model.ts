import {
    IsBoolean,
    IsDefined,
    IsEnum,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    Max,
    Min,
    Validate,
    ValidateIf,
    ValidateNested,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BitcoinNetwork, ProviderType } from '@/common/enum';
import { isValidCron } from 'cron-validator';

@ValidatorConstraint({ name: 'cronSyntax', async: false })
export class CustomCronSyntax implements ValidatorConstraintInterface {
    validate(value: string): boolean {
        return isValidCron(value, {
            seconds: true,
            alias: true,
            allowBlankDay: true,
        });
    }

    defaultMessage(): string {
        return 'Invalid Cron Pattern';
    }
}

class DbConfig {
    @IsNotEmpty()
    @IsString()
    path: string;

    @IsBoolean()
    synchronize: boolean;
}

class AxiosRetryConfig {
    @IsInt()
    @Min(1)
    count: number;

    @IsInt()
    @Min(500)
    delay: number;
}

class AppConfig {
    @IsInt()
    @Min(1)
    @Max(65535)
    port: number;

    @Validate(CustomCronSyntax)
    schedulerInterval: string;

    @IsEnum(BitcoinNetwork)
    network: BitcoinNetwork;

    @IsDefined()
    @ValidateNested()
    @Type(() => AxiosRetryConfig)
    requestRetry: AxiosRetryConfig;

    @IsOptional()
    @IsBoolean()
    verbose?: boolean;
}

class EsploraConfig {
    @IsUrl({
        protocols: ['http', 'https'],
        require_protocol: true,
        require_host: true,
    })
    url: string;

    @IsInt()
    @Min(1)
    @Max(100)
    batchSize: number;
}

export class BitcoinCoreConfig {
    @IsString()
    @IsIn(['http', 'https'])
    protocol: string;

    @IsNotEmpty()
    @IsString()
    rpcHost: string;

    @IsNotEmpty()
    @IsString()
    rpcPass: string;

    @IsNotEmpty()
    @IsString()
    rpcUser: string;

    @IsInt()
    @Min(1)
    @Max(65535)
    rpcPort: number;
}

export class Config {
    @IsDefined()
    @ValidateNested()
    @Type(() => DbConfig)
    db: DbConfig;

    @IsDefined()
    @ValidateNested()
    @Type(() => AppConfig)
    app: AppConfig;

    @IsEnum(ProviderType)
    providerType: ProviderType;

    @ValidateIf((o) => o.providerType === ProviderType.ESPLORA)
    @IsDefined()
    @ValidateNested()
    @Type(() => EsploraConfig)
    esplora: EsploraConfig;

    @ValidateIf((o) => o.providerType === ProviderType.BITCOIN_CORE_RPC)
    @IsDefined()
    @ValidateNested()
    @Type(() => BitcoinCoreConfig)
    bitcoinCore: BitcoinCoreConfig;
}
