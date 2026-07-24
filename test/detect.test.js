import { describe, it, expect, vi } from 'vitest';
import {
  detectPlatform,
  isCommandAvailable,
  isWarpInstalled
} from '../src/platform/detect.js';

describe('detectPlatform', () => {
  it('should detect the platform', async () => {
    const platform = await detectPlatform();
    expect(platform.os).toBeDefined();
    if (platform.os === 'linux') {
      expect(platform.family).toBeDefined();
    }
  });

  it('checks command availability through a shell on Unix platforms', async () => {
    const runner = vi.fn(async () => ({}));

    await expect(isCommandAvailable('warp-cli', { runner, platform: 'linux' })).resolves.toBe(true);

    expect(runner).toHaveBeenCalledWith('sh', ['-c', "command -v 'warp-cli'"]);
  });

  it('checks command availability with where on Windows', async () => {
    const runner = vi.fn(async () => ({}));

    await expect(isCommandAvailable('warp-cli', { runner, platform: 'win32' })).resolves.toBe(true);

    expect(runner).toHaveBeenCalledWith('where', ['warp-cli']);
  });

  it('reports missing commands without throwing', async () => {
    const runner = vi.fn(async () => {
      throw new Error('not found');
    });

    await expect(isCommandAvailable('warp-cli', { runner, platform: 'linux' })).resolves.toBe(false);
  });

  it('detects an existing WARP CLI install', async () => {
    const runner = vi.fn(async () => ({}));

    await expect(isWarpInstalled({ runner, platform: 'linux' })).resolves.toBe(true);

    expect(runner).toHaveBeenCalledWith('sh', ['-c', "command -v 'warp-cli'"]);
  });
});
