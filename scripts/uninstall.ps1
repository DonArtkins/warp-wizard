param([switch]$Purge)
if (Get-Command warp-cli -ErrorAction SilentlyContinue) {
    warp-cli disconnect
}
if ($Purge) {
    npx -y warp-wizard-cli uninstall --purge
} else {
    npx -y warp-wizard-cli uninstall
}
