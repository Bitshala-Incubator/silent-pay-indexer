import { ConfigService } from '@nestjs/config';
import {
    IsBoolean,
    Max,
    Min,
    MinLength,
    ValidateNested,
} from 'class-validator';

class Db {
    @MinLength(1, {
        message: 'Host length should at least be 1',
    })
    host: string;
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

    constructor(configService: ConfigService) {
        this.host = configService.get('db.host');
        this.port = configService.get('db.port');
        this.username = configService.get('db.username');
        this.password = configService.get('db.password');
        this.databaseName = configService.get('db.databaseName');
        this.synchronize = configService.get('db.synchronize');
    }

    *[Symbol.iterator]() {
        for (const key of Object.keys(this)) {
            yield [key, this[key]];
        }
    }
}

export class DbConfig {
    @ValidateNested()
    db: Db;

    constructor(config: ConfigService) {
        this.db = new Db(config);
    }
}
