#!/usr/bin/env python3
"""Build SQL to load themes, sources and messages into Supabase (ld_* tables).
Usage: python3 -I content/import.py <out_dir> [--publish]
Writes out_dir/01_sources.sql, 02_themes.sql, 03_messages_<theme>.sql. Run them with the Supabase SQL editor / MCP.
Messages are inserted with status 'review' unless --publish is given.
"""
import sys, os, json, sqlite3, glob
DB = "/home/katadmin/depression-material/depression_sources.db"
HERE = os.path.dirname(os.path.abspath(__file__))
WEEKS = ["understanding_depression", "thinking_rumination_cbt", "exercise", "sleep_light_circadian", "nutrition", "hydration", "nature", "alcohol_smoking", "gratitude_positive_psych", "social_connection", "faith_spirituality", "medication_treatment"]
out = sys.argv[1]; publish = "--publish" in sys.argv
os.makedirs(out, exist_ok=True)
def q(s):
    if s is None: return "NULL"
    return "'" + str(s).replace("'", "''") + "'"
def jq(o): return q(json.dumps(o, ensure_ascii=False)) + "::jsonb"

db = sqlite3.connect(DB); db.row_factory = sqlite3.Row
rows = db.execute("SELECT id, filename, cr_title, title, authors, cr_year, year, journal, doi, kind, theme, pages, citation FROM sources ORDER BY id").fetchall()
vals = []
for r in rows:
    title = r["cr_title"] or r["title"]
    vals.append(f"({r['id']},{q(r['filename'])},{q(title)},{q(r['authors'])},{r['cr_year'] or r['year'] or 'NULL'},{q(r['journal'])},{q(r['doi'])},{q(r['kind'])},{q(r['theme'])},{r['pages'] or 'NULL'},{q(r['citation'])})")
open(os.path.join(out, "01_sources.sql"), "w").write("INSERT INTO ld_sources(id,filename,title,authors,year,journal,doi,kind,theme,pages,citation) VALUES\n" + ",\n".join(vals) +
  "\nON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, authors=EXCLUDED.authors, year=EXCLUDED.year, journal=EXCLUDED.journal, doi=EXCLUDED.doi, citation=EXCLUDED.citation, theme=EXCLUDED.theme;\n")

themes_sql, n_msgs = [], 0
for theme in WEEKS:
    p = os.path.join(HERE, theme + ".json")
    if not os.path.exists(p): print("missing", theme); continue
    data = json.load(open(p)); week = WEEKS.index(theme) + 1
    themes_sql.append(f"UPDATE ld_themes SET intro={q(data.get('theme_intro'))}, description={q(data.get('theme_intro'))} WHERE slug={q(theme)};")
    vals = []
    for d in data["days"]:
        day = (week - 1) * 7 + d["day_in_theme"]
        vals.append(f"({day},'en',{q(theme)},{q(d['title'])},{q(d['quote'])},{q(d['quote_source'])},{q(d['explanation'])},{q(d['challenge'])},{jq(d['reflection_questions'])},{jq(d['sources'])},{jq(d.get('scripture'))},ARRAY[{','.join(q(k) for k in d.get('keywords', []))}]::text[],{q('published' if publish else 'review')},{'NOW()' if publish else 'NULL'})")
        n_msgs += 1
    sql = ("INSERT INTO ld_messages(day_number,lang,theme,title,quote,quote_source,explanation,challenge,reflection_questions,sources,scripture,keywords,status,published_at) VALUES\n" + ",\n".join(vals) +
           "\nON CONFLICT (lang, day_number) DO UPDATE SET theme=EXCLUDED.theme, title=EXCLUDED.title, quote=EXCLUDED.quote, quote_source=EXCLUDED.quote_source, explanation=EXCLUDED.explanation, challenge=EXCLUDED.challenge, reflection_questions=EXCLUDED.reflection_questions, sources=EXCLUDED.sources, scripture=EXCLUDED.scripture, keywords=EXCLUDED.keywords, status=EXCLUDED.status, published_at=COALESCE(ld_messages.published_at, EXCLUDED.published_at), updated_at=NOW();\n")
    open(os.path.join(out, f"03_messages_{week:02d}_{theme}.sql"), "w").write(sql)
open(os.path.join(out, "02_themes.sql"), "w").write("\n".join(themes_sql) + "\n")
print(f"sources {len(rows)}, messages {n_msgs}, files in {out}")
