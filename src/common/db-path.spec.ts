import { existsSync, mkdtempSync, rmSync } from 'fs';
import { homedir, tmpdir } from 'os';
import { join, resolve } from 'path';
import { ensureDatabaseDirectory, resolveDatabasePath } from '@/common/db-path';

describe('db-path', () => {
    it('should keep in-memory path unchanged', () => {
        expect(resolveDatabasePath(':memory:')).toBe(':memory:');
    });

    it('should resolve relative paths against current working directory', () => {
        const resolvedPath = resolveDatabasePath('db/test.sqlite');
        expect(resolvedPath).toBe(resolve(process.cwd(), 'db/test.sqlite'));
    });

    it('should expand home directory shorthand', () => {
        const resolvedPath = resolveDatabasePath('~/.silent-pay-indexer/db/database.sqlite');
        expect(resolvedPath).toBe(
            resolve(homedir(), '.silent-pay-indexer/db/database.sqlite'),
        );
    });

    it('should create parent directory for database file', () => {
        const temporaryRoot = mkdtempSync(join(tmpdir(), 'silent-pay-db-path-'));
        const databasePath = join(temporaryRoot, 'nested', 'db.sqlite');

        ensureDatabaseDirectory(databasePath);

        expect(existsSync(join(temporaryRoot, 'nested'))).toBe(true);

        rmSync(temporaryRoot, { recursive: true, force: true });
    });
});
