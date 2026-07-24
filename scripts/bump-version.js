import { execa } from 'execa';
import { exit } from 'process';
import {
  assertNpmPackageVersionIsUnpublished,
  buildNpmVersionArgs,
  isPrereleaseVersion,
  isValidVersionInput,
} from './release-utils.js';

const packageName = 'warp-wizard-cli';
const bumpType = process.argv[2];

if (!isValidVersionInput(bumpType)) {
  console.error('Invalid version input. Use patch, minor, major, a prerelease bump, or an exact SemVer.');
  exit(1);
}

const prereleaseId = process.env.PRERELEASE_ID || 'rc';

async function commandExists(command) {
  try {
    await execa(command, ['--version']);
    return true;
  } catch {
    return false;
  }
}

async function readCurrentBranch() {
  const { stdout } = await execa('git', ['branch', '--show-current']);
  return stdout.trim();
}

async function readPackageVersion() {
  const { stdout } = await execa('node', [
    '-p',
    "JSON.parse(require('node:fs').readFileSync('package.json', 'utf8')).version",
  ]);
  return stdout.trim();
}

(async () => {
  try {
    if ((await readCurrentBranch()) !== 'main') {
      throw new Error('Local releases must be started from the main branch.');
    }

    const { stdout: status } = await execa('git', ['status', '--porcelain']);
    if (status.trim()) {
      throw new Error('Working tree must be clean before running a release.');
    }

    if (!(await commandExists('gh'))) {
      throw new Error('GitHub CLI (gh) is required so the release can be created automatically.');
    }

    await execa('gh', ['auth', 'status'], { stdio: 'inherit' });
    await execa('npm', ['run', 'test'], { stdio: 'inherit' });

    await execa('npm', ['version', ...buildNpmVersionArgs(bumpType, prereleaseId)], { stdio: 'inherit' });

    const version = await readPackageVersion();
    await assertNpmPackageVersionIsUnpublished({ packageName, version, execaCommand: execa });

    const tag = `v${version}`;
    const releaseArgs = ['release', 'create', tag, '--verify-tag', '--title', tag, '--generate-notes'];

    if (isPrereleaseVersion(version)) {
      releaseArgs.push('--prerelease');
    }

    await execa('git', ['push', '--atomic', 'origin', 'main', tag], { stdio: 'inherit' });
    await execa('gh', releaseArgs, { stdio: 'inherit' });

    console.log(`Release ${tag} created. GitHub Actions will publish warp-wizard-cli to npm via Trusted Publishing.`);
  } catch (err) {
    console.error(`Error during release automation: ${err.message || err}`);
    exit(1);
  }
})();
