import { describe, expect, it } from 'vitest';
import {
  buildAptInstallScript,
  buildAptRepositoryScript,
  installApt,
} from '../src/platform/linux-apt.js';

describe('linux apt installer', () => {
  it('uses the Parrot/Debian codename probe and bookworm fallback before writing the repo', () => {
    const script = buildAptRepositoryScript();

    expect(script).toContain(
      'curl -fsSL https://pkg.cloudflareclient.com/pubkey.gpg | sudo gpg --yes --dearmor --output /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg',
    );
    expect(script).toContain('CODENAME=$(lsb_release -cs 2>/dev/null || echo "bookworm")');
    expect(script).toContain(
      'if ! curl -fsS --head "https://pkg.cloudflareclient.com/dists/$CODENAME/Release" >/dev/null; then CODENAME="bookworm"; fi',
    );
    expect(script).toContain(
      'echo "deb [signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ $CODENAME main" | sudo tee /etc/apt/sources.list.d/cloudflare-client.list',
    );
    expect(script).not.toContain('/etc/os-release');
    expect(script).not.toContain('VERSION_CODENAME');
  });

  it('uses the requested apt install command', () => {
    expect(buildAptInstallScript()).toBe('sudo apt-get update && sudo apt-get install cloudflare-warp');
  });

  it('runs only the requested Debian/Parrot install scripts', async () => {
    const calls = [];
    const runner = async (file, args) => {
      calls.push([file, args]);
    };
    const callbacks = {
      onStart: () => {},
      onSuccess: () => {},
      onError: () => {},
    };

    await installApt(callbacks, runner);

    expect(calls).toEqual([
      ['bash', ['-c', buildAptRepositoryScript()]],
      ['bash', ['-c', buildAptInstallScript()]],
    ]);
  });
});
