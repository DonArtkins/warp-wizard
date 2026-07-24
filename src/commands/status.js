export const statusCommand = {
  async run() {
    const { execa } = await import('execa');
    try {
      const { stdout } = await execa('warp-cli', ['status']);
      console.log(stdout);
    } catch (e) {
      console.error('Failed to get status. Is WARP installed?');
    }
  }
};