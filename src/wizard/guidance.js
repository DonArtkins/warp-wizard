import * as p from '@clack/prompts';
import pc from 'picocolors';

export function printGuidance() {
  p.note(
    pc.bold('When to use CLI vs GUI:') + '\n' +
    '• Headless server / CI / scripts: ' + pc.cyan('warp-cli') + '\n' +
    '• Daily desktop toggling: ' + pc.cyan('System tray icon') + '\n' +
    '• First-time setup / debugging: ' + pc.cyan('warp-wizard doctor') + '\n' +
    '• Advanced split tunneling: ' + pc.cyan('warp-cli tunnel ...') + '\n\n' +
    pc.red('Caution:') + ' Disconnect before logging into platforms with strict anti-VPN policies.',
    'Guidance'
  );
}
