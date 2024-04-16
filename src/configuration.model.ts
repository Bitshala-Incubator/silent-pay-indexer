import {
    IsBoolean,
    IsDefined,
    IsNumber,
    IsString,
    Max,
    Min,
    MinLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class DbConfig {
    @MinLength(1, {
        message: 'Host length should at least be 1',
    })
    @IsString({
        message: 'Host should be a string',
    })
    host: string;

    @IsNumber(
        {
            allowNaN: false,
        },
        {
            message: 'Port should be a number',
        },
    )
    @Min(0, {
        message: 'Port should at least be 0',
    })
    @Max(65535, {
        message: 'Port should at most be 65535',
    })
    port: number;

    @MinLength(1, {
        message: 'Username length should at least be 1',
    })
    username: string;

    password: string;

    @MinLength(1, {
        message: 'Database name length should at least be 1',
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
