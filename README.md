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

1. First, create an NPM account at [npmjs.com](https://www.npmjs.com/) if you don't have one.
2. In your terminal, log in to your account:
   ```bash
   npm login
   ```
3. Make sure your package name in `package.json` (currently `@donartkins/warp-wizard`) is unique. If you want to use an `@scope`, it must match your NPM username or an organization you own (e.g. `@yourusername/warp-wizard`).
4. Publish the package publicly:
   ```bash
   npm publish --access public
   ```

### What you need to know
- **Versions**: Every time you publish, you must increment the `version` in `package.json`. You cannot overwrite an existing version on NPM.
- **Global execution**: Once published, anyone in the world can run `npx -y @yourusername/warp-wizard` and it will automatically download and execute the latest version of your CLI wizard directly from NPM, zero installation required!
