import { execa } from 'execa';
import { log } from '../lib/logger.js';
import fs from 'node:fs/promises';
import { detectPlatform } from './detect.js';

export async function installApt(callbacks) {
  const platform = await detectPlatform();
  const codename = platform.versionCodename || 'bookworm'; // fallback
  
  callbacks.onStart('Adding Cloudflare GPG key...');
  try {
    await execa('bash', ['-c', 'curl -fsSL https://pkg.cloudflareclient.com/pubkey.gpg | sudo gpg --yes --dearmor --output /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg']);
  } catch (e) {
    callbacks.onError('GPG verification failed. ' + e.message);
    throw e;
  }
  
  callbacks.onStart('Adding APT repository...');
  await execa('bash', ['-c', `echo "deb [signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ ${codename} main" | sudo tee /etc/apt/sources.list.d/cloudflare-client.list`]);
  
  callbacks.onStart('Updating APT cache...');
  try {
    await execa('sudo', ['apt-get', 'update']);
  } catch (e) {
    if (e.message.includes('404')) {
      // fallback to known debian codename if failing
      callbacks.onStart('APT update 404ed. Falling back to base Debian codename...');
      const backupCodename = 'bookworm'; 
      await execa('bash', ['-c', `echo "deb [signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ ${backupCodename} main" | sudo tee /etc/apt/sources.list.d/cloudflare-client.list`]);
      await execa('sudo', ['apt-get', 'update']);
    } else {
      throw e;
    }
  }
  
  callbacks.onStart('Installing cloudflare-warp...');
  await execa('sudo', ['apt-get', 'install', '-y', 'cloudflare-warp']);
  
  callbacks.onStart('Enabling systemd service...');
  await execa('sudo', ['systemctl', 'enable', '--now', 'warp-svc']);
  
  callbacks.onSuccess('WARP installed successfully via APT.');
}

export async function uninstallApt() {
  await execa('sudo', ['apt-get', 'remove', '-y', 'cloudflare-warp']);
}
