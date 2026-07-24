import { describe, expect, it, vi } from 'vitest';
import { installArch } from '../src/platform/linux-arch.js';

describe('linux arch installer', () => {
  it('uses paru when yay is missing', async () => {
    const calls = [];
    const runner = vi.fn(async (command, args) => {
      calls.push([command, args]);

      if (command === 'sh' && args[1].includes("'yay'")) {
        throw new Error('yay missing');
      }

      return {};
    });
    const events = [];
    const callbacks = {
      onStart: message => events.push(['start', message]),
      onSuccess: message => events.push(['success', message]),
      onError: message => events.push(['error', message]),
    };

    await installArch(callbacks, runner);

    expect(calls).toEqual([
      ['sh', ['-c', "command -v 'yay'"]],
      ['sh', ['-c', "command -v 'paru'"]],
      ['paru', ['-S', '--noconfirm', 'cloudflare-warp-bin']],
      ['sudo', ['systemctl', 'enable', '--now', 'warp-svc']],
    ]);
    expect(events).toContainEqual(['success', 'WARP installed successfully via AUR.']);
  });

  it('fails clearly when no AUR helper is installed', async () => {
    const runner = vi.fn(async () => {
      throw new Error('not found');
    });
    const events = [];
    const callbacks = {
      onStart: message => events.push(['start', message]),
      onSuccess: message => events.push(['success', message]),
      onError: message => events.push(['error', message]),
    };

    await expect(installArch(callbacks, runner)).rejects.toThrow('No AUR helper');

    expect(events).toEqual([
      ['error', 'Neither yay nor paru found. Please install an AUR helper first.'],
    ]);
  });
});
