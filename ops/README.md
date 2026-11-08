# Operations

GitHub Pages deploys straight from the `main` branch (no Actions needed).
The workflow files in `github-workflows/` are kept for when the repository token has the `workflow` scope;
until then the hourly e-mail job runs from the server cron (`ops/cron.sh`).
