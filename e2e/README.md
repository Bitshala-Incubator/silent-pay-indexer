# End-to-End Testing Setup

This guide explains how to run end-to-end (E2E) tests for our Silent Indexer application using a `Makefile`. The steps include installing `make`, setting up PM2, and executing the tests.

## Prerequisites

- Node.js and npm must be installed on your machine. You can download them from [Node.js official website](https://nodejs.org/).

## Step 1: Install `make`

### On Linux

Most Linux distributions come with `make` pre-installed. If not, you can install it using your package manager.

For **Debian/Ubuntu**:

```bash
sudo apt-get update
sudo apt-get install make
```

## Step 2: Install Dependencies

1. Run the following command to install the npm dependencies specified in package.json:

   ```bash
      npm install
   ```
This command will download all the packages listed in dependencies and devDependencies from the npm registry.


## Step 3: Run e2e
Ensure you are in __e2e__ directory and that port 3000 is free.

1. **Run the following command** to run e2e test using make:

   ```bash
   make
   ```
