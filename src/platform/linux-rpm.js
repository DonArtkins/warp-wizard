import { execa } from 'execa';
import { log } from '../lib/logger.js';

export async function installRpm(callbacks) {
  // check if EPEL is needed (if RHEL/CentOS)
  const isFedora = false; // logic to check if fedora can be added
  
  callbacks.onStart('Adding Cloudflare GPG key...');
  try {
    await execa('bash', ['-c', "sudo rpm -e 'gpg-pubkey(4fa1c3ba-61abda35)' 2>/dev/null; sudo rpm --import https://pkg.cloudflareclient.com/pubkey.gpg"]);
  } catch (e) {
    callbacks.onError('GPG verification failed. ' + e.message);
    throw e;
  }
  
  callbacks.onStart('Adding Yum/DNF repository...');
  await execa('bash', ['-c', 'curl -fsSL https://pkg.cloudflareclient.com/cloudflare-warp-ascii.repo | sudo tee /etc/yum.repos.d/cloudflare-warp.repo']);
  
  callbacks.onStart('Updating packages...');
  await execa('sudo', ['yum', 'update', '-y']); // works for dnf too via alias usually, but we could explicitly use dnf
  
  callbacks.onStart('Installing cloudflare-warp...');
  await execa('sudo', ['yum', 'install', '-y', 'cloudflare-warp']);
  
  callbacks.onStart('Enabling systemd service...');
  await execa('sudo', ['systemctl', 'enable', '--now', 'warp-svc']);
  
  callbacks.onSuccess('WARP installed successfully via RPM.');
}

export async function uninstallRpm() {
  await execa('sudo', ['yum', 'remove', '-y', 'cloudflare-warp']);
}
