import { execa } from 'execa';
import * as p from '@clack/prompts';
import pc from 'picocolors';

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
    const { stdout } = await execa('curl', ['-s', 'https://www.cloudflare.com/cdn-cgi/trace/']);
    if (stdout.includes('warp=on') || stdout.includes('warp=plus')) {
      s.stop(pc.green('Connection verified (warp=on)'));
    } else {
      s.stop(pc.yellow('Connected, but trace did not show warp=on'));
    }
  } catch (e) {
    s.stop(pc.red('Failed to verify connection with Cloudflare trace'));
  }
}
