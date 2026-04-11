import 'jest';

export const mockBatchWriter = {
    put: jest.fn().mockReturnThis(),
    del: jest.fn().mockReturnThis(),
    commit: jest.fn().mockResolvedValue(undefined),
};

export const mockStorageService = {
    createBatch: jest.fn().mockReturnValue(mockBatchWriter),
    getTransactionByTxid: jest.fn(),
    getTransactionsByBlockHeight: jest.fn(),
    getTransactionsByBlockHeightRange: jest.fn(),
    getTransactionsByBlockHash: jest.fn(),
    getBlockHeightByTimestamp: jest.fn(),
    getCurrentBlockState: jest.fn(),
    getOperationState: jest.fn(),
    saveTransaction: jest.fn(),
    markOutputsSpent: jest.fn(),
    saveBlockState: jest.fn(),
    saveOperationState: jest.fn(),
    deleteTransactionsByBlockHash: jest.fn(),
    deleteBlockState: jest.fn(),
};
