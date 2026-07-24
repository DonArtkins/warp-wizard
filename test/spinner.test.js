import { describe, expect, it } from 'vitest';
import { createManagedSpinner } from '../src/lib/spinner.js';

describe('managed spinner', () => {
  it('updates an active spinner message instead of starting another interval', () => {
    const events = [];
    const spinner = createManagedSpinner({
      start: message => events.push(['start', message]),
      message: message => events.push(['message', message]),
      stop: message => events.push(['stop', message]),
    });

    spinner.start('Adding repository...');
    spinner.start('Installing package...');
    spinner.stop('Installed.');

    expect(events).toEqual([
      ['start', 'Adding repository...'],
      ['message', 'Installing package...'],
      ['stop', 'Installed.'],
    ]);
    expect(spinner.active).toBe(false);
  });

  it('stops before restarting when the underlying spinner has no message API', () => {
    const events = [];
    const spinner = createManagedSpinner({
      start: message => events.push(['start', message]),
      stop: message => events.push(['stop', message]),
    });

    spinner.start('Connecting...');
    spinner.start('Verifying...');
    spinner.stop('Verified.');

    expect(events).toEqual([
      ['start', 'Connecting...'],
      ['stop', undefined],
      ['start', 'Verifying...'],
      ['stop', 'Verified.'],
    ]);
  });
});
