import { DataSource } from 'typeorm';

function getEnvVariable(key: string): string {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`Environment variable ${key} not defined!`);
    }
    return value;
}

async function configureDataSource(): Promise<DataSource> {
    return new DataSource({
        database: getEnvVariable('DB_PATH'),
        type: 'sqlite',
        synchronize: false,
        logging: false,
        entities: ['src/**/**.entity.ts'],
        migrations: ['migrations/**-migrations.ts'],
    });
}

export default configureDataSource();
