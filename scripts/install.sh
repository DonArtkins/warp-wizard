#!/bin/sh
set -e
echo "Starting warp-wizard installation..."
# Simple wrapper to just run npx
if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required to install warp-wizard."
  exit 1
fi
npx -y @artkins/warp-wizard
