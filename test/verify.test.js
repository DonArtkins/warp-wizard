import { describe, expect, it, vi } from 'vitest';
import {
  WARP_CONNECT_ARGS,
  WARP_REGISTRATION_NEW_ARGS,
  WARP_REGISTRATION_SHOW_ARGS,
  WARP_TRACE_COMMAND,
  isAlreadyRegisteredError,
  isMissingRegistrationError,
  verifyConnection
} from '../src/wizard/verify.js';

function createPrompts(confirmValue = true) {
  const events = [];

  return {
    events,
    confirm: vi.fn(async () => confirmValue),
    isCancel: vi.fn(value => value === 'cancel'),
    cancel: vi.fn(message => events.push(['cancel', message])),
    spinner: vi.fn(() => ({
      start: message => events.push(['start', message]),
      stop: message => events.push(['stop', message])
    }))
  };
}

function commandError(message) {
  const error = new Error(message);
  error.stderr = message;
  return error;
}

describe('verify command contract', () => {
  it('uses the requested Cloudflare trace verification command', () => {
    expect(WARP_TRACE_COMMAND).toBe('curl https://www.cloudflare.com/cdn-cgi/trace | grep warp=on');
  });

  it('passes the WARP Terms flag before registration and connect subcommands', async () => {
    const calls = [];
    const runner = vi.fn(async (command, args) => {
      calls.push([command, args]);
    });
    const prompts = createPrompts();

    await expect(verifyConnection({ runner, prompts, waitMs: 0 })).resolves.toBe(true);

    expect(prompts.confirm).toHaveBeenCalledWith({
      message: 'Accept the Cloudflare WARP Terms of Service and continue?'
    });
    expect(calls).toEqual([
      ['warp-cli', WARP_REGISTRATION_SHOW_ARGS],
      ['warp-cli', WARP_CONNECT_ARGS],
      ['bash', ['-c', WARP_TRACE_COMMAND]]
    ]);
  });

  it('registers the device when no WARP registration exists yet', async () => {
    const calls = [];
    const runner = vi.fn(async (command, args) => {
      calls.push([command, args]);

      if (args === WARP_REGISTRATION_SHOW_ARGS) {
        throw commandError('Registration missing');
      }
    });
    const prompts = createPrompts();

    await expect(verifyConnection({ runner, prompts, waitMs: 0 })).resolves.toBe(true);

    expect(calls).toEqual([
      ['warp-cli', WARP_REGISTRATION_SHOW_ARGS],
      ['warp-cli', WARP_REGISTRATION_NEW_ARGS],
      ['warp-cli', WARP_CONNECT_ARGS],
      ['bash', ['-c', WARP_TRACE_COMMAND]]
    ]);
  });

  it('registers when registration show prints a missing state without failing', async () => {
    const calls = [];
    const runner = vi.fn(async (command, args) => {
      calls.push([command, args]);

      if (args === WARP_REGISTRATION_SHOW_ARGS) {
        return { stdout: 'Registration missing' };
      }

      return {};
    });
    const prompts = createPrompts();

    await expect(verifyConnection({ runner, prompts, waitMs: 0 })).resolves.toBe(true);

    expect(calls).toEqual([
      ['warp-cli', WARP_REGISTRATION_SHOW_ARGS],
      ['warp-cli', WARP_REGISTRATION_NEW_ARGS],
      ['warp-cli', WARP_CONNECT_ARGS],
      ['bash', ['-c', WARP_TRACE_COMMAND]]
    ]);
  });

  it('skips WARP CLI calls when the Terms prompt is declined', async () => {
    const runner = vi.fn();
    const prompts = createPrompts(false);

    await expect(verifyConnection({ runner, prompts, waitMs: 0 })).resolves.toBe(false);

    expect(runner).not.toHaveBeenCalled();
    expect(prompts.cancel).toHaveBeenCalledWith('WARP is installed, but registration and connection were skipped.');
  });

  it('surfaces unexpected registration check failures', async () => {
    const runner = vi.fn(async (_command, args) => {
      if (args === WARP_REGISTRATION_SHOW_ARGS) {
        throw commandError('Unable to connect to Cloudflare WARP daemon');
      }
    });
    const prompts = createPrompts();

    await expect(verifyConnection({ runner, prompts, waitMs: 0 }))
      .rejects.toThrow('Unable to connect to Cloudflare WARP daemon');

    expect(runner).toHaveBeenCalledTimes(1);
  });

  it('classifies registration errors narrowly', () => {
    expect(isMissingRegistrationError(commandError('Registration missing'))).toBe(true);
    expect(isAlreadyRegisteredError(commandError('Device is already registered'))).toBe(true);
    expect(isMissingRegistrationError(commandError('Unable to connect to daemon'))).toBe(false);
    expect(isAlreadyRegisteredError(commandError('Unable to connect to daemon'))).toBe(false);
  });
});
