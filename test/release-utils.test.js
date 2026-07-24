import { describe, expect, it } from 'vitest';
import {
  buildNpmVersionArgs,
  isValidVersionInput,
  resolveNpmDistTag,
} from '../scripts/release-utils.js';

describe('release utils', () => {
  it('accepts npm bump names and exact semver values', () => {
    expect(isValidVersionInput('patch')).toBe(true);
    expect(isValidVersionInput('minor')).toBe(true);
    expect(isValidVersionInput('major')).toBe(true);
    expect(isValidVersionInput('preminor')).toBe(true);
    expect(isValidVersionInput('1.2.3')).toBe(true);
    expect(isValidVersionInput('1.2.3-rc.1')).toBe(true);
  });

  it('rejects invalid version input', () => {
    expect(isValidVersionInput('latest')).toBe(false);
    expect(isValidVersionInput('v1.2.3')).toBe(false);
    expect(isValidVersionInput('1.2')).toBe(false);
  });

  it('builds npm version args with prerelease identifiers only for prerelease bumps', () => {
    expect(buildNpmVersionArgs('patch')).toEqual(['patch', '-m', 'chore(release): %s']);
    expect(buildNpmVersionArgs('preminor', 'beta')).toEqual([
      'preminor',
      '-m',
      'chore(release): %s',
      '--preid',
      'beta',
    ]);
  });

  it('guards prerelease versions from being published as latest', () => {
    expect(resolveNpmDistTag({
      version: '1.2.3',
      eventName: 'workflow_dispatch',
      requestedTag: 'latest',
    })).toBe('latest');

    expect(resolveNpmDistTag({
      version: '1.2.3-rc.1',
      eventName: 'release',
      requestedTag: 'latest',
    })).toBe('next');

    expect(() => resolveNpmDistTag({
      version: '1.2.3-rc.1',
      eventName: 'workflow_dispatch',
      requestedTag: 'latest',
    })).toThrow('non-latest');
  });
});
