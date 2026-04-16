#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITEMAP_FILE="$ROOT_DIR/sitemap.xml"
BUILD_DATE="${BUILD_DATE:-$(date +%F)}"

if [[ ! -f "$SITEMAP_FILE" ]]; then
  echo "sitemap.xml not found: $SITEMAP_FILE" >&2
  exit 1
fi

TMP_FILE="$(mktemp)"
sed "s#<lastmod>[^<]*</lastmod>#<lastmod>${BUILD_DATE}</lastmod>#g" "$SITEMAP_FILE" > "$TMP_FILE"
mv "$TMP_FILE" "$SITEMAP_FILE"

echo "Updated sitemap lastmod to ${BUILD_DATE}"
