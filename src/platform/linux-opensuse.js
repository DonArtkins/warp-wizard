import { execa } from 'execa';

export async function installOpenSuse(callbacks) {
  callbacks.onStart('Adding community OBS repo...');
  await execa('sudo', ['zypper', 'addrepo', '-f', 'https://download.opensuse.org/repositories/home:MaxxedSUSE/openSUSE_Tumbleweed/home:MaxxedSUSE.repo']);
  
  callbacks.onStart('Refreshing zypper...');
  await execa('sudo', ['zypper', '--gpg-auto-import-keys', 'refresh']);
  
  callbacks.onStart('Installing cloudflare-warp...');
  await execa('sudo', ['zypper', 'install', '-y', 'cloudflare_warp']);
  
  callbacks.onStart('Enabling systemd service...');
  await execa('sudo', ['systemctl', 'enable', '--now', 'warp-svc']);
  
  callbacks.onSuccess('WARP installed successfully via community repo.');
}

export async function uninstallOpenSuse() {
  await execa('sudo', ['zypper', 'remove', '-y', 'cloudflare_warp']);
}
