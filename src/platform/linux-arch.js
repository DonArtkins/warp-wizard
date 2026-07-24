import { execa } from 'execa';
import { isCommandAvailable } from './detect.js';

export async function installArch(callbacks, runner = execa) {
  // Check for yay or paru
  let helper = 'yay';
  if (!(await isCommandAvailable('yay', { runner, platform: 'linux' }))) {
    if (await isCommandAvailable('paru', { runner, platform: 'linux' })) {
      helper = 'paru';
    } else {
      callbacks.onError('Neither yay nor paru found. Please install an AUR helper first.');
      throw new Error('No AUR helper');
    }
  }
  
  callbacks.onStart(`Installing cloudflare-warp-bin via ${helper}...`);
  await runner(helper, ['-S', '--noconfirm', 'cloudflare-warp-bin']);
  
  callbacks.onStart('Enabling systemd service...');
  await runner('sudo', ['systemctl', 'enable', '--now', 'warp-svc']);
  
  callbacks.onSuccess('WARP installed successfully via AUR.');
}

export async function uninstallArch() {
  // Try yay then paru then pacman
  await execa('sudo', ['pacman', '-Rsn', '--noconfirm', 'cloudflare-warp-bin']).catch(() => {});
}
