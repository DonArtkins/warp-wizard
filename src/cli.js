import { defineCommand, runMain } from 'citty';
import { runWizard } from './wizard/install-flow.js';
import { statusCommand } from './commands/status.js';
import { toggleCommand } from './commands/toggle.js';
import { doctorCommand } from './commands/doctor.js';
import { updateCommand } from './commands/update.js';
import { uninstallCommand } from './commands/uninstall.js';

const main = defineCommand({
  meta: {
    name: 'warp-wizard',
    version: '1.0.0',
    description: 'Cross-Platform Cloudflare WARP Installer & Manager CLI'
  },
  subCommands: {
    status: statusCommand,
    toggle: toggleCommand,
    doctor: doctorCommand,
    update: updateCommand,
    uninstall: uninstallCommand,
  },
  async run({ args }) {
    if (args._.length === 0) {
      await runWizard();
    }
  }
});

runMain(main);
