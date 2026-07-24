import semver from 'semver';

export const npmVersionInputs = new Set([
  'patch',
  'minor',
  'major',
  'prepatch',
  'preminor',
  'premajor',
  'prerelease',
]);

const exactSemverPattern = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-((?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
const missingNpmVersionPattern = /E404|No match found for version|No matching version found|notarget|404 Not Found/i;

function parseStrictSemver(version) {
  if (typeof version !== 'string' || !exactSemverPattern.test(version)) {
    return null;
  }

  return semver.parse(version);
}

function releaseCommandErrorText(error) {
  return [
    error?.shortMessage,
    error?.message,
    error?.stderr,
    error?.stdout,
  ].filter(Boolean).join('\n');
}

function isMissingNpmPackageVersion(error) {
  return error?.exitCode === 1 && missingNpmVersionPattern.test(releaseCommandErrorText(error));
}

export function isValidVersionInput(input) {
  return npmVersionInputs.has(input) || parseStrictSemver(input) !== null;
}

export function usesPrereleaseId(input) {
  return ['prepatch', 'preminor', 'premajor', 'prerelease'].includes(input);
}

export function buildNpmVersionArgs(input, prereleaseId = 'rc') {
  if (!isValidVersionInput(input)) {
    throw new Error(`Invalid version input: ${input}`);
  }

  const args = [input, '-m', 'chore(release): %s'];
  if (usesPrereleaseId(input)) {
    args.push('--preid', prereleaseId || 'rc');
  }

  return args;
}

export function isPrereleaseVersion(version) {
  return Boolean(parseStrictSemver(version)?.prerelease.length);
}

export function resolveNpmDistTag({ version, eventName, requestedTag = 'latest' }) {
  const prerelease = isPrereleaseVersion(version);
  let npmDistTag = requestedTag || 'latest';

  if (prerelease && eventName === 'release') {
    npmDistTag = 'next';
  }

  if (prerelease && npmDistTag === 'latest') {
    throw new Error('Prerelease package versions must use a non-latest npm dist-tag.');
  }

  return npmDistTag;
}

export async function assertNpmPackageVersionIsUnpublished({ packageName, version, execaCommand }) {
  if (!packageName || !version || typeof execaCommand !== 'function') {
    throw new Error('packageName, version, and execaCommand are required for npm registry checks.');
  }

  const packageSpec = `${packageName}@${version}`;

  try {
    const { stdout } = await execaCommand('npm', ['view', packageSpec, 'version']);
    const publishedVersion = stdout.trim();

    if (publishedVersion === version) {
      throw new Error(`${packageSpec} is already published to npm. Choose a new version.`);
    }

    throw new Error(`npm returned unexpected version data for ${packageSpec}: ${publishedVersion || 'empty output'}.`);
  } catch (error) {
    if (isMissingNpmPackageVersion(error)) {
      return;
    }

    if (error?.message?.includes('already published to npm')) {
      throw error;
    }

    throw new Error(`Could not verify whether ${packageSpec} is already published. npm registry lookup failed: ${releaseCommandErrorText(error) || error}`);
  }
}
