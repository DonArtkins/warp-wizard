import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const MARKER_START = '# >>> warp-wizard >>>';
const MARKER_END = '# <<< warp-wizard <<<';

export async function installRcMarker(binPath) {
  if (process.platform === 'win32') {
    // Windows logic (simplified for stub, normally sets user env var)
    return;
  }
  
  const rcFiles = ['.bashrc', '.zshrc'].map(f => path.join(os.homedir(), f));
  for (const rc of rcFiles) {
    try {
      let content = '';
      try {
        content = await fs.readFile(rc, 'utf-8');
      } catch (e) { continue; }
      
      if (!content.includes(MARKER_START)) {
        const block = `\n${MARKER_START}\nexport PATH="${binPath}:$PATH"\n${MARKER_END}\n`;
        await fs.appendFile(rc, block);
      }
    } catch (e) {}
  }
}

export async function removeRcMarker() {
  if (process.platform === 'win32') return;
  const rcFiles = ['.bashrc', '.zshrc'].map(f => path.join(os.homedir(), f));
  for (const rc of rcFiles) {
    try {
      let content = await fs.readFile(rc, 'utf-8');
      if (content.includes(MARKER_START)) {
        const regex = new RegExp(`\\n?${MARKER_START}[\\s\\S]*?${MARKER_END}\\n?`);
        content = content.replace(regex, '\n');
        await fs.writeFile(rc, content);
      }
    } catch (e) {}
  }
}
