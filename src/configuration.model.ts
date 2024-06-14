import {
    IsBoolean,
    IsDefined,
    IsInt,
    IsNotEmpty,
    IsString,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProviderName } from '@/block-providers/providers/provider-utils';

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
}
export class BitcoinCoreConfig {
    @IsNotEmpty()
    @IsString()
    rpchost: string;

    @IsNotEmpty()
    @IsString()
    rpcpass: string;

    @IsNotEmpty()
    @IsString()
    network: string;

    @IsNotEmpty()
    @IsString()
    rpcuser: string;

    @IsNotEmpty()
    @IsString()
    rpcport: string;
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

    @IsNotEmpty()
    @IsString()
    provider: ProviderName;

    @ValidateNested()
    @Type(() => BitcoinCoreConfig)
    bitcoincore: BitcoinCoreConfig;
}
