import { describe, expect, it } from 'vitest';
import { WARP_TRACE_COMMAND } from '../src/wizard/verify.js';

describe('verify command contract', () => {
  it('uses the requested Cloudflare trace verification command', () => {
    expect(WARP_TRACE_COMMAND).toBe('curl https://www.cloudflare.com/cdn-cgi/trace | grep warp=on');
  });
});
