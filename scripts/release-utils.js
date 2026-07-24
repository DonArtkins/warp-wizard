export const npmVersionInputs = new Set([
  'patch',
  'minor',
  'major',
  'prepatch',
  'preminor',
  'premajor',
  'prerelease',
]);

const exactSemverPattern = /^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;

export function isValidVersionInput(input) {
  return npmVersionInputs.has(input) || exactSemverPattern.test(input);
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
  return version.includes('-');
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
