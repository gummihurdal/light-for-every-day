#!/usr/bin/env bash
# Stamp a fresh version on asset links so Cloudflare/browser caches never serve stale CSS/JS. Run before committing UI changes.
cd "$(dirname "$0")/.."
V=$(date +%Y%m%d%H%M)
sed -i -E "s#(assets/(grace\.css|app\.js|shell\.js))(\?v=[0-9]+)?#\1?v=$V#g; s#register\('sw\.js(\?v=[0-9]+)?'\)#register('sw.js?v=$V')#g" *.html assets/shell.js
sed -i -E "s#const VERSION = 'ld-v[0-9]+';#const VERSION = 'ld-v$V';#" sw.js
echo "assets stamped v=$V"
