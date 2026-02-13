import { mkdirSync } from 'fs';
import { homedir } from 'os';
import { dirname, isAbsolute, normalize, resolve } from 'path';

const IN_MEMORY_DATABASE = ':memory:';

const expandHomeDirectory = (inputPath: string): string => {
    if (inputPath === '~') {
        return homedir();
    }

    if (inputPath.startsWith('~/') || inputPath.startsWith('~\\')) {
        return resolve(homedir(), inputPath.slice(2));
    }

    return inputPath;
};

export const resolveDatabasePath = (databasePath: string): string => {
    const normalizedPath = expandHomeDirectory(databasePath.trim());

    if (normalizedPath === IN_MEMORY_DATABASE) {
        return normalizedPath;
    }

    if (isAbsolute(normalizedPath)) {
        return normalize(normalizedPath);
    }

    return resolve(process.cwd(), normalizedPath);
};

export const ensureDatabaseDirectory = (databasePath: string): void => {
    if (databasePath === IN_MEMORY_DATABASE) {
        return;
    }

    mkdirSync(dirname(databasePath), { recursive: true });
};
