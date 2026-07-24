import os from 'node:os';
import { execa } from 'execa';
import fs from 'node:fs/promises';

export async function detectPlatform() {
  const platform = process.platform;
  const arch = process.arch;
  
  if (platform === 'darwin') return { os: 'macos', arch };
  if (platform === 'win32') return { os: 'windows', arch };
  if (platform === 'linux') {
    try {
      const osRelease = await fs.readFile('/etc/os-release', 'utf-8');
      const getValue = (key) => {
        const match = osRelease.match(new RegExp(`^\s*${key}=(?:"([^"]+)"|([^\s]+))`, 'm'));
        return match ? (match[1] || match[2]) : null;
      };
      
      const id = getValue('ID');
      const idLike = getValue('ID_LIKE') || '';
      const versionCodename = getValue('VERSION_CODENAME');
      
      const family = idLike.includes('debian') || id === 'debian' || id === 'ubuntu' ? 'debian' :
                     idLike.includes('rhel') || idLike.includes('fedora') || id === 'fedora' ? 'rpm' :
                     idLike.includes('arch') || id === 'arch' ? 'arch' :
                     idLike.includes('suse') || id === 'opensuse' ? 'opensuse' : 'unknown';
                     
      return { os: 'linux', family, id, versionCodename, arch };
    } catch (e) {
      return { os: 'linux', family: 'unknown', arch };
    }
  }
  return { os: 'unknown', arch };
}

export async function isWarpInstalled() {
  try {
    await execa('command', ['-v', 'warp-cli']);
    return true;
  } catch (e) {
    // Windows might need a different check
    if (process.platform === 'win32') {
      try {
        await execa('where', ['warp-cli']);
        return true;
      } catch (e2) {
        return false;
      }
    }
    return false;
  }
}
