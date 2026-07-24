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

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

export async function isCommandAvailable(command, options = {}) {
  const {
    runner = execa,
    platform = process.platform
  } = options;

  try {
    if (platform === 'win32') {
      await runner('where', [command]);
    } else {
      await runner('sh', ['-c', `command -v ${shellQuote(command)}`]);
    }

    return true;
  } catch {
    return false;
  }
}

export async function isWarpInstalled(options = {}) {
  return isCommandAvailable('warp-cli', options);
}
