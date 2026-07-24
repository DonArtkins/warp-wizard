# AGENTS.md - warp-wizard Project Context

## Read This First

You are an AI coding agent working on `warp-wizard`, a CLI tool that automates the installation and management of Cloudflare WARP across multiple operating systems.
Your division of responsibility is absolute: **The human owns approval and judgment; you own how and when.**

## Mandatory Reading Order

1. `AGENTS.md` — this file, the binding contract for all agent behavior.
2. `project-kit/feature-specs/01-master-prompt.md` — the primary feature specification defining exactly how the CLI behaves, OS detection, and installation logic.
3. `docs/FIBER_ROUTER_BUG.md` — the case study explaining *why* this tool exists (specifically to tunnel Postgres port 5432 past DPI middleboxes).
4. `README.md` — public facing documentation.

## CI/CD & Publishing

**Package scope:** `warp-wizard-cli` — published to **NPM** (`npmjs.org`).

| File | Purpose |
|---|---|
| `.github/workflows/ci.yml` | Build-if-present + unit tests on push/PR across `ubuntu-latest`, `macos-latest`, `windows-latest` (Node 22.14.0), plus package dry-run on Ubuntu |
| `.github/workflows/publish.yml` | Automated versioning, GitHub Release creation, package dry-run, and NPM publish via NPM Trusted Publishing (OIDC) |
| `scripts/bump-version.js` | Local maintainer helper for test → `npm version` → push commit/tag → create GitHub Release |

**Release workflow:**

1. A plain push to `main` **never publishes to NPM**. It only updates GitHub and runs CI.
2. Preferred automated path: GitHub Actions → `Publish to NPM` → `Run workflow` on `main` → choose `patch`, `minor`, `major`, a prerelease bump, or an exact SemVer. The workflow runs tests, bumps `package.json` and `package-lock.json`, commits, tags `vX.Y.Z`, verifies package contents with `npm publish --dry-run`, creates the GitHub Release, then publishes to NPM via OIDC.
3. Local maintainer path: from a clean `main`, run `npm run release:patch`, `npm run release:minor`, or `npm run release:major`. The helper runs tests, runs `npm version`, pushes the release commit/tag, and creates the GitHub Release with `gh`. That human-created release triggers `publish.yml`.
4. Manual fallback: run `npm version patch|minor|major -m "chore(release): %s"`, push `main` and the tag, then publish a GitHub Release for that exact tag.
5. Every publish must use a never-before-published SemVer. NPM rejects reusing an existing package version permanently.
6. Do **not** add or use long-lived NPM publish tokens. This package uses NPM Trusted Publishing (OIDC); the package's trusted publisher must point at repository `DonArtkins/warp-wizard`, workflow filename `publish.yml`, with `npm publish` allowed.

**Release-source facts agents must preserve:**

- NPM Trusted Publishing uses OIDC and removes the need for long-lived publish tokens: https://docs.npmjs.com/trusted-publishers/
- Trusted Publishing requires a GitHub Actions trusted-publisher workflow filename, and the workflow needs `id-token: write`: https://docs.npmjs.com/trusted-publishers/
- `npm version` updates package metadata and, in a clean git repo, creates the release commit and tag: https://docs.npmjs.com/cli/v12/commands/npm-version/
- GitHub Release workflows should listen for `release: types: [published]`, especially when drafts/prereleases are involved: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#release
- Events created by the default `GITHUB_TOKEN` do not recursively trigger most other workflows, so manual-dispatch release automation must bump, release, and publish inside the same workflow run: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow#triggering-a-workflow-from-a-workflow
- GitHub/npm announced that 2FA-bypass tokens lose sensitive account-management powers around August 2026 and direct publish power around January 2027, so OIDC is the required automation path: https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/

**Zero-install:** `npx warp-wizard-cli` (works globally out-of-the-box).

## Required Skills

**CRITICAL DIRECTIVE: AI agents MUST ALWAYS use Context7 and check for any specific agent skills.**
If you need to verify APIs for Node.js, `execa`, `@clack/prompts`, `citty`, or `picocolors`, use Context7 to read the latest docs. Do not assume APIs are the same as your training data.

## Feature Implementation Order

Feature specs are in `project-kit/feature-specs/`. Implement them in strict numeric order.
For every feature:
1. Create a feature branch.
2. Present a concrete implementation plan to the user.
3. Implement the feature.
4. Write unit tests (we use Vitest). Run `npm run test`.
5. Only merge when tests and security checks pass.

## Hard Rules

0. **Contract synchronization is a hard gate that CANNOT be bypassed under ANY circumstances.**
   If you change the CLI interface, subcommands, or install logic, you MUST update the `README.md` and `01-master-prompt.md` to reflect the actual implementation.

   **ABSOLUTE VERIFICATION GATE - NO EXCEPTIONS:**
   Before any commit, push, or PR, the following must pass:
   1. `npm run test` — all tests must pass with zero failures.

1. Root `AGENTS.md` is the only active agent entry point.
2. Plan before implementation. Show the user a concrete plan before generating code.
3. Every recommendation must cite a source (e.g. Cloudflare's own docs).
4. All AI agents MUST read AGENTS.md before, during, and after every operation.
5. **API THROTTLING PREVENTION AND RECOVERY (CRITICAL):**
   - Batch file operations.
   - Use glob patterns.
   - Consolidate writes.
   - If throttled, pause for 5 seconds and recover. Never make 10+ rapid sequential tool calls without pauses.
