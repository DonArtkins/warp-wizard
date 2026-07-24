export const uninstallCommand = {
  args: {
    purge: { type: 'boolean', description: 'Remove WARP client as well' }
  },
  async run({ args }) {
    const { removeRcMarker } = await import('../lib/shell-rc.js');
    const pc = (await import('picocolors')).default;
    const p = await import('@clack/prompts');
    
    const confirm = await p.confirm({
      message: `Are you sure you want to uninstall warp-wizard${args.purge ? ' AND Cloudflare WARP' : ''}?`
    });
    
    if (confirm && !p.isCancel(confirm)) {
      await removeRcMarker();
      console.log(pc.green('warp-wizard PATH marker removed.'));
      if (args.purge) {
        console.log(pc.yellow('Please use your OS package manager to remove cloudflare-warp.'));
      }
    }
  }
};