# warp-wizard
Cross-Platform Cloudflare WARP Installer & Manager CLI.

## Installation

Zero-install via npx:
```bash
npx @donartkins/warp-wizard
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

### How to publish

Publishing is fully automated via GitHub Actions (`.github/workflows/publish.yml`) using NPM Trusted Publishing (OIDC).

1. Update the `version` in `package.json`.
2. Commit and push your changes to the `main` branch.
3. Create a new GitHub Release with a tag matching the version (e.g., `v1.0.1`).
4. The GitHub Actions workflow will automatically build and publish the package to the public NPM registry.

### What you need to know
- **Versions**: Every time you publish, you must increment the `version` in `package.json`. You cannot overwrite an existing version.
- **Global execution**: Once published, anyone in the world can run `npx -y @donartkins/warp-wizard` and it will automatically download and execute the latest version of your CLI wizard directly from NPM, zero installation required!
