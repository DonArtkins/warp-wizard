import { execa } from 'execa';

export async function installWindows(callbacks) {
  callbacks.onStart('Installing via winget...');
  try {
    await execa('winget', ['install', '--id', 'Cloudflare.Warp', '-e', '--accept-package-agreements', '--accept-source-agreements']);
    callbacks.onSuccess('WARP installed successfully via winget.');
  } catch (e) {
    callbacks.onError('Winget install failed.');
    throw e;
  }
}

export async function uninstallWindows() {
  await execa('winget', ['uninstall', '--id', 'Cloudflare.Warp']).catch(() => {});
}
