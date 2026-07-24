# AGENTS.md - warp-wizard Project Context

## Read This First

You are an AI coding agent working on `warp-wizard`, a CLI tool that automates the installation and management of Cloudflare WARP across multiple operating systems.
Your division of responsibility is absolute: **The human owns approval and judgment; you own how and when.**

## Mandatory Reading Order

1. `AGENTS.md` — this file, the binding contract for all agent behavior.
2. `project-kit/feature-specs/01-master-prompt.md` — the primary feature specification defining exactly how the CLI behaves, OS detection, and installation logic.
3. `docs/FIBER_ROUTER_BUG.md` — the case study explaining *why* this tool exists (specifically to tunnel Postgres port 5432 past DPI middleboxes).
4. `README.md` — public facing documentation.

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
