import { execa } from 'execa';

export async function installMacos(callbacks) {
  callbacks.onStart('Installing via Homebrew...');
  try {
    await execa('brew', ['install', '--cask', 'cloudflare-warp']);
    callbacks.onSuccess('Installed successfully. Note: You must manually allow the VPN configuration in macOS settings.');
  } catch (e) {
    callbacks.onError('Brew install failed. Is Homebrew installed?');
    throw e;
  }
}

export async function uninstallMacos() {
  await execa('brew', ['uninstall', '--cask', 'cloudflare-warp']).catch(() => {});
}
