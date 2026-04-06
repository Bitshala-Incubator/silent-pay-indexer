# Storage Engine Comparison: Why RocksDB?

This document explains why RocksDB was chosen as the storage engine for the silent payment indexer, and how it compares to alternatives.

## Workload characteristics

The indexer has a specific access profile that heavily influences the storage engine choice:

1. **Write-heavy, append-mostly** - scanning the blockchain from taproot activation (~block 709,632) forward, ingesting every block's P2TR transactions atomically via batch writes
2. **Binary key-value data** - transactions (73 bytes), outputs (41 bytes), and several empty-value indexes, all prefix-encoded
3. **Range scans by sorted key** - `idx:h:<height>`, `idx:bt:<timestamp>`, `idx:us:<txid>:<vout>` - core read patterns are ordered iteration over contiguous key ranges
4. **Point lookups** - `tx:<txid>` for single transaction fetches
5. **Atomic batches** - every block is committed as one atomic batch (all txns + outputs + indexes + state), with rollback on failure
6. **No relational joins** - outputs are always fetched by txid prefix scan, not via SQL joins

## Why RocksDB

RocksDB is built on an **LSM-tree** (Log-Structured Merge-tree), which aligns well with the above:

- **Fast writes**: sequential append to a write-ahead log + in-memory memtable, then background compaction. Block-at-a-time batch writes are the ideal LSM workload.
- **Efficient range scans on sorted keys**: the prefix-based key scheme (`idx:h:<height>:<txid>`) maps directly to RocksDB's sorted byte-order iteration. Range scans like "all txns at height X" are a single seek + forward iteration.
- **Built-in compression**: ~48 GB raw data compresses to ~10-16 GB with RocksDB's default compression (Snappy/LZ4/Zstd). SQLite doesn't compress data at rest.
- **Atomic WriteBatch**: native support for queuing puts and deletes and committing atomically, with zero partial state.
- **Embeddable, no server process**: runs in-process, no network round-trips, no connection pooling, no separate daemon to manage.

## Comparisons

### vs. SQLite (previous storage engine)

| Dimension | SQLite | RocksDB |
|---|---|---|
| **Write throughput** | WAL mode helps, but still B-tree page splits on every insert; single-writer lock | LSM sequential writes are 5-10x faster for bulk ingest |
| **Range scans** | B-tree index range scans are efficient, but rows are stored as text/blob with SQL parsing overhead | Direct sorted-byte iteration, zero SQL parsing, zero type marshalling |
| **Storage size** | No built-in compression; txids and scanTweaks stored as hex strings | Prefix compression + block compression, 3-5x smaller |
| **Atomic batches** | `BEGIN/COMMIT` transactions work, but TypeORM added significant overhead | Native WriteBatch, no ORM layer |
| **Binary data** | Blobs are supported but awkward; 32-byte hashes were stored as 64-char hex strings | Native binary keys and values, 32-byte txid is 32 bytes |
| **Operational** | Single file, easy backups | Directory of SST files, but still embedded, no server |

SQLite is a great general-purpose embedded DB, but for this workload (bulk sequential writes, prefix-based range scans, binary data, no joins) it was paying SQL overhead for features that weren't being used.

### vs. LevelDB

RocksDB is a fork of LevelDB (by Facebook, ~2012), so this is the closest comparison:

| Dimension | LevelDB | RocksDB |
|---|---|---|
| **Compaction** | Single-threaded, leveled only | Multi-threaded, leveled + universal + FIFO strategies |
| **Compression** | Snappy only | Snappy, LZ4, Zstd, configurable per-level |
| **Column families** | None | Supported - could separate `tx:`, `out:`, `idx:*` into different CFs |
| **Write stalls** | Notorious for stalling during compaction on large datasets | Rate limiter + write buffer manager to smooth writes |
| **Monitoring** | Minimal | Rich statistics, perf context, event listeners |
| **Maintenance** | Largely abandoned (Google) | Actively maintained by Meta |

LevelDB would functionally work (and the `levelup` abstraction layer could swap it in), but when indexing ~135M+ transactions with ~48 GB of data, LevelDB's single-threaded compaction causes write stalls and long pause times. RocksDB was specifically created to fix these problems.

