param([switch]$Purge)
if (Get-Command warp-cli -ErrorAction SilentlyContinue) {
    warp-cli disconnect
}
if ($Purge) {
    npx -y @artkins/warp-wizard uninstall --purge
} else {
    npx -y @artkins/warp-wizard uninstall
}
