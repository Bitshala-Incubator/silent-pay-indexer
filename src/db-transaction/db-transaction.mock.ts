import 'jest';

export const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getQuery: jest.fn(),
    getRawOne: jest.fn(),
    from: jest.fn().mockReturnThis(),
};

export const mockEntityManager = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    query: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    increment: jest.fn(),
    findBy: jest.fn(),
    exists: jest.fn(),
};

export const queryRunnerMock = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: mockEntityManager,
};

export class MockDataSource {
    createQueryRunner = jest.fn().mockReturnValue(queryRunnerMock);
}
