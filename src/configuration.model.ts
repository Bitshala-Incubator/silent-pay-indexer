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
    @IsNotEmpty({
        message: 'Host length should at least be 1',
    })
    @IsString({
        message: 'Host should be a string',
    })
    host: string;

    @IsInt({
        message: 'Port should be a number',
    })
    @Min(0, {
        message: 'Port should at least be 0',
    })
    @Max(65535, {
        message: 'Port should at most be 65535',
    })
    port: number;

    @IsNotEmpty({
        message: 'Username length should at least be 1',
    })
    @IsString({
        message: 'Username should be a string',
    })
    username: string;

    @IsNotEmpty({
        message: 'Username length should at least be 1',
    })
    @IsString({
        message: 'Username should be a string',
    })
    password: string;

    @IsNotEmpty({
        message: 'Database name length should at least be 1',
    })
    @IsString({
        message: 'Database name should be a string',
    })
    databaseName: string;

    @IsBoolean({
        message: 'Synchronize should be a boolean',
    })
    synchronize: boolean;
}

export class Config {
    @IsDefined()
    @ValidateNested({
        message: 'Invalid db config',
    })
    @Type(() => DbConfig)
    db: DbConfig;
}
