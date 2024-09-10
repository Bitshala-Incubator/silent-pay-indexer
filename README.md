# Silent Payment Indexer

A service that simplifies receiving Bitcoin silent payments for wallets and applications.

> [!WARNING]
> This application is currently in an experimental stage and should be used with caution. It has not undergone extensive testing and may contain bugs, vulnerabilities, or unexpected behavior. Mainnet use is strictly NOT recommended.

## :ledger: Table of Contents

- [Silent Payment Indexer](#silent-payment-indexer)
  - [:ledger: Table of Contents](#ledger-table-of-contents)
  - [:beginner: About](#beginner-about)
  - [:station: Features](#station-features)
  - [:electric\_plug: Installation](#electric_plug-installation)
    - [:notebook: Prerequisites](#notebook-prerequisites)
    - [:wrench: Configuration](#wrench-configuration)
    - [:rocket: Running the Application](#rocket-running-the-application)
  - [:file\_folder: File Structure](#file_folder-file-structure)
    - [src Directory Structure](#src-directory-structure)
  - [:cherry\_blossom: Community](#cherry_blossom-community)
    - [:fire: Contribution](#fire-contribution)
  - [:wrench: Experimental Warning](#wrench-experimental-warning)

## :beginner: About

Silent Payment Indexer is a service designed to efficiently index and organize Bitcoin silent payment data, simplifying the process of receiving silent payments for wallets and applications. By providing a reliable and performant indexing solution, this project aims to also accelerate the adoption of silent payments on the Bitcoin network.

Read more about silent payments in [BIP 352](https://github.com/bitcoin/bips/pull/1458) and [Ruben Somsen's post](https://gist.github.com/RubenSomsen/c43b79517e7cb701ebf77eec6dbb46b8).

## :station: Features

-   **Efficient Indexing:** Processes Bitcoin blocks to extract silent payment data.
-   **Structured Data Storage:** Stores indexed data for easy retrieval.
-   **API Queries:** Enables applications to search for specific silent payment information.
-   **Continuous Updates:** Maintains data freshness by indexing new blocks.

## :electric_plug: Installation

1. Clone the repository:

```bash
  $ git clone https://github.com/Bitshala-Incubator/silent-pay-indexer.git
```

2. Navigate to the project directory:

```bash
  $ cd silent-pay-indexer
```

3. Install dependencies:

```bash
  $ npm install
```

### :notebook: Prerequisites

-   Node.js
-   Docker (optional)

### :wrench: Configuration

-   Create a `config.yaml` file in the project config folder. e.g:

```bash
    $ cd config
    $ cp config.yaml test.config.yaml
```

-   Set the necessary environment variables (e.g., provider type, app port, etc.).

### :rocket: Running the Application

```bash
    $ npm run start:dev
```

## :file_folder: File Structure

This is a basic overview of the project structure, it reflects the main components of the silent payment indexer application. The `src` directory is further divided into subdirectories based on the different functionalities of the application.

```console
├── config
├── docs
├── dev
├── src
│   ├── block-data-providers
│   ├── common
│   ├── indexer
│   ├── operation-state
│   ├── transactions
│       ├── controller.ts
│       ├── service.ts
│   ├── controller.ts
│   └── configuration.ts
│   └── main.ts
```

| Directory/File | Description                                                |
| -------------- | ---------------------------------------------------------- |
| **`config`**   | Stores configuration files for the project                 |
| **`dev   `**   | Contains development-specific files (e.g., Docker Compose) |
| **`docs  `**   | Contains documentation files (e.g., design.md)             |
| **`src   `**   | Contains the source code for the application               |

### src Directory Structure

| Directory/File             | Description                                                                       |
| -------------------------- | --------------------------------------------------------------------------------- |
| **`block-data-providers`** | Contains logic for fetching data from different block data providers periodically |
| **`common`**               | Contains shared utility functions and constants                                   |
| **`indexer`**              | Contains the core logic for indexing silent payments                              |
| **`operation-state`**      | Handles the state of indexing operations                                          |
| **`transactions`**         | Handles transaction-related logic and API querying requests                       |
| **`configuration`**        | Handles project configuration                                                     |

## :cherry_blossom: Community

The dev community lurks in a small corner of Discord [here](https://discord.gg/Rfyp2nRGj7) (say 👋, if you drop there from this readme).

Dev discussions predominantly happen via FOSS best practices, and by using Github as the Community Forum.

### :fire: Contribution

We welcome and encourage contributions to this actively developed project! For details on contributing, please refer to [CONTRIBUTING.md](CONTRIBUTING.md).

Few directions for new contributors:

-   The list of [issues](https://github.com/Bitshala-Incubator/silent-pay-indexer/issues) is a good place to look for contributable tasks and open problems.

-   Issues marked with [`good first issue`](https://github.com/Bitshala-Incubator/silent-pay-indexer/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) are good places to get started.

-   Tests are a good place to start gathering a contextual understanding of the codebase.

-   Reviewing [open PRs](https://github.com/Bitshala-Incubator/silent-pay-indexer/pulls) are a good place to understand the codebase and the contribution process.

## :wrench: Experimental Warning

This service is experimental and under active development. By using it, you acknowledge the following:

1. **Risk of Loss of Funds:** Using this service may result in the loss of your funds. You should be aware that any funds you use with this service are at risk and could become inaccessible or irretrievable.
2. **No Guarantee of Performance:** The service may not perform as expected and may lead to unintended outcomes, including data loss, loss of funds, or other adverse effects.
3. **No Warranty:** There is no warranty provided for this service. It is distributed "as is" without any guarantees of functionality, security, or reliability.
4. **Security Considerations:** This service may contain security vulnerabilities or weaknesses that could expose your data or funds to risks. You are responsible for conducting your own security assessments and risk evaluations.
5. **Limited Documentation:** The documentation for this service may be incomplete, inaccurate, or outdated.
6. **API and Compatibility Changes:** This code is subject to frequent changes, including modifications to its API, features, or compatibility with other software. These changes may affect your ability to use the service effectively.

We strongly recommend using this service for testing and development purposes only.

**Use it at your own risk.**