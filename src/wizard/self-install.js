import * as p from '@clack/prompts';
import { installRcMarker } from '../lib/shell-rc.js';
import { saveState } from '../lib/state.js';
import path from 'node:path';
import os from 'node:os';

export async function promptSelfInstall() {
  const confirm = await p.confirm({
    message: 'Install warp-wizard permanently as a hidden system utility (like nvm/rustup)?',
    initialValue: true
  });
  
  if (confirm && !p.isCancel(confirm)) {
    const s = p.spinner();
    s.start('Installing warp-wizard to PATH...');
    
    try {
      const installDir = process.platform === 'win32'
        ? path.join(process.env.LOCALAPPDATA, 'warp-wizard')
        : path.join(os.homedir(), '.warp-wizard');
        
      await installRcMarker(path.join(installDir, 'bin'));
      await saveState({ installedAt: Date.now() });
      s.stop('warp-wizard installed. Open a new terminal to use the command.');
    } catch (e) {
      s.stop('Failed to install warp-wizard: ' + e.message);
    }
  }
}
