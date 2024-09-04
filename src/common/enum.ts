export enum ServiceStatus {
    HEALTHY = 'HEALTHY',
    PROCESSED = 'PROCESSED',
    INVALID = 'INVALID',
    DELAYED = 'DELAYED',
    REORG_HANDLED = 'REORG_HANDLED',
    INDEX_VERIFIED = 'INDEX_VERIFIED',
}

export enum ProviderType {
    ESPLORA = 'ESPLORA',
    BITCOIN_CORE_RPC = 'BITCOIN_CORE_RPC',
}

export enum BitcoinNetwork {
    MAINNET = 'main',
    TESTNET = 'testnet',
    REGTEST = 'regtest',
}
