import { describe, expect, it } from 'vitest';
import {
  assertNpmPackageVersionIsUnpublished,
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
    expect(isValidVersionInput('1.2.3+build-42')).toBe(true);
    expect(isValidVersionInput('1.2.3-rc.1+build-42')).toBe(true);
  });

  it('rejects invalid version input', () => {
    expect(isValidVersionInput('latest')).toBe(false);
    expect(isValidVersionInput('v1.2.3')).toBe(false);
    expect(isValidVersionInput('1.2')).toBe(false);
    expect(isValidVersionInput('01.2.3')).toBe(false);
    expect(isValidVersionInput('1.02.3')).toBe(false);
    expect(isValidVersionInput('1.2.03')).toBe(false);
    expect(isValidVersionInput('1.2.3-rc..1')).toBe(false);
    expect(isValidVersionInput('1.2.3-rc.01')).toBe(false);
    expect(isValidVersionInput('1.2.3-')).toBe(false);
    expect(isValidVersionInput('1.2.3+')).toBe(false);
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
      version: '1.2.3+build-42',
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

  it('allows release flow to continue when the npm version is missing', async () => {
    const missingVersionError = Object.assign(new Error('npm view failed'), {
      exitCode: 1,
      stderr: 'npm error code E404\nnpm error 404 No match found for version 9.9.9',
    });
    const execaCommand = async () => {
      throw missingVersionError;
    };

    await expect(assertNpmPackageVersionIsUnpublished({
      packageName: 'warp-wizard-cli',
      version: '9.9.9',
      execaCommand,
    })).resolves.toBeUndefined();
  });

  it('blocks release flow when the npm version is already published', async () => {
    const execaCommand = async () => ({ stdout: '1.2.3\n' });

    await expect(assertNpmPackageVersionIsUnpublished({
      packageName: 'warp-wizard-cli',
      version: '1.2.3',
      execaCommand,
    })).rejects.toThrow('already published');
  });

  it('fails closed when the npm registry check errors unexpectedly', async () => {
    const execaCommand = async () => {
      throw Object.assign(new Error('getaddrinfo EAI_AGAIN registry.npmjs.org'), {
        exitCode: 1,
      });
    };

    await expect(assertNpmPackageVersionIsUnpublished({
      packageName: 'warp-wizard-cli',
      version: '1.2.3',
      execaCommand,
    })).rejects.toThrow('Could not verify');
  });
});
