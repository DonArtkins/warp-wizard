import { execa } from 'execa';

export function buildAptRepositoryScript() {
  return `set -e
curl -fsSL https://pkg.cloudflareclient.com/pubkey.gpg | sudo gpg --yes --dearmor --output /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg
CODENAME=$(lsb_release -cs 2>/dev/null || echo "bookworm")
if ! curl -fsS --head "https://pkg.cloudflareclient.com/dists/$CODENAME/Release" >/dev/null; then CODENAME="bookworm"; fi
echo "deb [signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ $CODENAME main" | sudo tee /etc/apt/sources.list.d/cloudflare-client.list`;
}

export function buildAptInstallScript() {
  return 'sudo apt-get update && sudo apt-get install cloudflare-warp';
}

export async function installApt(callbacks, runner = execa) {
  const interactiveOptions = { stdio: 'inherit' };

  callbacks.onStart('Adding Cloudflare GPG key and APT repository...');
  try {
    await runner('bash', ['-c', buildAptRepositoryScript()], interactiveOptions);
  } catch (e) {
    callbacks.onError('GPG key or APT repository setup failed. ' + e.message);
    throw e;
  }

  callbacks.onStart('Installing cloudflare-warp...');
  await runner('bash', ['-c', buildAptInstallScript()], interactiveOptions);

  callbacks.onSuccess('WARP installed successfully via APT.');
}

export async function uninstallApt() {
  await execa('sudo', ['apt-get', 'remove', '-y', 'cloudflare-warp']);
}
