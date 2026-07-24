import { execa } from 'execa';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { createManagedSpinner } from '../lib/spinner.js';

export const WARP_TRACE_COMMAND = 'curl https://www.cloudflare.com/cdn-cgi/trace | grep warp=on';
export const WARP_REGISTRATION_SHOW_ARGS = ['--accept-tos', 'registration', 'show'];
export const WARP_REGISTRATION_NEW_ARGS = ['--accept-tos', 'registration', 'new'];
export const WARP_CONNECT_ARGS = ['--accept-tos', 'connect'];

const TERMS_CANCEL_MESSAGE = 'WARP is installed, but registration and connection were skipped.';

export function commandOutput(error) {
  return [
    error?.stderr,
    error?.stdout,
    error?.shortMessage,
    error?.message
  ].filter(Boolean).join('\n');
}

export function isMissingRegistrationError(error) {
  return /registration\s+(missing|not found)|missing\s+registration|not\s+registered/i.test(commandOutput(error));
}

export function isAlreadyRegisteredError(error) {
  return /already\s+registered|registration\s+already\s+exists|existing\s+registration/i.test(commandOutput(error));
}

export function formatCommandFailure(error) {
  return error?.stderr || error?.shortMessage || error?.message || String(error);
}

async function confirmWarpTerms(prompts) {
  const accepted = await prompts.confirm({
    message: 'Accept the Cloudflare WARP Terms of Service and continue?'
  });

  if (prompts.isCancel(accepted) || accepted !== true) {
    prompts.cancel(TERMS_CANCEL_MESSAGE);
    return false;
  }

  return true;
}

async function ensureRegistration(runner, spinner, colors) {
  spinner.start('Checking WARP registration...');

  try {
    const registration = await runner('warp-cli', WARP_REGISTRATION_SHOW_ARGS);
    if (!isMissingRegistrationError(registration)) {
      spinner.stop(colors.green('WARP registration found.'));
      return;
    }
  } catch (error) {
    if (!isMissingRegistrationError(error)) {
      spinner.stop(colors.red('Failed to check WARP registration.'));
      throw error;
    }
  }

  spinner.start('Registering device...');

  try {
    await runner('warp-cli', WARP_REGISTRATION_NEW_ARGS);
  } catch (error) {
    if (!isAlreadyRegisteredError(error)) {
      spinner.stop(colors.red('Failed to register WARP device.'));
      throw error;
    }
  }

  spinner.stop(colors.green('WARP device registered.'));
}

export async function verifyConnection(options = {}) {
  const {
    runner = execa,
    prompts = p,
    colors = pc,
    waitMs = 2000
  } = options;

  if (!(await confirmWarpTerms(prompts))) {
    return false;
  }

  const s = createManagedSpinner(prompts.spinner());

  await ensureRegistration(runner, s, colors);
  
  s.start('Connecting WARP...');
  try {
    await runner('warp-cli', WARP_CONNECT_ARGS);
  } catch (error) {
    s.stop(colors.red('Failed to connect WARP.'));
    throw error;
  }
  
  s.start('Verifying traffic...');
  // wait a bit for connection to establish
  await new Promise(r => setTimeout(r, waitMs));
  
  try {
    await runner('bash', ['-c', WARP_TRACE_COMMAND]);
    s.stop(colors.green('Connection verified (warp=on)'));
  } catch (error) {
    s.stop(colors.red('Failed to verify connection with Cloudflare trace'));
    return false;
  }

  return true;
}
