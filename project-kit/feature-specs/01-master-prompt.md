# WARP Wizard — Cross-Platform Cloudflare WARP Installer & Manager CLI

## Type

NEW PROJECT — standalone CLI tool (outside the Foundrie/RUWA codebase and outside the numbered Foundrie feature sequence; no dependency on or from `context/` files or other feature specs).

## What This Delivers

A single interactive terminal wizard, `warp-wizard`, that detects the user's OS/distro, installs and registers Cloudflare WARP (officially rebranded **Cloudflare One Client**, but still referred to as WARP everywhere in the product) through the correct native package manager for that platform, verifies the tunnel is actually passing traffic, and — only if the user opts in — installs itself permanently as a hidden, self-updating system utility: a README, and installer/uninstaller/updater scripts, the same way tools like `nvm`, `rustup`, or `oh-my-zsh` install themselves into a hidden directory and wire themselves into the shell.

Zero-install usage matches the `npx @posthog/wizard` UX exactly: one command, a short banner, a few prompts, spinners during the real work, a clean summary at the end. After setup, the wizard prints (and writes into its own README) concrete, platform-specific guidance on when to reach for the `warp-cli` terminal command versus the Cloudflare GUI/system-tray icon, plus the operational cautions that actually matter for a developer using this day to day.

## Primary Use Case (Why This Exists)

This generalizes the exact case documented in `FIBER_ROUTER_BUG.md`: an ISP/fiber router's upstream DPI middlebox resets outbound Postgres traffic on port 5432 (Neon's direct connection, used by `prisma migrate dev` / `db push`), and Cloudflare WARP is the fix — tunneling all traffic so the DPI box never sees the Postgres wire protocol. Today that fix means retyping seven manual steps from memory or a doc every time a new machine, VM, or teammate's laptop needs it. `warp-wizard` turns that into one command on any OS, then teaches the user when WARP should be on versus off — including disconnecting before remote-work platforms with anti-VPN policies, a caution already called out in `README.md`.

The wizard shouldn't be designed *against* other uses (general traffic encryption, captive-portal weirdness, "my ISP is doing something odd to one port" debugging) — it just doesn't need to special-case them.

## Target Platforms

| Platform | Install path | Support tier |
|---|---|---|
| Debian / Ubuntu / **Parrot OS (primary)** / Kali / Mint / Pop!_OS | `apt`, Cloudflare's official repo | Official |
| RHEL / CentOS Stream / Rocky / Alma 9–10 | `yum`/`dnf`, official repo + **EPEL required** | Official |
| Fedora 43 / 44 | `dnf`, official repo, no EPEL needed | Official |
| Arch / Manjaro / EndeavourOS | AUR `cloudflare-warp-bin` via `yay`/`paru` | Community (no official Cloudflare package) |
| openSUSE Tumbleweed / Leap | Community OBS repo | Community — must be clearly labeled unofficial in the UI |
| macOS (Intel + Apple Silicon) | Homebrew cask `cloudflare-warp`, or official `.pkg` | Official |
| Windows 10/11 | `winget install --id Cloudflare.Warp`, or official installer | Official |

Parrot is Debian-based, so it rides the `apt` path — the exact flow already field-tested on Parrot in `FIBER_ROUTER_BUG.md` (June 15, 2026 case study). Reuse it verbatim as the reference implementation for that platform module rather than re-deriving it.

## Dependencies / Prerequisites

