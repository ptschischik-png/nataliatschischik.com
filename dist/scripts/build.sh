#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Build hook: keep sitemap.xml lastmod in sync with build date.
"$SCRIPT_DIR/update-sitemap-lastmod.sh"
