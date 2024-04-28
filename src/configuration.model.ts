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

class DbConfig {
    @IsNotEmpty()
    @IsString()
    host: string;

    @IsInt()
    @Min(0)
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

export class Config {
    @IsDefined()
    @ValidateNested()
    @Type(() => DbConfig)
    db: DbConfig;
}
