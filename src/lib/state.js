import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const getStatePath = () => {
  const dir = process.platform === 'win32'
    ? path.join(process.env.LOCALAPPDATA, 'warp-wizard')
    : path.join(os.homedir(), '.warp-wizard');
  return path.join(dir, 'state.json');
};

export async function saveState(data) {
  try {
    const p = getStatePath();
    await fs.mkdir(path.dirname(p), { recursive: true });
    let existing = {};
    try {
      existing = JSON.parse(await fs.readFile(p, 'utf-8'));
    } catch (e) {}
    await fs.writeFile(p, JSON.stringify({ ...existing, ...data }, null, 2));
  } catch (e) {}
}

export async function loadState() {
  try {
    return JSON.parse(await fs.readFile(getStatePath(), 'utf-8'));
  } catch (e) {
    return {};
  }
}
