import { execa } from 'execa';

export async function installArch(callbacks) {
  // Check for yay or paru
  let helper = 'yay';
  try {
    await execa('command', ['-v', 'yay']);
  } catch {
    try {
      await execa('command', ['-v', 'paru']);
      helper = 'paru';
    } catch {
      callbacks.onError('Neither yay nor paru found. Please install an AUR helper first.');
      throw new Error('No AUR helper');
    }
  }
  
  callbacks.onStart(`Installing cloudflare-warp-bin via ${helper}...`);
  await execa(helper, ['-S', '--noconfirm', 'cloudflare-warp-bin']);
  
  callbacks.onStart('Enabling systemd service...');
  await execa('sudo', ['systemctl', 'enable', '--now', 'warp-svc']);
  
  callbacks.onSuccess('WARP installed successfully via AUR.');
}

export async function uninstallArch() {
  // Try yay then paru then pacman
  await execa('sudo', ['pacman', '-Rsn', '--noconfirm', 'cloudflare-warp-bin']).catch(() => {});
}
