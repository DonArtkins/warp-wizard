export const toggleCommand = {
  async run() {
    const { execa } = await import('execa');
    try {
      const { stdout } = await execa('warp-cli', ['status']);
      if (stdout.includes('Status update: Connected')) {
        console.log('Disconnecting...');
        await execa('warp-cli', ['disconnect']);
      } else {
        console.log('Connecting...');
        await execa('warp-cli', ['connect']);
      }
    } catch (e) {
      console.error('Failed to toggle connection.');
    }
  }
};