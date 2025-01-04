# Silent Payments Indexer HTTP API

## Transactions

### `GET '/transactions/blockHeight/:blockHeight'`


Returns an array of transactions from the block height.

### `GET '/transactions/blockHash/:blockHash'`

Returns an array of transactions from the block hash.

## Silent Block

### `GET '/silent-block/blockHeight/:blockHeight'`

Returns a serialized silent block from the block height.

### `GET '/silent-block/blockHash/:blockHash'`

Returns a serialized silent block from the block hash.

## Silent Block Format

- `type`
- `transactions[]`
    - `txid`
    - `outputs[]`
        - `value`
        - `pubKey`
        - `vout`
    - `scanTweak`

## Transaction Format

- `txid`
- `vin[]`
    - `txid`
    - `vout`
    - `scriptSig`
    - `witness[]`
    - `prevOutScript`
- `vout[]`
    - `scriptPubKey`
    - `value`
- `blockHeight`
- `blockHash`
