# Silent Pay Indexer - Complete Development Setup Guide

## Table of Contents
- [About the Project](#about-the-project)
- [What is Polar and Why Use It](#what-is-polar-and-why-use-it)
- [Prerequisites](#prerequisites)
- [Complete Setup Guide](#complete-setup-guide)
- [Configuration Details](#configuration-details)
- [Running the Project](#running-the-project)
- [Verification and Testing](#verification-and-testing)
- [Troubleshooting](#troubleshooting)
- [Development Workflow](#development-workflow)

---

## About the Project

**Silent Payment Indexer** is a NestJS-based service that indexes Bitcoin silent payment data, making it easier for wallets and applications to receive silent payments. It processes Bitcoin blocks, extracts silent payment information, and provides APIs for querying this data.

### Key Features
- Efficient indexing of Bitcoin blocks for silent payment data
- REST API for querying indexed data
- WebSocket support for real-time updates
- Support for multiple data providers (Bitcoin Core RPC, Esplora)
- TypeORM with SQLite for data persistence

### Technology Stack
- **Backend**: NestJS (Node.js framework)
- **Database**: SQLite with TypeORM
- **Bitcoin Integration**: Bitcoin Core RPC or Esplora API
- **Testing**: Jest (unit tests), E2E tests with Docker

---

## What is Polar and Why Use It

### What is Polar?

**Polar** is a one-click Bitcoin and Lightning network simulator for local development. It's a desktop application that provides:
- Visual network management interface
- Instant Bitcoin regtest node deployment
- Lightning Network node support
- Block mining with a single click
- Easy RPC credential access
- Network topology visualization

**Download**: https://lightningpolar.com/

### Why Polar is Perfect for This Project

| Feature | Benefit |
|---------|---------|
| **GUI Interface** | No need to manually configure bitcoin.conf or manage Docker containers |
| **Instant Setup** | Create a working Bitcoin node in under 30 seconds |
| **RPC Credentials** | Credentials displayed clearly in the UI - no guessing |
| **Block Mining** | Mine blocks instantly to test the indexer's functionality |
| **Network Management** | Start/stop nodes easily, view logs, monitor connections |
| **Regtest Network** | Safe testing environment with no risk to real funds |

### Alternatives to Polar

1. **Docker Compose**: Manual setup, requires creating docker-compose.yml (see `e2e/helpers/docker/`)
2. **Bitcoin Core Manual Install**: Most complex, requires bitcoin.conf configuration
3. **Esplora Provider**: Can use public testnet APIs, but less control over the environment

---

## Prerequisites

### Required Software
- **Node.js**: v18 or v20 LTS (recommended)
  - v22+ may have issues with native module compilation
  - Download: https://nodejs.org/
- **Polar**: Latest version
  - Download: https://lightningpolar.com/
- **npm**: Comes with Node.js installation

### Optional Software
- **Docker**: If you want to use Docker instead of Polar
- **Git**: For version control (already installed if you cloned the repo)

### System Requirements
- **OS**: Windows, macOS, or Linux
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 2GB for dependencies and blockchain data

---

## Complete Setup Guide

### Step 1: Install Node.js

1. Download Node.js v18 or v20 LTS from https://nodejs.org/
2. Run the installer with default options
3. Verify installation:
   ```bash
   node --version  # Should show v18.x.x or v20.x.x
   npm --version   # Should show 9.x.x or 10.x.x
   ```

### Step 2: Install Project Dependencies

1. Navigate to the project directory:
   ```bash
   cd C:\Users\RiH\Desktop\Open Source\silent-pay-indexer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

   **Note**: If you encounter build errors with `better-sqlite3`, ensure you're using Node.js v18 or v20 LTS.

### Step 3: Download and Install Polar

1. Go to https://lightningpolar.com/
2. Download the Windows installer
3. Run the installer (standard installation process)
4. Launch Polar

### Step 4: Create a Bitcoin Network in Polar

1. **Open Polar** - You'll see the main dashboard
2. Click **"Create Network"** (or similar button)
3. Configure your network:
   - **Network Name**: `silent-pay-dev` (or any name you prefer)
   - **Bitcoin Nodes**: Select **1** Bitcoin Core node
   - **LND/c-lightning/Eclair Nodes**: Set all to **0** (not needed for this project)
4. Click **"Create Network"**
5. You'll see a visual graph with your Bitcoin node

### Step 5: Start the Bitcoin Node

1. Click the **"Start"** button (play icon ▶) at the top of the network view
2. Wait 5-10 seconds for the node to initialize
3. The Bitcoin node circle/box will turn **green** when ready
4. You should see status showing "Running" or similar

### Step 6: Get RPC Credentials from Polar

1. **Click on the Bitcoin Core node** in the network graph
2. A sidebar will appear on the right with node details
3. Look for tabs labeled **"Connect"**, **"Info"**, or **"RPC"**
4. Note the following credentials:
   ```
   RPC Host: localhost (or 127.0.0.1)
   RPC Port: 18443 (regtest default)
   RPC User: polaruser (or as shown in Polar)
   RPC Password: polarpass (or as shown in Polar)
   ```

### Step 7: Configure dev.config.yaml

Your configuration file is located at: `config/dev.config.yaml`

**Update the bitcoinCore section** with the credentials from Polar:

```yaml
db:
  path: '~/.silent-pay-indexer/db/database.sqlite'
  synchronize: true  # Auto-create database tables in dev

app:
  port: 80  # The port your indexer API will run on
  verbose: false
  debug: true
  network: regtest  # Must match Polar (regtest)
  requestRetry:
    delay: 500
    count: 3

providerType: BITCOIN_CORE_RPC  # Using Bitcoin Core RPC

bitcoinCore:
  protocol: http
  rpcHost: localhost
  rpcPass: polarpass      # ← Update from Polar
  rpcUser: polaruser      # ← Update from Polar
  rpcPort: 18443          # ← Update from Polar (usually 18443 for regtest)

throttler:
  ttl: 1000
  limit: 5

cache:
  ttl: 5000
```

**Important**: The current default values (`polaruser`/`password`) may work, but verify against what Polar displays!

### Step 8: Mine Initial Blocks in Polar

Before starting the indexer, create some blockchain data:

1. In Polar, ensure your Bitcoin node is selected (clicked)
2. Find the **"Actions"** panel or similar section
3. Look for **"Mine Blocks"** button or field
4. Enter **100** (or any number between 10-200)
5. Click **"Mine"** or **"Generate"**
6. You'll see the block count increase in the node display

**Why?** The indexer needs blocks to process. Starting with empty blockchain means nothing to index.

---

## Running the Project

### Development Mode (with Hot Reload)

```bash
npm run start:dev
```

**What happens:**
- Loads configuration from `config/dev.config.yaml`
- Connects to SQLite database at `~/.silent-pay-indexer/db/database.sqlite`
- Auto-creates database tables (because `synchronize: true`)
- Connects to Bitcoin Core RPC (your Polar node)
- Starts indexing blocks
- Starts HTTP server on port 80
- Enables hot reload (file changes restart the app)

### Production Mode

```bash
npm run build
npm run start:prod
```

### Other Useful Commands

```bash
# Run unit tests
npm run test

# Run E2E tests (requires Bitcoin node)
npm run test:e2e

# Check code formatting
npm run format:check

# Fix code formatting
npm run format:fix

# Check TypeScript types
npm run types:check

# Lint code
npm run lint:check

# Database migrations
npm run migration:run
```

---

## Configuration Details

### Environment Detection

The app automatically loads config based on `NODE_ENV`:
- `NODE_ENV=dev` → `config/dev.config.yaml`
- `NODE_ENV=e2e` → `config/e2e.config.yaml`
- Default → `config/config.yaml`

Your `npm run start:dev` script sets `NODE_ENV=dev` automatically.

### Configuration Override with Environment Variables

You can override any config value using environment variables:

```bash
# Override RPC password
DB_PATH="C:/custom/path/database.sqlite" npm run start:dev

# Override multiple values
APP_PORT=3000 BITCOIN_CORE_RPC_PORT=18443 npm run start:dev
```

Variable naming convention: `SECTION_KEY` in UPPER_SNAKE_CASE
- `db.path` → `DB_PATH`
- `bitcoinCore.rpcPort` → `BITCOIN_CORE_RPC_PORT`
- `app.port` → `APP_PORT`

### Configuration File Structure

| Section | Purpose |
|---------|---------|
| `db` | Database configuration (path, synchronization) |
| `app` | Application settings (port, network, logging) |
| `providerType` | Data source type (BITCOIN_CORE_RPC or ESPLORA) |
| `bitcoinCore` | Bitcoin Core RPC connection settings |
| `esplora` | Esplora API settings (if using Esplora provider) |
| `throttler` | API rate limiting configuration |
| `cache` | Response caching settings |

### Important Config Values

**db.synchronize**:
- `true` → TypeORM auto-creates/updates tables (dev only!)
- `false` → Manual migrations required (production)

**app.network**:
- `regtest` → Local testing (use with Polar)
- `testnet` → Bitcoin testnet
- `mainnet` → Bitcoin mainnet (NOT RECOMMENDED - experimental project)

**providerType**:
- `BITCOIN_CORE_RPC` → Connect to Bitcoin Core node (Polar, local node)
- `ESPLORA` → Use Esplora HTTP API (public endpoints)

---

## Verification and Testing

### 1. Check Application Logs

When the app starts successfully, you should see:

```
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO [RouterExplorer] Mapped {/silent-block/latest-height, GET} route
[Nest] INFO [RouterExplorer] Mapped {/transactions/:scan_pubkey, GET} route
[Nest] INFO [IndexerService] Starting indexer...
[Nest] INFO [IndexerService] Current height: 100
```

### 2. Test API Endpoints

Open your browser or use curl:

**Get Latest Block Height**:
```bash
http://localhost/silent-block/latest-height
```

**API Documentation (Swagger)**:
```bash
http://localhost/api
```

**Query Transactions**:
```bash
http://localhost/transactions/{scan_pubkey}
```

### 3. WebSocket Connection

The indexer supports WebSocket for real-time updates:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost/silent-blocks');

ws.on('message', (data) => {
  console.log('New block indexed:', data);
});
```

### 4. Mine More Blocks in Polar

1. Go back to Polar
2. Mine 10 more blocks
3. Watch the indexer logs - should show processing of new blocks
4. Check the API - latest height should increase

---

## Troubleshooting

### Error: `ECONNREFUSED` to localhost:18443

**Cause**: Indexer can't connect to Bitcoin Core RPC

**Solutions**:
1. ✅ Verify Polar network is **started** (green status in Polar)
2. ✅ Check RPC credentials in `config/dev.config.yaml` match Polar's display
3. ✅ Ensure no firewall blocking localhost:18443
4. ✅ Verify `rpcPort` matches Polar (usually 18443 for regtest)
5. ✅ Try restarting the Polar network

### Error: `SqliteError: no such table: operation_state`

**Cause**: Database tables not created

**Solutions**:
1. ✅ Ensure `db.synchronize: true` in `config/dev.config.yaml`
2. ✅ Delete the database file and restart:
   ```bash
   rm -rf ~/.silent-pay-indexer/db/
   npm run start:dev
   ```
3. ✅ Run migrations manually:
   ```bash
   npm run migration:run
   ```

### Error: `gyp ERR!` or `better-sqlite3` build errors

**Cause**: Node.js version compatibility or missing build tools

**Solutions**:
1. ✅ Switch to Node.js v18 or v20 LTS (avoid v22+)
2. ✅ On Windows, install Visual Studio Build Tools
3. ✅ Clear npm cache and reinstall:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

### Polar Network Won't Start

**Solutions**:
1. ✅ Close and reopen Polar
2. ✅ Check if port 18443 is already in use:
   ```bash
   netstat -ano | findstr :18443
   ```
3. ✅ Create a new network with a different name
4. ✅ Check Polar logs for specific errors

### Application Starts but No Blocks Indexed

**Solutions**:
1. ✅ Verify Bitcoin node has blocks (check Polar display)
2. ✅ Mine some blocks in Polar (see Step 8 above)
3. ✅ Check indexer logs for connection errors
4. ✅ Verify `app.network` matches Polar network type (regtest)

### Port 80 Already in Use

**Error**: `EADDRINUSE: address already in use`

**Solutions**:
1. ✅ Change the port in `config/dev.config.yaml`:
   ```yaml
   app:
     port: 3000  # or any available port
   ```
2. ✅ Or set via environment variable:
   ```bash
   APP_PORT=3000 npm run start:dev
   ```

---

## Development Workflow

### Daily Development

1. **Start Polar network** (if not running)
2. **Run the indexer**: `npm run start:dev`
3. Make code changes (app auto-reloads)
4. **Test with API calls** or **mine blocks in Polar**
5. **Run tests**: `npm run test`

### Testing New Features

1. Make code changes
2. Write unit tests in `*.spec.ts` files
3. Run specific test: `npm run test -- <test-file>`
4. Run all tests: `npm run test`
5. Run E2E tests: `npm run test:e2e` (requires Bitcoin node)

### Database Changes

**If you modify entities** (files ending in `.entity.ts`):

1. **Option A - Dev Mode (Auto-sync)**:
   - Set `db.synchronize: true` in dev config
   - Restart the app (tables auto-update)

2. **Option B - Production-like (Migrations)**:
   ```bash
   # Generate migration
   npm run migration:generate

   # Run migration
   npm run migration:run

   # Revert last migration
   npm run migration:revert
   ```

### Debugging

**VS Code Launch Configuration** (`.vscode/launch.json`):
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug NestJS",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "start:debug"],
  "console": "integratedTerminal"
}
```

Set breakpoints in your code and press F5 to debug.

### Best Practices

1. ✅ **Never commit `dev.config.yaml`** - It's in `.gitignore` for a reason
2. ✅ **Use `example.config.yaml`** as a reference for structure
3. ✅ **Keep Polar running** while developing
4. ✅ **Mine blocks periodically** to test indexing
5. ✅ **Run tests before pushing** code
6. ✅ **Use signed commits** (project requirement)
7. ✅ **Follow commit conventions**: feat:, fix:, chore:, docs:, etc.

---

## Quick Reference Card

### Starting the Project
```bash
# 1. Start Polar network (GUI)
# 2. Run indexer
npm run start:dev
```

### Key Endpoints
- API Docs: `http://localhost/api`
- Latest Height: `http://localhost/silent-block/latest-height`
- Query Txs: `http://localhost/transactions/{scan_pubkey}`

### Key Files
- **Config**: `config/dev.config.yaml`
- **Database**: `~/.silent-pay-indexer/db/database.sqlite`
- **Logs**: `app.log` (in project root)
- **Migrations**: `migrations/` directory

### Common Issues
| Issue | Quick Fix |
|-------|-----------|
| ECONNREFUSED | Start Polar network |
| No such table | Set `synchronize: true` |
| Port in use | Change `app.port` in config |
| Build errors | Use Node v18/v20 LTS |

---

## Project Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────┐
│                   Client/Wallet                     │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP/WebSocket
┌───────────────────────▼─────────────────────────────┐
│            Silent Payment Indexer API               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ Controllers  │  │  WebSocket   │  │  Swagger │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┘  │
│         │                 │                         │
│  ┌──────▼─────────────────▼───────┐                │
│  │       Services                 │                │
│  │  - SilentBlocksService         │                │
│  │  - TransactionsService         │                │
│  │  - IndexerService              │                │
│  └──────┬─────────────────────────┘                │
│         │                                           │
│  ┌──────▼─────────────────────────┐                │
│  │      TypeORM + SQLite          │                │
│  │  - Transactions                │                │
│  │  - Transaction Outputs         │                │
│  │  - Block State                 │                │
│  │  - Operation State             │                │
│  └────────────────────────────────┘                │
└───────────────────────┬─────────────────────────────┘
                        │ RPC
┌───────────────────────▼─────────────────────────────┐
│         Block Data Provider                         │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ Bitcoin Core RPC │  │  Esplora API     │        │
│  └────────┬─────────┘  └─────────┬────────┘        │
└───────────┼─────────────────────┼──────────────────┘
            │                     │
┌───────────▼─────────┐   ┌──────▼──────────────────┐
│   Polar Bitcoin     │   │  Public Esplora         │
│   Regtest Node      │   │  Instances              │
└─────────────────────┘   └─────────────────────────┘
```

### Module Structure

| Module | Responsibility |
|--------|---------------|
| `AppModule` | Root module, imports all other modules |
| `IndexerModule` | Core indexing logic, block processing |
| `SilentBlocksModule` | Silent block API and WebSocket |
| `TransactionsModule` | Transaction queries and endpoints |
| `BlockProviderModule` | Abstraction for Bitcoin data sources |
| `OperationStateModule` | Indexer state persistence |
| `BlockStateModule` | Block processing state tracking |
| `DbTransactionModule` | Database transaction management |

---

## Additional Resources

- **Project Repository**: https://github.com/Bitshala-Incubator/silent-pay-indexer
- **BIP 352 (Silent Payments)**: https://github.com/bitcoin/bips/pull/1458
- **Polar Documentation**: https://docs.lightningpolar.com/
- **NestJS Documentation**: https://docs.nestjs.com/
- **TypeORM Documentation**: https://typeorm.io/
- **Discord Community**: https://discord.gg/Rfyp2nRGj7

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## Warning

⚠️ **This is experimental software**. Do NOT use on mainnet. Risk of loss of funds. Use for testing and development only.

---

**Last Updated**: February 9, 2026
**Version**: 0.0.1
**Status**: Experimental / Active Development
