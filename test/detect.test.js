import { describe, it, expect } from 'vitest';
import { detectPlatform } from '../src/platform/detect.js';

describe('detectPlatform', () => {
  it('should detect the platform', async () => {
    const platform = await detectPlatform();
    expect(platform.os).toBeDefined();
    if (platform.os === 'linux') {
      expect(platform.family).toBeDefined();
    }
  });
});
