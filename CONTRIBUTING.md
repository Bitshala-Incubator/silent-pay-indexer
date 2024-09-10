# Contributing to Silent Pay Indexer

Thank you for considering contributing to the Silent Pay Indexer project! We welcome contributions of all kinds, including new features, bug fixes, documentation improvements, and more. This document outlines the process for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
   - [Reporting Bugs](#reporting-bugs)
   - [Suggesting Enhancements](#suggesting-enhancements)
   - [Submitting Pull Requests](#submitting-pull-requests)
4. [Development Workflow](#development-workflow)
5. [Style Guides](#style-guides)
   - [Git Commit Messages](#git-commit-messages)
   - [Code Style](#code-style)
6. [Community](#community)
7. [License](#license)

## Code of Conduct

Be respectful, inclusive, and considerate in all interactions. Harassment, discrimination, and disruptive behavior will not be tolerated. Report any unacceptable behavior to the project maintainers. Violations may result in removal from the project.

## Getting Started

To get started with contributing, you will need to fork the repository and clone it to your local machine. You can do this by running the following commands:

```sh
git clone https://github.com/your-username/silent-pay-indexer.git
cd silent-pay-indexer
```

Next, install the project dependencies:

```sh
npm install
```

### Starting a Bitcoin Node

You can start a Bitcoin node by using Docker or Polar:

- **Docker**: Use the Docker Compose file located in the e2e test folder. Be sure to modify the dev.config.yaml file by changing the RPC user to "alice", the RPC password to "password", and the port to 18443.

  ```sh
  docker compose -f "./e2e/helpers/docker/docker-compose.yml" up -d
  ```

- **Polar**: Download and set up [Polar](https://lightningpolar.com/) to create a local Bitcoin network with multiple nodes easily.


## How to Contribute

### Reporting Bugs

If you find a bug in the project, please create an issue in the issue tracker. Provide as much detail as possible, including steps to reproduce the bug, the expected behavior, and any relevant screenshots or logs.

### Suggesting Enhancements

If you have an idea for a new feature or an improvement to an existing feature, please create an issue in the issue tracker. Describe your idea in detail and explain why it would be beneficial to the project.

### Submitting Pull Requests

1. **Fork the repository**: Click the "Fork" button at the top of the repository page.
2. **Clone your fork**: Clone your forked repository to your local machine.
3. **Create a branch**: Create a new branch for your work.

    ```sh
    git checkout -b feature/your-feature-name
    ```

4. **Make your changes**: Implement your changes in the new branch.

5. **Signed and Verified Commits**: Ensure that all commits are signed and verified. Only signed and verified commits can be merged into the main repository.

    Learn more about [GPG keys and signing commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-gpg-key-to-your-github-account).

6. **Commit your changes**: Commit your changes with a clear and descriptive commit message.

    ```sh
    git commit -m "feat: your feature description"
    ```

7. **Rebase onto the `main` branch**: Before pushing, rebase your changes onto the `main` branch to ensure they are up-to-date.

    ```sh
    git fetch upstream
    git rebase upstream/main
    ```

8. **Push your changes**: Push your changes to your forked repository.

    ```sh
    git push origin feature/your-feature-name
    ```

9. **Create a pull request**: Go to the original repository and create a pull request from your forked repository. Provide a clear and detailed description of your changes.

## Development Workflow

1. **Sync with upstream**: Before starting any work, ensure your fork is up-to-date with the upstream repository.

    ```sh
    git fetch upstream
    git checkout main
    git merge upstream/main
    ```

2. **Run tests**: Ensure that all tests pass before submitting a pull request.

    ```sh
    npm run test
    ```

3. **Write tests**: If you are adding new functionality, write tests to cover your changes.

## Style Guides

### Git Commit Message Conventions

When making commits, adhere to the following guidelines:

- **feat:** Introduces a new feature
- **fix:** Addresses a bug
- **chore:** Routine tasks or maintenance
- **docs:** Updates to documentation
- **style:** Changes related to code style (e.g., formatting, missing semicolons)
- **refactor:** Code changes that neither fix bugs nor add features
- **test:** Adding or updating tests

**Guidelines:**
- Use the present tense ("Add feature" rather than "Added feature").
- Employ the imperative mood ("Move cursor to..." instead of "Moves cursor to...").
- Limit the first line to 72 characters or fewer.
- Reference issues and pull requests as appropriate.

### Code Style

- Follow the existing code style in the project.
- Use Prettier for code formatting.
- Ensure your code passes ESLint checks.
- Ensure your code passes Unit and End-to-End tests.

## Community

Join our community on [Discord](https://discord.gg/KnuEQKDMpY) to discuss the project, ask questions, and collaborate with other contributors.

## License

By contributing to Silent Pay Indexer, you agree that your contributions will be licensed under the MIT License.
