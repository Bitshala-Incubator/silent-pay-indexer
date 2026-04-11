# Storage Engine Comparison: Why LMDB?

This document explains why LMDB was chosen as the storage engine for the silent payment indexer, and how it compares to alternatives.

## Workload characteristics

The indexer has a specific access profile that heavily influences the storage engine choice:

1. **Write-heavy, append-mostly** - scanning the blockchain from taproot activation (~block 709,632) forward, ingesting every block's P2TR transactions atomically via batch writes
2. **Binary key-value data** - transactions (73 bytes), outputs (41 bytes), and several empty-value indexes, all prefix-encoded
3. **Range scans by sorted key** - `idx:h:<height>`, `idx:bt:<timestamp>`, `idx:us:<txid>:<vout>` - core read patterns are ordered iteration over contiguous key ranges
4. **Point lookups** - `tx:<txid>` for single transaction fetches
5. **Atomic batches** - every block is committed as one atomic transaction (all txns + outputs + indexes + state), with rollback on failure
6. **No relational joins** - outputs are always fetched by txid prefix scan, not via SQL joins

## Why LMDB

LMDB is a **memory-mapped B+ tree** database with properties that align well with the above:

- **Synchronous reads with zero overhead**: reads are direct memory-mapped lookups with no syscalls, no buffer pool management, and no async overhead. Point lookups complete in ~0.5μs. For the indexer's read-heavy API serving (one block every ~10 minutes in steady state), this is ideal.
- **Efficient range scans on sorted keys**: the prefix-based key scheme (`idx:h:<height>:<txid>`) maps directly to LMDB's B+ tree sorted-order iteration. Range scans like "all txns at height X" are a single seek + forward iteration.
- **Atomic transactions**: native MVCC with copy-on-write. All puts and deletes in a transaction are atomic — either all apply or none do. Readers never block writers and vice versa.
- **Zero write amplification**: unlike LSM-tree databases, LMDB has no background compaction that rewrites data. Once written, data is not rewritten until updated. This means predictable, consistent performance with no compaction stalls.
- **Built-in LZ4 compression** (via lmdb-js): ~5 GB/s decompression throughput, applied transparently.
- **Embeddable, no server process**: runs in-process, no network round-trips, no connection pooling, no separate daemon to manage.
- **Prebuilt binaries**: the `lmdb` npm package ships prebuilt native addons for all major platforms (Linux, macOS, Windows, ARM). No C++ compilation required at install time, simplifying CI and Docker builds.
- **Actively maintained**: 4.2M weekly downloads, used in production by Parcel, Elasticsearch Kibana, and HarperDB. Latest release April 2025.

### Write performance at scale

LMDB uses a B+ tree rather than an LSM-tree, which means individual random writes require B-tree page updates rather than sequential log appends. However, the `lmdb-js` library compensates with batched async writes on worker threads, achieving ~1.7M ops/sec in benchmarks. For the indexer's workload — writing one block's worth of transactions every ~10 minutes in steady state — this is more than sufficient.

During initial chain sync (bulk ingestion of thousands of blocks), LSM-tree engines like RocksDB have a theoretical advantage for sequential writes. In practice, LMDB's lack of compaction overhead and predictable latency offset much of this difference: LSM writes are fast but compaction causes periodic stalls, while LMDB writes are consistent.

## Comparisons

### vs. SQLite (previous storage engine)

| Dimension | SQLite | LMDB |
|---|---|---|
| **Read throughput** | B-tree index lookups are efficient, but add SQL parsing, plan generation, type conversion | Direct memory-mapped B+ tree lookup, ~0.5μs, zero overhead |
| **Write throughput** | WAL mode helps, but still B-tree page splits on every insert; single-writer lock | Batched async writes on worker threads, ~1.7M ops/sec |
| **Range scans** | B-tree index range scans are efficient, but rows are stored as text/blob with SQL parsing overhead | Direct sorted-byte iteration, zero SQL parsing, zero type marshalling |
| **Storage size** | No built-in compression; txids and scanTweaks stored as hex strings | LZ4 compression, binary keys/values, significantly smaller |
| **Atomic batches** | `BEGIN/COMMIT` transactions work, but TypeORM added significant overhead | Native MVCC transactions, no ORM layer |
| **Binary data** | Blobs are supported but awkward; 32-byte hashes were stored as 64-char hex strings | Native binary keys and values, 32-byte txid is 32 bytes |
| **Operational** | Single file, easy backups | Directory of data files, but still embedded, no server |

SQLite is a great general-purpose embedded DB, but for this workload (prefix-based range scans, binary data, no joins) it was paying SQL overhead for features that weren't being used.

### vs. RocksDB

