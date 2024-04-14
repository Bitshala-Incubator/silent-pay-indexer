import { join } from 'path';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { camelToSnakeCase } from '@/common/common';

const getConfigFilePath = () => {
    switch (process.env.NODE_ENV) {
        case 'dev':
        case 'test':
            return join(__dirname, 'config', 'dev.config.yaml');
        default:
            return join(__dirname, 'config', 'config.yaml');
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
    return config;
};
