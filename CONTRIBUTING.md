# Contributing to warp-wizard

First off, thank you for considering contributing to `warp-wizard`! It's people like you that make this tool such a great utility for everyone.

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally.
3. Install dependencies: `npm install`
4. Make your changes and test them locally.

## Testing

This project uses Vitest. Please run tests before submitting a pull request:
```bash
npm run test
```

## Pull Request Process

1. Ensure any install or update instructions are kept up-to-date.
2. Make sure the tests pass.
3. Update the README.md with details of changes if applicable.
4. Open a pull request against the `main` branch.

## Maintainer Releases

Pushing to `main` does not publish to NPM. Maintainers should use the GitHub Actions `Publish to NPM` workflow on `main`, choose the version bump, and let CI run tests, create the release commit/tag, create the GitHub Release, dry-run the package, and publish through NPM Trusted Publishing (OIDC).

Local shortcut from a clean `main`:

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

Every publish needs a new SemVer. Do not use long-lived NPM publish tokens. Sources: https://docs.npmjs.com/trusted-publishers/ and https://docs.npmjs.com/cli/v12/commands/npm-version/.

## Code of Conduct

Please be respectful and considerate of others. Harassment or abusive behavior will not be tolerated.