RocksDB was initially considered for its LSM-tree write performance, but the Node.js bindings (`rocksdb` npm package) were [discontinued](https://github.com/Level/community#faq) by the Level org with no successor. This made it an unsuitable long-term dependency.

| Dimension | RocksDB | LMDB |
|---|---|---|
| **Write throughput** | LSM sequential writes are fast for bulk ingest, but compaction causes periodic stalls | B+ tree writes are consistent; no compaction stalls. ~1.7M batched ops/sec via lmdb-js |
| **Read throughput** | Must check multiple LSM levels; reads go through block cache | Direct memory-mapped lookup, zero read amplification, ~0.5μs |
| **Write amplification** | High — LSM compaction rewrites data 10-30x over its lifetime | Zero — data is written once (copy-on-write) |
| **Space amplification** | Can use 2-3x storage during compaction | Minimal — no compaction overhead |
| **Compression** | Snappy, LZ4, Zstd, configurable per-level | LZ4 via lmdb-js |
| **Node.js ecosystem** | `rocksdb` npm package deprecated/discontinued | `lmdb` actively maintained, 4.2M weekly downloads, prebuilt binaries |
| **CI/Docker** | Requires C++ toolchain (python3, make, g++) for native compilation; CI workarounds needed | Prebuilt binaries, no compilation required |
| **Operational** | Requires tuning (write buffer size, compaction strategy, block cache) for optimal performance | Near-zero tuning; set max map size and go |

RocksDB's LSM-tree would provide faster bulk writes during initial chain sync, but the deprecated npm bindings, native compilation complexity, and compaction tuning burden outweigh this advantage. LMDB's consistent performance, zero-overhead reads, and healthy ecosystem make it the better choice.

### vs. LevelDB

| Dimension | LevelDB | LMDB |
|---|---|---|
| **Architecture** | LSM-tree | B+ tree, memory-mapped |
| **Compaction** | Single-threaded, causes write stalls at scale | No compaction needed |
| **Read performance** | Must check multiple LSM levels | Direct memory-mapped lookup |
| **Write performance** | Fast sequential writes, but stalls during compaction | Consistent, no stalls |
| **Node.js ecosystem** | `classic-level` is actively maintained | `lmdb` actively maintained, higher adoption (4.2M vs ~200K weekly downloads) |
| **Monitoring** | Minimal | Statistics available via lmdb-js |

LevelDB (via `classic-level`) is a viable alternative, but its single-threaded compaction causes write stalls when indexing ~135M+ transactions. LMDB's compaction-free design avoids this entirely.

### vs. PostgreSQL

| Dimension | PostgreSQL | LMDB |
|---|---|---|
| **Read throughput** | B-tree index scans are efficient, but add SQL parsing, plan generation, type conversion, network serialization | Direct memory-mapped lookup, zero intermediate layers |
| **Write throughput** | B-tree inserts + WAL + MVCC overhead; fine per-block, but bottlenecks at catch-up speed | Batched writes, consistent performance |
| **Storage** | Row-oriented with per-row overhead (~23 byte tuple header, alignment padding, TOAST) | Compact binary with compression; 73-byte tx record is literally 73 bytes |
| **Query flexibility** | Full SQL, window functions, CTEs, aggregates | Key-value only, but sufficient for all 7 read patterns |
| **Operational burden** | Separate server process, connection pooling, vacuuming, backups, monitoring | Embedded, zero ops |
| **Concurrency** | MVCC, multiple writers, row-level locking | Single writer, multiple readers — sufficient for single-process indexer |

PostgreSQL would work for a more complex application (multi-service, complex queries, multiple writers). For a single-purpose blockchain indexer with 7 fixed query patterns and no relational joins, Postgres brings operational and performance overhead without corresponding benefit.

### vs. Cassandra

| Dimension | Cassandra | LMDB |
|---|---|---|
| **Architecture** | Distributed, multi-node, eventual consistency | Single-node, embedded |
| **Operational** | JVM, multi-node cluster, gossip protocol, repair, compaction tuning | Zero ops, embedded |
| **Consistency** | Tunable (ONE, QUORUM, ALL), overkill for single-writer indexer | Strong consistency by default (MVCC) |
| **Scaling** | Horizontal scaling across nodes | Vertical scaling only |

Cassandra is designed for distributed writes across many nodes from many writers with eventual consistency. The indexer is a single process reading a single blockchain sequentially. Cassandra would bring enormous operational complexity for zero benefit.

## Summary

| Database | Write Speed | Read Speed | Range Scans | Ops Burden | Fit |
|---|---|---|---|---|---|
| **LMDB** | Good (consistent) | Excellent | Excellent | None (embedded) | **Best fit** |
| RocksDB | Excellent (with stalls) | Good | Excellent | None (embedded) | Good, but npm bindings deprecated |
| LevelDB | Good (with stalls) | Good | Good | None (embedded) | Good, but stalls at scale |
| SQLite | Moderate | Good (with SQL overhead) | Good (with SQL overhead) | None (embedded) | Workable, but paying SQL tax |
| PostgreSQL | Moderate | Good (with SQL overhead) | Good (with SQL overhead) | High (server process) | Overkill |
| Cassandra | Excellent | Good | Good | Very High (cluster) | Wildly overkill |

The indexer's access pattern — **sequential writes with prefix-ordered range scans on binary keys, no joins, single writer, read-heavy API serving** — aligns well with LMDB's strengths: zero-overhead reads, consistent write performance, atomic transactions, and zero operational burden. The `lmdb` npm package provides a mature, actively maintained binding with prebuilt binaries and built-in TypeScript types.
