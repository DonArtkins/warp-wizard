import { execa } from 'execa';
import * as p from '@clack/prompts';
import pc from 'picocolors';

export const WARP_TRACE_COMMAND = 'curl https://www.cloudflare.com/cdn-cgi/trace | grep warp=on';

export async function verifyConnection() {
  const s = p.spinner();
  s.start('Registering device...');
  try {
    await execa('warp-cli', ['registration', 'new']);
  } catch (e) {
    // ignore if already registered
  }
  
  s.start('Connecting WARP...');
  await execa('warp-cli', ['connect']);
  
  s.start('Verifying traffic...');
  // wait a bit for connection to establish
  await new Promise(r => setTimeout(r, 2000));
  
  try {
    await execa('bash', ['-c', WARP_TRACE_COMMAND]);
    s.stop(pc.green('Connection verified (warp=on)'));
  } catch (e) {
    s.stop(pc.red('Failed to verify connection with Cloudflare trace'));
  }
}
