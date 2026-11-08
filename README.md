# Light for Every Day

Daily encouragement grounded in research, for people living with depression. 84 days, 12 themes, one short message a day in four parts: **Quote · Explanation · Challenge · Questions for reflection**. Sister project of [graceforevery.day](https://graceforevery.day).

## Architecture

Same shape as Grace: a static site on GitHub Pages, content and subscribers in Supabase, generators and senders run from GitHub Actions. No build step, no framework.

```
index.html        landing, start day 1
today.html        the day's message (day N since the reader's start date; ?day=N to browse)
journey.html      12 weeks, progress, mood chart
tools.html        PHQ-9 self-check, breathing, three good things, activity menu
help.html         crisis lines for 207 countries (crisis_lines.json), when to see a doctor
subscribe.html    daily e-mail sign-up (double opt-in)  ·  confirm.html / unsubscribe.html
settings.html     scripture on/off, text size, dark mode, start date, reminders, export/erase data
about.html        method + evidence library (every source with DOI link)
admin.html        editorial review queue (Supabase Auth magic link; e-mail must be in ld_admins)
assets/app.js     shared client: Supabase REST reads, local storage, chrome, helpers
assets/app.css    design system (light/dark, large type, phone-first)
sw.js, manifest.json, icons/   PWA: offline shell, installable
send-daily.js     hourly e-mail job (Resend)  ·  .github/workflows/send-daily.yml
content/          the 84 messages as JSON (one file per theme) + SPEC.md + validate.py + import.py
```

All personal data (journal, moods, check-ins, PHQ-9) stays in the reader's browser. Only "was this helpful" votes and e-mail subscriptions reach the database.

## Database (Supabase, prefix `ld_`)

`ld_themes` · `ld_sources` (231 documents, citation + DOI) · `ld_messages` (day_number, lang, theme, title, quote, quote_source, explanation, challenge, reflection_questions, sources, scripture, status) · `ld_subscribers` · `ld_deliveries` · `ld_feedback` · `ld_admins`.
Public can read themes, sources and **published** messages only; insert subscribers and feedback. Editors listed in `ld_admins` can read/update everything after signing in. Confirm/unsubscribe go through `ld_confirm(token)` / `ld_unsubscribe(token)`.

Schema lives in Supabase migrations (`light_for_every_day_schema`, `ld_messages_scripture_keywords`).

## Content pipeline

1. Source corpus (231 files from the EUD share) → `/home/katadmin/depression-material/` : text extraction, SQLite with full-text search, Crossref metadata, per-theme condensed briefs (`knowledge/`).
2. Each theme's 7 messages were drafted from those briefs under `content/SPEC.md` (voice, safety rules, no invented quotes, no dosages, never against treatment) and checked with `content/validate.py`.
3. `python3 -I content/import.py sql_out [--publish]` turns the JSON into SQL for Supabase. Messages default to status `review`; editors publish in `admin.html`.

To add a language: write `content/<theme>.<lang>.json` with the same shape, import with `lang`, and the app reads `?lang=` (not yet wired in the UI).

## Deploy

- Push to `main` → `.github/workflows/pages.yml` deploys to GitHub Pages. Set the custom domain in repo settings and add a `CNAME` file.
- Secrets for the e-mail job: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `FROM_EMAIL`; variable `SITE_URL`. Verify the sending domain in Resend.
- Add editors: `INSERT INTO ld_admins(email, name) VALUES ('valerie@…', 'Valérie');` and enable the Email (magic link) provider in Supabase Auth with the site URL in the redirect allow-list.

## Local

```
python3 -m http.server 8080   # then open http://localhost:8080
node send-daily.js --dry      # with env vars set; prints what it would send
```

## Safety commitments

Every page carries crisis numbers. No message advises against medication or therapy, gives dosages, diagnoses, or shames. The PHQ-9 tool routes scores ≥10 and any item-9 answer to a doctor and crisis lines. Content is reviewed by a person before publication.
