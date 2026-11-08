# Light for Every Day

Daily encouragement grounded in research, for people living with depression. 84 days, 12 themes, one short message a day in four parts: **Quote · Explanation · Challenge · Questions for reflection**. Sister project of [graceforevery.day](https://graceforevery.day).

## Architecture

A deliberate replica of graceforevery.day: the same navy-and-gold sidebar shell (`assets/grace.css`, `assets/shell.js`), the same page set with renamed links, and the depression content in place of devotionals. Static site on GitHub Pages, content and subscribers in Supabase. No build step, no framework.

```
index.html        landing (hero, today strip, feature cards, verse, twelve weeks, footer) — mirrors Grace index
today.html        Today's Light = Grace devotion page (hero with flame, 3 cards, two-column body, reflection sidebar)
topics.html       The Twelve Weeks list        ·  learn.html?topic=<slug>&day=N  week reader with 7 days (Grace learn)
calendar.html     month calendar of the reader's 84 days with drawer preview + mood strip (Grace calendar)
archive.html      card grid of all messages, week filter, search (Grace archive)
tools.html        The Well: PHQ-9, breathing, three good things, activity menu
help.html         Help Now: crisis lines for 207 countries, when to see a doctor
subscribe.html    daily e-mail sign-up (double opt-in)  ·  confirm.html / unsubscribe.html
settings.html     profile, start date, language, text size, word-of-hope toggle, export/erase (Grace settings)
contact.html      contact form (stored in ld_feedback) ·  about.html method + evidence library ·  privacy.html
admin.html        editorial review queue with EN/DE/FR tabs (Supabase Auth magic link; e-mail must be in ld_admins)
assets/grace.css  the Grace design system, consolidated    ·  assets/shell.js  sidebar/mobile bar/crisis bar
assets/app.js     data layer: Supabase REST reads, local storage, language, helpers
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

## Languages

English is the source. German and French were machine-translated with Claude (`content/translate.mjs`, Opus 5.5, Luther 1912 / Segond 1910 for Scripture) and loaded with `content/import_lang.py`. They are marked as drafts under review in Settings; editors correct them in `admin.html`. The UI, e-mails and crisis footer are translated in `assets/app.js` (`UI`) and `send-daily.js` (`L`). A reader's language comes from Settings, `?lang=`, or the browser.

## Deploy

- Live at https://light.azurenexus.com/ — GitHub Pages deploys straight from `main` (branch mode; the repo token lacks the `workflow` scope, so the Actions workflows wait under `ops/github-workflows/`). For a custom domain add a `CNAME` file and a DNS CNAME to `gummihurdal.github.io`.
- E-mail job: runs hourly from the server cron (`ops/cron.sh`, env in `ops/.env`). It needs no service-role key; it calls the `ld_job_*` RPCs with `LD_JOB_SECRET` (table `ld_config`). Add `RESEND_API_KEY` and verify a sending domain in Resend to switch on real sending; until then it logs what it would send. GitHub secrets `SUPABASE_URL`, `LD_JOB_SECRET`, `FROM_EMAIL` and variable `SITE_URL` are already set for the Actions variant.
- Editors: `ld_admins` holds the owner and Valérie. In the Supabase dashboard enable the Email provider (magic link) and add `https://light.azurenexus.com/admin.html` to Authentication → URL configuration → Redirect URLs.

## Local

```
python3 -m http.server 8080   # then open http://localhost:8080
node send-daily.js --dry      # with env vars set; prints what it would send
```

## Safety commitments

Every page carries crisis numbers. No message advises against medication or therapy, gives dosages, diagnoses, or shames. The PHQ-9 tool routes scores ≥10 and any item-9 answer to a doctor and crisis lines. Content is reviewed by a person before publication.
