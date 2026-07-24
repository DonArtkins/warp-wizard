import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const getLogDir = () => {
    return process.platform === 'win32'
        ? path.join(process.env.LOCALAPPDATA, 'warp-wizard', 'logs')
        : path.join(os.homedir(), '.warp-wizard', 'logs');
};

export const log = async (message) => {
    try {
        const logDir = getLogDir();
        await fs.mkdir(logDir, { recursive: true });
        const date = new Date().toISOString().split('T')[0];
        const logFile = path.join(logDir, `${date}.log`);
        const time = new Date().toISOString();
        await fs.appendFile(logFile, `[${time}] ${message}\n`);
    } catch (e) {}
};
