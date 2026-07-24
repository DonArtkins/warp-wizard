#!/bin/sh
set -e
if command -v warp-cli >/dev/null 2>&1; then
  warp-cli disconnect || true
fi
if [ "$1" = "--purge" ]; then
  npx -y warp-wizard-cli uninstall --purge
else
  npx -y warp-wizard-cli uninstall
fi