- Node.js ≥ 18 LTS + npm (powers the `npx` entry point and, if self-installed, the persisted `warp-wizard` command)
- Root/admin privileges for the actual WARP package install — the wizard's *own* self-install footprint should never require elevation, only the underlying OS package step does
- Outbound internet on 443/80 (this is essentially always open even on networks that block 5432, since that's the whole reason the DPI-blocking scenario is fixable this way)
- No external account or API key is required for the consumer WARP flow this spec covers — `warp-cli registration new` is anonymous device registration, not a login. (Cloudflare Zero Trust / WARP+ org enrollment *does* need an account and is explicitly out of scope — see below.)

## Context To Read First

- This spec
- `README.md` and `FIBER_ROUTER_BUG.md` — the field-tested Debian/Parrot WARP flow, and the exact DPI-blocking diagnosis technique (`nc` port comparison across two networks, IPv6 routability check, `cdn-cgi/trace` verification) that `warp-wizard doctor` should encode as an automated check rather than reinvent
- Cloudflare's official docs — **fetch live at implementation time, do not rely on training data**, this is a living package repo with a rotating GPG key and a moving supported-OS list:
  - `https://pkg.cloudflareclient.com/` — the actual current Linux install commands, per distro
  - `https://developers.cloudflare.com/warp-client/get-started/linux/` / `.../windows/` / `.../macos/`
  - `https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/cloudflare-one-client/` — architecture, binary/log paths per OS
  - `https://developers.cloudflare.com/cloudflare-one/changelog/cloudflare-one-client/` — recent behavior changes and known issues

## Research / Verification To Do Before Committing Commands

Cloudflare's repo URLs, GPG key, and supported-release lists are living values, not npm packages — Context7 won't have them. Re-fetch the pages above and diff against this spec's Implementation Notes before finalizing any install script. Specifically re-check:

1. **GPG key rotation.** Cloudflare has rotated this key before (anyone who added it pre-2025-09-12 needed to re-run the import, with a hard cutover December 4, 2025). Build the install script assuming this can happen again — a script that silently trusts a stale key is a supply-chain risk, not just a bug. Give "GPG verification failed" its own distinct error message, not a generic "install failed."
2. Whether the RHEL/CentOS/Fedora supported-version list has moved (currently RHEL/CentOS 9–10, Fedora 43–44).
3. Whether `cloudflare-warp` has been fully superseded by a `cloudflare-one-client` package name on any distro. As of this spec, the installable Linux package is still literally named `cloudflare-warp` per Cloudflare's own docs, despite the product-level rebrand — re-check, don't assume.
4. The AUR `cloudflare-warp-bin` page and the openSUSE OBS repo directly — both are third-party maintained and can go stale or orphaned between now and implementation.

## Context7 Docs To Check

(For the wizard's own Node.js dependencies — WARP itself is an OS package, not an npm library, so Context7 doesn't cover it; use the research step above for that instead.)

- `@clack/prompts` (or the current best equivalent) — interactive prompt/spinner/multi-step primitives
- `execa` — spawning and streaming shell commands from Node with clean, structured error surfaces
- `picocolors` — terminal styling
- `citty` / `cac` — subcommand routing (`warp-wizard status`, `doctor`, `update`, `uninstall`, …)

```bash
npx ctx7 library <library> "<specific question>"
npx ctx7 docs <libraryId> "<specific question>"
```

Do not default to Foundrie's own web stack — this is a small, dependency-light CLI. Research should pick the smallest, most current toolset that gets a genuinely polished terminal UX, not a framework.

## Package / Branding

- npm package: `@donartkins/warp-wizard` (published to GitHub Packages).
- Zero-install entry point: `npx @donartkins/warp-wizard`.
- Persistent command after opt-in self-install: `warp-wizard`.
- First mention in any UI copy: "Cloudflare WARP (Cloudflare One Client)"; every mention after that: just "WARP" — Cloudflare's own rebrand is recent enough that users searching old docs/memory for "WARP" shouldn't be confused by the newer name appearing with no explanation.

## Files Owned

```
warp-wizard/
├── README.md
├── package.json
├── .gitignore
├── bin/
│   └── warp-wizard.js               # npx / global entry point → src/cli.js
├── src/
│   ├── cli.js                       # subcommand router; no args = interactive wizard
│   ├── platform/
│   │   ├── detect.js                # OS + distro-family + arch detection
│   │   ├── linux-apt.js             # Debian/Ubuntu/Parrot/Kali/Mint
│   │   ├── linux-rpm.js             # RHEL/CentOS/Fedora (+ EPEL handling)
│   │   ├── linux-arch.js            # AUR via yay/paru
│   │   ├── linux-opensuse.js        # community OBS repo, flagged unofficial
│   │   ├── macos.js                 # brew cask + official .pkg fallback
│   │   └── windows.js               # winget + official installer fallback
│   ├── wizard/
│   │   ├── welcome.js               # banner, OS summary, consent prompt
│   │   ├── install-flow.js          # orchestrates platform module, spinner/log streaming
│   │   ├── verify.js                # registration + connect + cdn-cgi/trace check
│   │   ├── self-install.js          # hidden dir, PATH block injection, state.json
│   │   └── guidance.js              # prints the CLI-vs-GUI "what's next" block
│   ├── commands/
│   │   ├── status.js
│   │   ├── toggle.js                # connect/disconnect based on current state
│   │   ├── doctor.js                # automates the FIBER_ROUTER_BUG.md diagnostic
│   │   ├── update.js
│   │   └── uninstall.js
│   └── lib/
│       ├── state.js                 # read/write the hidden dir's state.json
│       ├── shell-rc.js              # idempotent, marker-delimited PATH block inject/remove
│       └── logger.js                # timestamped logs into the hidden dir
├── scripts/
│   ├── install.sh                   # curl-pipe-sh bootstrap (Linux/macOS), POSIX-sh not bash-only
│   ├── install.ps1                  # iwr-pipe-iex bootstrap (Windows)
│   ├── uninstall.sh
│   ├── uninstall.ps1
│   ├── update.sh
│   └── update.ps1
├── .github/workflows/ci.yml         # lint + unit tests across ubuntu/macos/windows runners
├── .github/workflows/publish.yml    # publish to GitHub Packages on release creation
└── .npmrc                           # scope mapping for @donartkins -> npm.pkg.github.com
```

**`.gitignore` (CRITICAL — set this up in the same commit as the initial scaffold):**
```
node_modules/
dist/
*.log
.env
```
Nothing under the *end user's* runtime hidden directory (`~/.warp-wizard/` or `%LOCALAPPDATA%\warp-wizard\`) is ever part of this repo — that's generated on the machine that runs the wizard, not shipped in git.

## Files

CREATE: everything under **Files Owned** above.
CREATE: `README.md` is a first-class deliverable — see Implementation Note 10, not an afterthought bolted on at the end.

## Implementation Notes

### 1. CLI entry & UX framework

- Model the first run on `npx @posthog/wizard`: one command, a short banner, a handful of arrow-key/confirm prompts, live spinners, a clean summary. Raw `apt`/`dnf` output streams to the log file, not the terminal, by default — show a "view full output" hint only on failure.
- Use a modern prompt library (`@clack/prompts` is the current standard for this kind of flow — verify the exact package and version via Context7/npm before pinning it) for select/confirm/spinner primitives rather than a hand-rolled readline loop.
- Visual identity: dark terminal palette, one accent color, restrained unicode (▲ ✓ ✗ ○, simple box-drawing for summaries), no emoji spam. Cloudflare orange (`#F38020`) reads as on-brand for what's being installed; the ARTKINS dark-cinematic register (near-black background cues, one accent, no visual noise) is the right fit if this ships under the ARTKINS name.
- Every system-modifying action (package install, PATH edit, uninstall) shows exactly what will run before it runs, with a confirm prompt. Never silently `sudo`.

### 2. OS / distro detection

- `process.platform` for the top-level split (`linux` / `darwin` / `win32`).
- On Linux, parse `/etc/os-release`'s `ID` and `ID_LIKE` to resolve a distro family (`debian`, `rhel`/`fedora`, `arch`, `suse`) instead of string-matching release filenames. Parrot resolves via `ID_LIKE=debian`.
- Detect CPU architecture (`x86_64`/`arm64`) — the AUR package and some `.deb`/`.rpm` builds are architecture-specific.
- Detect an existing install first (`command -v warp-cli`, or the platform's own package query) and branch to a repair/reconnect flow instead of a fresh install. The wizard must be safe to re-run.

### 3. Install flow, per platform (verified against Cloudflare's live docs and package registries)

**Debian / Ubuntu / Parrot / Kali / Mint** — official, apt. Reuse the exact sequence already field-tested in `FIBER_ROUTER_BUG.md`:
```bash
curl -fsSL https://pkg.cloudflareclient.com/pubkey.gpg | sudo gpg --yes --dearmor --output /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflare-client.list
sudo apt-get update && sudo apt-get install -y cloudflare-warp
```
Officially supported suites at time of writing: Ubuntu Resolute (26.04), Noble (24.04), Jammy (22.04); Debian Trixie (13), Bookworm (12). Defend against one specific edge case: if `apt-get update` 404s only on the Cloudflare line, `$(lsb_release -cs)` returned a codename Cloudflare doesn't host — this can happen on rolling/derivative distros. Fall back to the closest Debian base codename from `/etc/os-release`'s `VERSION_CODENAME` rather than failing with no explanation.

**RHEL / CentOS Stream / Rocky / Alma 9–10** — official, yum. **EPEL is a hard requirement on 9+**, specifically for the tray-icon and captive-portal webview dependencies — install/enable it before the WARP package, not after:
```bash
sudo rpm -e 'gpg-pubkey(4fa1c3ba-61abda35)' 2>/dev/null; sudo rpm --import https://pkg.cloudflareclient.com/pubkey.gpg
curl -fsSL https://pkg.cloudflareclient.com/cloudflare-warp-ascii.repo | sudo tee /etc/yum.repos.d/cloudflare-warp.repo
sudo yum update -y
sudo yum install -y cloudflare-warp
```

**Fedora 43 / 44** — official, dnf, same GPG/repo steps as RHEL, **no EPEL needed**:
```bash
sudo dnf update -y
sudo dnf install -y cloudflare-warp
```

**Arch / Manjaro / EndeavourOS** — community, AUR. Cloudflare ships no official Arch package; `cloudflare-warp-bin` (tracks upstream releases, `provides=(warp-cli warp-diag warp-svc)`) is the standard community path:
```bash
yay -S cloudflare-warp-bin   # or: paru -S cloudflare-warp-bin
```
If no AUR helper is present, say so and stop — installing an AUR helper on the user's behalf is a bigger trust boundary than this tool should cross by default. Offer it as an explicit opt-in, not a silent step.

**openSUSE Tumbleweed / Leap** — community, best-effort. There is **no official Cloudflare package**, and installing the RHEL rpm directly via `zypper` is known to leave the service misconfigured (dependency-name mismatches, e.g. `dbus` vs `dbus-1`). Point at a maintained community OBS repo instead and label it clearly as third-party in the UI before doing anything:
```bash
sudo zypper addrepo https://download.opensuse.org/repositories/home:MaxxedSUSE/openSUSE_Tumbleweed/home:MaxxedSUSE.repo
sudo zypper refresh
sudo zypper install cloudflare_warp
```
Re-verify this specific community repo is still maintained before shipping — OBS home-projects can go stale or disappear.

**macOS** — official:
```bash
brew install --cask cloudflare-warp
```
Fall back to the official `.pkg` if Homebrew isn't present. First launch triggers a macOS system dialog ("Cloudflare WARP wants to add VPN configurations") requiring manual **Allow** + Touch ID/password — the wizard cannot script past this; say so up front so it isn't mistaken for a hang. Homebrew-specific gotcha: WARP's built-in auto-updater doesn't reliably work through a brew-managed install, so `warp-wizard update` on macOS should specifically run `brew upgrade --cask cloudflare-warp --greedy` for brew installs, not just prompt the app to self-update.

**Windows** — official:
```powershell
winget install --id Cloudflare.Warp -e
```
Fall back to the official installer if winget is unavailable. Installs to `C:\Program Files\Cloudflare\Cloudflare WARP\`; the GUI auto-launches and lives in the system tray after install.

### 4. Post-install: register, connect, verify

Identical across every platform once `warp-cli` is on PATH:
```bash
warp-cli registration new
warp-cli connect
curl -s https://www.cloudflare.com/cdn-cgi/trace/ | grep warp=on
```
On Linux, also make sure the daemon survives reboots — the existing docs cover registration/connect but not persistence: `sudo systemctl enable --now warp-svc`.

### 5. Self-installation (persistent footprint)

Only after the WARP install itself succeeds, and only if the user opts in at the end-of-wizard prompt:

| OS | Hidden dir | PATH mechanism |
|---|---|---|
| Linux / macOS | `~/.warp-wizard/` | Marker-delimited block appended to the active shell's rc file (`.bashrc`/`.zshrc`/`.profile`, or `config.fish`) |
| Windows | `%LOCALAPPDATA%\warp-wizard\` | `[Environment]::SetEnvironmentVariable('PATH', ..., 'User')` |

Directory contents: `bin/` (entry shim), `lib/` (bundled JS), `state.json` (install timestamp, wizard version, detected OS/distro, install method used, WARP version at install time, registration status), `logs/` (timestamped install/uninstall/update logs), `scripts/` (persisted copies of the lifecycle scripts, runnable directly without `npx` — e.g. `~/.warp-wizard/scripts/uninstall.sh`).

Shell-rc edits are idempotent and reversible: wrap the injected block in `# >>> warp-wizard >>>` / `# <<< warp-wizard <<<` markers — the same pattern `conda`/`pyenv`/`nvm` use — so `warp-wizard uninstall` can find and remove exactly that block without disturbing anything else in the user's rc file.

### 6. Installer / uninstaller / updater scripts

These need to work two ways: piped straight from a URL (`curl -fsSL <url>/install.sh | sh`, matching the "install a GitHub program" pattern the user asked for) and run locally after a `git clone`. Keep the Linux/macOS scripts POSIX-sh compatible, not bash-only, so they work in more shells. Ship a genuine PowerShell `.ps1` for Windows, not a translated bash script.

- `install.sh` / `install.ps1` — run OS detection → install-flow → self-install; the same logic path as `npx @donartkins/warp-wizard`, just via a different distribution channel.
- `uninstall.sh` / `uninstall.ps1` — two levels: remove `warp-wizard` only (default) vs. `--purge` (also runs the platform module's own uninstall for the actual WARP client). Always `warp-cli disconnect` before removing anything.
- `update.sh` / `update.ps1` — check the wizard's own npm version and the installed WARP version separately; support a non-interactive `--check` flag for scripting/cron.

### 7. Post-setup usage guidance (what the wizard prints — and puts in the README — at the end)

This is the part that was explicitly asked for: concrete guidance on **when** to use the CLI versus the GUI, not just that both exist.

| Situation | Use |
|---|---|
| Headless server / SSH session / CI | `warp-cli` — there's usually no GUI to use |
| Wrapping automation — npm pre-scripts, migration commands, CI steps | `warp-cli` — scriptable, no clicking |
| Local desktop, day-to-day toggling | The system tray icon — `warp-taskbar` on Linux desktop editions, the native tray app on macOS/Windows — one click, always-visible connection state |
| First-time setup, or anything going wrong | `warp-wizard doctor` before anything else |
| Advanced config: split tunnel, DNS families, custom modes | Still CLI-only even where a GUI exists (`warp-cli tunnel ip`, `warp-cli tunnel host`, `warp-cli dns families`) — the GUI doesn't expose these yet |
| About to use a platform with an anti-VPN/proxy policy (e.g. Remotasks, Outlier, or any strict-location platform) | Disconnect first — `warp-cli disconnect` or `warp-wizard toggle` — reconnect after |

On Linux specifically, note that the GUI is **not** a separate install as of current stable releases: `cloudflare-warp` packages now bundle a system-tray application (`warp-taskbar`) with a desktop-launcher entry, so it should already show up in the application menu/launcher ("drawer") after install on GNOME, KDE, XFCE, and MATE — no extra package needed. If it doesn't autostart, `warp-taskbar &` launches it manually, and copying the shipped `.desktop` file into `~/.config/autostart/` makes it start at login. (This is a genuinely new capability — Linux was CLI-only until late 2025 — so don't let the wizard's own copy read like it's assuming an old, GUI-less Linux client.)

Restate — in the wizard's own words, not copied from the source doc — the caution already established in `README.md`: routing traffic through WARP puts it on a different network path, and platforms that specifically check for VPN/proxy usage may flag that, so it's worth disconnecting before logging into ones with that kind of policy, same as with any VPN.

### 8. Idempotency & safety

- Re-running the wizard on an already-configured machine detects that and offers repair/reconnect, never blind reinstall.
- Uninstall always confirms, and always distinguishes "remove the wizard" from "remove WARP itself" — two different blast radii; a user should never lose their WARP setup by uninstalling the wizard by mistake.
- Never touch a PATH entry that wasn't added by this tool — only ever edit content between this tool's own markers.

### 9. Diagnostics — `warp-wizard doctor`

Automate the exact procedure already worked out by hand in `FIBER_ROUTER_BUG.md`, rather than reinventing it:
1. Run `warp-diag` (Cloudflare's own bundled diagnostics collector) and save its output to the log dir.
2. Run the dual-network DPI comparison from the case study — a port-reachability check against a known endpoint, plus an IPv6 routability check — and specifically flag "TCP handshake completes, then resets" as the DPI signature, distinct from a plain timeout or DNS failure.
3. Run the `cdn-cgi/trace` check and confirm `warp=on`.
4. Summarize in plain language — connected/not, DPI-signature detected/not, suggested next step — instead of dumping raw tool output as the primary answer.

### 10. README requirements (the tool's own `README.md`)

In order: one-line description; both install paths as copy-pasteable one-liners (`npx` zero-install vs. the permanent self-install `curl | sh`); a subcommand table (`status`, `toggle`, `doctor`, `update`, `uninstall`); the CLI-vs-GUI table from Implementation Note 7; a troubleshooting section adapted from the `FIBER_ROUTER_BUG.md` DPI case study, generalized for a public audience (keep the specific ISP/Kenya/Neon details out of the framing — that story fits better as a worked example inside troubleshooting than as the README's opening pitch); a platform support table with official-vs-community labeling; license.

## Reference: `warp-cli` / `warp-diag` Commands

| Command | Purpose |
|---|---|
| `warp-cli registration new` | First-time device registration — no account needed for consumer WARP |
| `warp-cli registration delete` | Deregister the device (part of a clean `--purge` uninstall) |
| `warp-cli registration license <key>` | Apply a WARP+ license key |
| `warp-cli registration show` | Current registration/account details |
| `warp-cli connect` / `warp-cli disconnect` / `warp-cli reconnect` | Toggle the tunnel |
| `warp-cli status` | Current connection state — the primitive `warp-wizard status` wraps |
| `warp-cli mode <mode>` | Switch mode: `warp`, `doh` (DNS-only), `warp+doh`, `proxy` (SOCKS5) — `warp-cli mode --help` for the authoritative current list |
| `warp-cli tunnel protocol set WireGuard\|MASQUE` | Switch transport (MASQUE is default) |
| `warp-cli tunnel ip` / `warp-cli tunnel host` | Split-tunnel config — CLI-only, not yet in the GUI |
| `warp-cli dns families malware\|full\|off` | 1.1.1.1 for Families content filtering |
| `warp-cli teams-enroll <org>` | Zero Trust org enrollment — out of scope for this build, listed for completeness |
| `warp-diag` | Bundled diagnostics collector (logs, config, connectivity) — wrap this inside `doctor` rather than re-implementing it |
| `warp-taskbar` (Linux) | Launches the system-tray GUI manually if it didn't autostart |

## Out of Scope

- Cloudflare Zero Trust / WARP+ organizational enrollment (`warp-cli teams-enroll`) — this spec covers the free consumer client only.
- Installing an AUR helper, Homebrew, or winget itself — the wizard detects and uses what's present, and clearly states what to install first if a needed package manager is missing.
- A GUI/Electron wrapper around the wizard itself — this is a terminal tool.
- Android/iOS — WARP there is app-store distributed, outside this tool's reach regardless.
- Automatic WARP toggling wrapped around specific commands (e.g. auto-connect before `prisma migrate dev`, auto-disconnect after) — genuinely useful, but a distinct feature; see Future Modifications.

## Future Modifications

- `warp-wizard profile` — named connect/disconnect wrappers around specific commands, directly generalizing the Prisma/Neon port-5432 use case from `FIBER_ROUTER_BUG.md` into a reusable pattern.
- Compiled single-binary distribution (`pkg` / `bun build --compile`) so the persistent `warp-wizard` command doesn't depend on Node still being installed after the initial `npx` bootstrap.
- A Homebrew formula / AUR package / winget manifest for `warp-wizard` itself — installable through the same package managers it automates for WARP.
- Shell completion (`warp-wizard completion bash|zsh|fish`).
- Strictly opt-in telemetry on which install paths fail most often, to prioritize which platform module gets hardened next.

## Quality Gates

Most hosted CI containers can't load a WireGuard interface or approve a macOS network extension, so "passing" here means:
- `shellcheck` clean on every `.sh` script; `PSScriptAnalyzer` clean on every `.ps1` script.
- Unit tests around the pure logic — OS/distro detection from a fixture `/etc/os-release`, shell-rc marker injection/removal, `state.json` read/write — run in normal CI (`ubuntu-latest` / `macos-latest` / `windows-latest` matrix in `.github/workflows/ci.yml`).
- A manual smoke-test checklist (see Acceptance Criteria) run by hand, once per platform family, before a release — the actual install step needs a real machine or VM with root and a real network.
- `npm run build` and `npm publish --dry-run` succeed.

## Acceptance Criteria

- [ ] `npx @donartkins/warp-wizard` on a clean Parrot OS (or other Debian-based) machine installs, registers, connects, and verifies WARP end-to-end using the flow field-tested in `FIBER_ROUTER_BUG.md`.
- [ ] The same flow succeeds on at least one RHEL/CentOS-family box with EPEL auto-handled, one Fedora box, one Arch box via AUR, one macOS box via Homebrew, and one Windows box via winget.
- [ ] The openSUSE path clearly labels itself community/unofficial in the UI before doing anything.
- [ ] Re-running the wizard on an already-installed machine detects that state and offers repair/reconnect instead of reinstalling.
- [ ] Declining self-install at the end-of-wizard prompt leaves no persistent footprint beyond the npx cache.
- [ ] Accepting self-install creates the hidden dir, adds exactly one idempotent marker-delimited PATH block, and makes `warp-wizard` runnable from a fresh shell.
- [ ] `warp-wizard uninstall` removes only the wizard's own footprint (dir + PATH block) and leaves the actual WARP client installed, unless `--purge` is passed.
- [ ] `warp-wizard doctor` distinguishes "not connected," "connected but not actually tunneling," and "DPI reset signature detected" as three different diagnoses.
- [ ] The end-of-wizard guidance block and the README both explain, in the tool's own words, when to use CLI vs. GUI and the anti-VPN-policy caution — not copied verbatim from `README.md`.
- [ ] `README.md` is complete per Implementation Note 10 and renders correctly on GitHub.
- [ ] Every install command actually shipped is re-verified against Cloudflare's live docs at implementation time, not copied from this spec unchecked — repo URLs, the GPG key, and supported-version lists change.
