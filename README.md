# warp-wizard
Cross-Platform Cloudflare WARP Installer & Manager CLI.

## Installation

Zero-install via npx:
```bash
npx warp-wizard-cli
```

Permanent self-install script:
```bash
curl -fsSL https://raw.githubusercontent.com/DonArtkins/warp-wizard/main/scripts/install.sh | sh
```

## Commands

| Command | Description |
|---|---|
| `warp-wizard status` | Show current WARP connection status |
| `warp-wizard toggle` | Connect or disconnect WARP |
| `warp-wizard doctor` | Run diagnostics and detect DPI blocking |
| `warp-wizard update` | Update the wizard and check WARP client version |
| `warp-wizard uninstall` | Remove the wizard (add `--purge` to also remove WARP) |

## Usage Guidance: CLI vs GUI

| Situation | Use |
|---|---|
| Headless server / SSH session / CI | `warp-cli` — there's usually no GUI to use |
| Wrapping automation — npm pre-scripts, migration commands, CI steps | `warp-cli` — scriptable, no clicking |
| Local desktop, day-to-day toggling | The system tray icon (`warp-taskbar` on Linux) |
| First-time setup, or anything going wrong | `warp-wizard doctor` before anything else |
| Advanced config: split tunnel, DNS families, custom modes | Still CLI-only (`warp-cli tunnel ip`, etc.) |
| About to use a platform with an anti-VPN/proxy policy | **Disconnect first** — `warp-cli disconnect` or `warp-wizard toggle` |

## Troubleshooting (DPI Blocks)

If you are on a network where your ISP or upstream router uses DPI (Deep Packet Inspection) to drop specific traffic (like Postgres on port 5432), WARP tunnels that traffic and bypasses the DPI middlebox. Use `warp-wizard doctor` to automate checking for this specific DPI signature (TCP handshake completes, then resets).

The Debian / Parrot OS path in the wizard intentionally follows the field-tested command sequence from [docs/FIBER_ROUTER_BUG.md](docs/FIBER_ROUTER_BUG.md) and [docs/README.md](docs/README.md):

```bash
# Add Cloudflare GPG key and repo
curl -fsSL https://pkg.cloudflareclient.com/pubkey.gpg | sudo gpg --yes --dearmor --output /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg
CODENAME=$(lsb_release -cs 2>/dev/null || echo "bookworm")
if ! curl -s --head https://pkg.cloudflareclient.com/dists/$CODENAME/Release | grep -q "200 OK"; then CODENAME="bookworm"; fi
echo "deb [signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ $CODENAME main" | sudo tee /etc/apt/sources.list.d/cloudflare-client.list

# Install WARP
sudo apt-get update && sudo apt-get install cloudflare-warp

# Register and connect
warp-cli registration new
warp-cli connect

# Verify connection
curl https://www.cloudflare.com/cdn-cgi/trace | grep warp=on
```

## Platform Support

| Platform | Support tier |
|---|---|
| Debian / Ubuntu / Parrot OS / Kali / Mint / Pop!_OS | Official |
| RHEL / CentOS Stream / Rocky / Alma 9-10 | Official |
| Fedora 43 / 44 | Official |
| Arch / Manjaro / EndeavourOS | Community |
| openSUSE Tumbleweed / Leap | Community |
| macOS | Official |
| Windows 10/11 | Official |

## License
MIT

## Publishing to NPM

This tool is designed to be accessible globally via `npx` without needing to clone the repository. Publishing to the public NPM registry is **completely free** for open-source packages.

### What does and does not publish

Pushing code to `main` does **not** publish anything to NPM. A push only updates GitHub and runs CI.

Publishing is handled by GitHub Actions (`.github/workflows/publish.yml`) using NPM Trusted Publishing (OIDC), without long-lived NPM tokens.

### Preferred release path

1. Open GitHub Actions.
2. Run the `Publish to NPM` workflow from `main`.
3. Choose `patch`, `minor`, `major`, a prerelease bump, or an exact SemVer.
4. The workflow runs tests, bumps `package.json` and `package-lock.json`, commits, tags `vX.Y.Z`, runs `npm publish --dry-run`, creates the GitHub Release, then publishes to NPM via OIDC.

### Local maintainer shortcut

From a clean `main` branch:

```bash
npm run release:patch   # 1.0.0 -> 1.0.1
npm run release:minor   # 1.0.0 -> 1.1.0
npm run release:major   # 1.0.0 -> 2.0.0
```

The helper runs tests, runs `npm version`, pushes the release commit/tag, and creates the GitHub Release with `gh`. That release triggers the publish workflow.

### Manual fallback

```bash
npm version patch -m "chore(release): %s"
git push origin main
git push origin vX.Y.Z
gh release create vX.Y.Z --verify-tag --title vX.Y.Z --generate-notes
```

### Version and security rules

- Every publish needs a higher, never-before-published SemVer. NPM does not allow overwriting an existing version.
- Do not run `npm publish` locally for normal releases.
- Do not add an NPM publish token. Trusted Publishing uses OIDC from GitHub Actions.
- NPM docs: https://docs.npmjs.com/trusted-publishers/
- `npm version` docs: https://docs.npmjs.com/cli/v12/commands/npm-version/
- GitHub Release event docs: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#release
- GitHub `GITHUB_TOKEN` workflow-trigger behavior: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow#triggering-a-workflow-from-a-workflow
- npm token change notice: https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/

Once published, anyone can run `npx -y warp-wizard-cli` and NPM will download and execute the latest released CLI.
