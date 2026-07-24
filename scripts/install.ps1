Write-Host "Starting warp-wizard installation..."
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is required to install warp-wizard."
    exit 1
}
npx -y @donartkins/warp-wizard
