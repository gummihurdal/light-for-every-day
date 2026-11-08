#!/usr/bin/env bash
# Hourly e-mail job for Light for Every Day. Install:  crontab -e  →  7 * * * * /home/katadmin/light-app/ops/cron.sh
set -euo pipefail
cd /home/katadmin/light-app
set -a; [ -f ops/.env ] && . ops/.env; set +a
node send-daily.js >> ops/send.log 2>&1
