import * as p from '@clack/prompts';
import pc from 'picocolors';
import { detectPlatform, isWarpInstalled } from '../platform/detect.js';
import { installApt } from '../platform/linux-apt.js';
import { installRpm } from '../platform/linux-rpm.js';
import { installArch } from '../platform/linux-arch.js';
import { installOpenSuse } from '../platform/linux-opensuse.js';
import { installMacos } from '../platform/macos.js';
import { installWindows } from '../platform/windows.js';
import { verifyConnection } from './verify.js';
import { promptSelfInstall } from './self-install.js';
import { printGuidance } from './guidance.js';

export async function runWizard() {
  p.intro(pc.bgCyan(pc.black(' WARP Wizard ')));

  const installed = await isWarpInstalled();
  if (installed) {
    p.note('Cloudflare WARP is already installed on this system.', 'Detected');
    const action = await p.select({
      message: 'What would you like to do?',
      options: [
        { value: 'verify', label: 'Verify connection and repair' },
        { value: 'exit', label: 'Exit' }
      ]
    });
    
    if (action === 'exit') {
      p.outro('Exiting.');
      return;
    }
    
    await verifyConnection();
    await promptSelfInstall();
    printGuidance();
    p.outro(pc.green('Done!'));
    return;
  }

  const platform = await detectPlatform();
  p.note(`OS: ${platform.os} ${platform.family ? '(' + platform.family + ')' : ''}`, 'Detected Platform');
  
  let installFn = null;
  if (platform.os === 'linux') {
    if (platform.family === 'debian') installFn = installApt;
    else if (platform.family === 'rpm') installFn = installRpm;
    else if (platform.family === 'arch') installFn = installArch;
    else if (platform.family === 'opensuse') {
      p.log.warn('Warning: openSUSE is community supported. This uses an unofficial repository.');
      installFn = installOpenSuse;
    }
  } else if (platform.os === 'macos') {
    installFn = installMacos;
  } else if (platform.os === 'windows') {
    installFn = installWindows;
  }

  if (!installFn) {
    p.cancel('Unsupported platform.');
    process.exit(1);
  }

  const confirm = await p.confirm({
    message: 'Proceed with installation?'
  });

  if (!confirm || p.isCancel(confirm)) {
    p.cancel('Installation aborted.');
    process.exit(0);
  }

  const s = p.spinner();
  const callbacks = {
    onStart: (msg) => s.start(msg),
    onSuccess: (msg) => s.stop(msg),
    onError: (msg) => s.stop(pc.red(msg))
  };

  try {
    await installFn(callbacks);
  } catch (e) {
    p.cancel('Installation failed: ' + e.message);
    process.exit(1);
  }

  await verifyConnection();
  await promptSelfInstall();
  printGuidance();
  
  p.outro(pc.green('WARP Wizard setup complete.'));
}