### vs. PostgreSQL

| Dimension | PostgreSQL | RocksDB |
|---|---|---|
| **Write throughput** | B-tree inserts + WAL + MVCC overhead; fine per-block, but bottlenecks at catch-up speed (thousands of blocks/sec) | LSM writes are 5-10x faster for sequential bulk ingest |
| **Range scans** | B-tree index scans are efficient, but add SQL parsing, plan generation, type conversion, network serialization | Direct byte iteration, no intermediate layers |
| **Storage** | Row-oriented with per-row overhead (~23 byte tuple header, alignment padding, TOAST) | Compact binary with compression; 73-byte tx record is literally 73 bytes |
| **Query flexibility** | Full SQL, window functions, CTEs, aggregates | Key-value only, but sufficient for all 7 read patterns |
| **Operational burden** | Separate server process, connection pooling, vacuuming, backups, monitoring | Embedded, zero ops |
| **Concurrency** | MVCC, multiple writers, row-level locking | Single-threaded sequential indexer doesn't benefit from this |

PostgreSQL would work for a more complex application (multi-service, complex queries, multiple writers). For a single-purpose blockchain indexer with 7 fixed query patterns and no relational joins, Postgres brings operational and performance overhead without corresponding benefit.

Where Postgres wins: ad-hoc analytical queries ("how many silent payment transactions per day?"). With RocksDB, that must be built in application code.

### vs. Cassandra

| Dimension | Cassandra | RocksDB |
|---|---|---|
| **Architecture** | Distributed, multi-node, eventual consistency | Single-node, embedded |
| **Storage engine** | Also LSM-tree based internally | LSM-tree |
| **Operational** | JVM, multi-node cluster, gossip protocol, repair, compaction tuning | Zero ops, embedded |
| **Consistency** | Tunable (ONE, QUORUM, ALL), overkill for single-writer indexer | Strong consistency by default |
| **Scaling** | Horizontal scaling across nodes | Vertical scaling only |

Cassandra is designed for distributed writes across many nodes from many writers with eventual consistency. The indexer is a single process reading a single blockchain sequentially. Cassandra would bring enormous operational complexity for zero benefit.

### vs. LMDB

| Dimension | LMDB | RocksDB |
|---|---|---|
| **Architecture** | B+ tree, memory-mapped, copy-on-write | LSM-tree |
| **Write throughput** | Slower for bulk sequential writes (B-tree page splits) | Faster for append-heavy workloads |
| **Read throughput** | Faster for point lookups (single I/O, memory-mapped) | Slightly slower (may check multiple LSM levels) |
| **Write amplification** | Lower (no compaction) | Higher (LSM compaction rewrites data) |
| **Database size** | Must pre-configure max map size; fragmentation over time | Grows dynamically; compaction reclaims space |

LMDB is a reasonable alternative. Bitcoin Core itself uses it in some configurations. The main advantage of RocksDB over LMDB is write throughput during initial chain sync, when thousands of blocks are ingested per second and LSM sequential writes significantly outperform B-tree inserts. Once caught up (1 block per ~10 minutes), the difference is negligible.

## Summary

| Database | Write Speed | Range Scans | Ops Burden | Fit |
|---|---|---|---|---|
| **RocksDB** | Excellent | Excellent | None (embedded) | **Best fit** |
| LevelDB | Good | Good | None (embedded) | Good, but stalls at scale |
| SQLite | Moderate | Good (with SQL overhead) | None (embedded) | Workable, but paying SQL tax |
| LMDB | Moderate | Excellent | None (embedded) | Good alternative, slower sync |
| PostgreSQL | Moderate | Good (with SQL overhead) | High (server process) | Overkill |
| Cassandra | Excellent | Good | Very High (cluster) | Wildly overkill |

The indexer's access pattern — **sequential bulk writes with prefix-ordered range scans on binary keys, no joins, single writer** — is precisely the workload LSM-trees were designed to optimize. RocksDB is the most mature and actively maintained LSM implementation available, with Node.js bindings (via `levelup`) providing a clean API.
