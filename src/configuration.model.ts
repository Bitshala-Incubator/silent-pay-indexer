import {
    IsBoolean,
    IsDefined,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsString,
    IsUrl,
    Max,
    Min,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BitcoinNetwork, ProviderType } from '@/common/enum';

class DbConfig {
    @IsNotEmpty()
    @IsString()
    host: string;

    @IsInt()
    @Min(1)
    @Max(65535)
    port: number;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    databaseName: string;

    @IsBoolean()
    synchronize: boolean;
}

class AppConfig {
    @IsInt()
    @Min(1)
    @Max(65535)
    port: number;

    @IsEnum(BitcoinNetwork)
    network: BitcoinNetwork;
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
    @IsNotEmpty()
    @IsString()
    rpcHost: string;

    @IsNotEmpty()
    @IsString()
    rpcPass: string;

    @IsNotEmpty()
    @IsString()
    rpcUser: string;

    @IsNotEmpty()
    @IsString()
    rpcPort: string;
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
