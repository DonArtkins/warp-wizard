export const doctorCommand = {
  async run() {
    const { execa } = await import('execa');
    const pc = (await import('picocolors')).default;
    console.log(pc.cyan('Running Diagnostics...'));
    try {
      console.log('Running warp-diag...');
      await execa('warp-diag');
      
      console.log('Checking connection...');
      const { stdout: status } = await execa('warp-cli', ['status']);
      const isConnected = status.includes('Status update: Connected');
      console.log(`Connected: ${isConnected ? pc.green('Yes') : pc.red('No')}`);
      
      const { stdout: trace } = await execa('curl', ['-s', 'https://www.cloudflare.com/cdn-cgi/trace/']);
      const isTunneled = trace.includes('warp=on') || trace.includes('warp=plus');
      console.log(`Traffic tunneled: ${isTunneled ? pc.green('Yes') : pc.red('No')}`);
      
      if (!isTunneled && isConnected) {
        console.log(pc.yellow('Warning: WARP is connected but traffic does not appear to be routing through the tunnel. Check for DPI middleboxes resetting connections.'));
      }
    } catch (e) {
      console.error(pc.red('Diagnostics failed.'));
    }
  }
};