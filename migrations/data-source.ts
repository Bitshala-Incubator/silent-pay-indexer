import { DataSource } from 'typeorm';
import {
    ensureDatabaseDirectory,
    resolveDatabasePath,
} from '../src/common/db-path';

function getEnvVariable(key: string): string {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`Environment variable ${key} not defined!`);
    }
    return value;
}

async function configureDataSource(): Promise<DataSource> {
    const databasePath = resolveDatabasePath(getEnvVariable('DB_PATH'));
    ensureDatabaseDirectory(databasePath);

    return new DataSource({
        database: databasePath,
        type: 'better-sqlite3',
        synchronize: false,
        logging: false,
        entities: ['src/**/**.entity.ts'],
        migrations: ['migrations/**-migrations.ts'],
    });
}

export default configureDataSource();
