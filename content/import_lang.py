#!/usr/bin/env python3
"""Load translated content (content/<theme>.<lang>.json + content/themes.<lang>.json) into Supabase.
Messages go through the ld_import RPC (needs LD_JOB_SECRET); theme titles through ld_theme_i18n (needs SUPABASE_SECRET_KEY).
Usage: LD_JOB_SECRET=... SUPABASE_SECRET_KEY=... python3 -I content/import_lang.py de [--publish]
"""
import sys, os, json, subprocess, glob
HERE = os.path.dirname(os.path.abspath(__file__))
SB = 'https://mjphpctvuxmbjhmcscoj.supabase.co'; ANON = 'sb_publishable_MDPfXyMjG0eadmvp7uoqdg_EHwj4Alm'
WEEKS = ["understanding_depression", "thinking_rumination_cbt", "exercise", "sleep_light_circadian", "nutrition", "hydration", "nature", "alcohol_smoking", "gratitude_positive_psych", "social_connection", "faith_spirituality", "medication_treatment"]
lang = sys.argv[1]; publish = '--publish' in sys.argv
SECRET = os.environ['LD_JOB_SECRET']; SVC = os.environ.get('SUPABASE_SECRET_KEY')
def curl(url, body, key, extra=()):
    import tempfile
    p = os.path.join(tempfile.gettempdir(), 'ld_payload_lang.json')
    json.dump(body, open(p, 'w'), ensure_ascii=False)
    r = subprocess.run(['curl', '-s', '-X', 'POST', url, '-H', f'apikey: {key}', '-H', f'Authorization: Bearer {key}', '-H', 'Content-Type: application/json', *extra, '--data-binary', f'@{p}'], capture_output=True, text=True)
    return r.stdout
problems = []; msgs = []
for i, theme in enumerate(WEEKS):
    fp = os.path.join(HERE, f'{theme}.{lang}.json')
    if not os.path.exists(fp): problems.append(f'missing {fp}'); continue
    d = json.load(open(fp))
    if len(d['days']) != 7: problems.append(f'{theme}: {len(d["days"])} days')
    for day in d['days']:
        for k in ['title', 'quote', 'quote_source', 'explanation', 'challenge', 'reflection_questions', 'scripture', 'sources']:
            if not day.get(k): problems.append(f'{theme} d{day.get("day_in_theme")}: missing {k}')
        if not (2 <= len(day.get('reflection_questions', [])) <= 3): problems.append(f'{theme} d{day.get("day_in_theme")}: questions')
        msgs.append({"day_number": i * 7 + day["day_in_theme"], "lang": lang, "theme": theme, "title": day["title"], "quote": day["quote"], "quote_source": day["quote_source"], "explanation": day["explanation"], "challenge": day["challenge"],
                     "reflection_questions": day["reflection_questions"], "sources": day["sources"], "scripture": day["scripture"], "keywords": day.get("keywords", []), "status": "published" if publish else "review"})
for p in problems: print('PROBLEM', p)
if problems and '--force' not in sys.argv: sys.exit(1)
for k in range(0, len(msgs), 28):
    print('messages', k, '->', curl(f'{SB}/rest/v1/rpc/ld_import', {"p_secret": SECRET, "p_kind": "messages", "p_rows": msgs[k:k + 28]}, ANON))
tp = os.path.join(HERE, f'themes.{lang}.json')
if os.path.exists(tp) and SVC:
    rows = [{"slug": t["slug"], "lang": lang, "title": t["title"], "subtitle": t.get("subtitle"), "intro": t.get("intro")} for t in json.load(open(tp))]
    print('themes', curl(f'{SB}/rest/v1/ld_theme_i18n?on_conflict=slug,lang', rows, SVC, ('-H', 'Prefer: resolution=merge-duplicates,return=minimal')) or 'ok')
print(f'{lang}: {len(msgs)} messages imported ({"published" if publish else "review"})')
