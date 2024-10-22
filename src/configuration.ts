import { join } from 'path';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { camelToSnakeCase } from '@/common/common';
import { Config } from '@/configuration.model';
import { validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';

const getConfigFilePath = (): string => {
    const baseDir = join(process.env.NODE_DIRNAME || __dirname, 'config');
    switch (process.env.NODE_ENV) {
        case 'dev':
        case 'test':
            return join(baseDir, 'dev.config.yaml');
        case 'e2e':
            return join(baseDir, 'e2e.config.yaml');
        default:
            return join(baseDir, 'config.yaml');
    }
};

export function mergeEnvVariablesRecursive(
    config: Record<string, any>,
    envVarName = '',
) {
    for (const key of Object.keys(config)) {
        const currentEnvVarName = envVarName
            ? `${envVarName}_${camelToSnakeCase(key)}`
            : key.toUpperCase();
        const currentEnvVarValue = process.env[currentEnvVarName];
        if (config[key] && typeof config[key] === 'object') {
            mergeEnvVariablesRecursive(config[key], currentEnvVarName);
        } else if (typeof currentEnvVarValue !== 'undefined') {
            try {
                config[key] = JSON.parse(currentEnvVarValue);
            } catch (error) {
                config[key] = currentEnvVarValue;
            }
        }
    }
}

export default () => {
    const config = load(readFileSync(getConfigFilePath(), 'utf8')) as Record<
        string,
        any
    >;
    mergeEnvVariablesRecursive(config);

    const validateConfig = plainToClass(Config, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validateConfig, {
        skipMissingProperties: true,
    });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return config;
};
