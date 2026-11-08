#!/usr/bin/env python3
"""Validate a theme content file against SPEC.md. Usage: python3 -I validate.py content/<theme>.json"""
import sys, json, re, sqlite3
DB = "/home/katadmin/depression-material/depression_sources.db"
BANNED = [r"\bjust\b(?! as)", r"\bsimply\b", r"\ball you (need|have) to do\b", r"\bstop taking\b", r"\binstead of (your )?(medication|medicine|therapy|treatment)\b",
          r"\bshould have\b", r"\bsnap out\b", r"\bpull yourself\b", r"\bcheer up\b", r"\bget over\b", r"\bpray harder\b", r"\bcure[sd]?\b", r"\bguarantee"]
REQ = ["day_in_theme", "title", "quote", "quote_source", "explanation", "challenge", "reflection_questions", "scripture", "sources", "keywords"]
path = sys.argv[1]
errs, warns = [], []
try:
    data = json.load(open(path))
except Exception as e:
    print("INVALID JSON:", e); sys.exit(1)
db = sqlite3.connect(DB)
valid_ids = {r[0] for r in db.execute("SELECT id FROM sources")}
days = data.get("days", [])
if len(days) != 7: errs.append(f"need 7 days, got {len(days)}")
if not data.get("theme_intro") or len(data["theme_intro"].split()) < 20: errs.append("theme_intro missing or too short")
for d in days:
    n = d.get("day_in_theme", "?")
    for k in REQ:
        if k not in d or d[k] in ("", None, []): errs.append(f"day {n}: missing {k}")
    wc = len(str(d.get("explanation", "")).split())
    if not 120 <= wc <= 290: warns.append(f"day {n}: explanation {wc} words (want 140-260)")
    cw = len(str(d.get("challenge", "")).split())
    if not 30 <= cw <= 110: warns.append(f"day {n}: challenge {cw} words (want 40-90)")
    if len(d.get("title", "").split()) > 9: warns.append(f"day {n}: title long")
    q = d.get("reflection_questions", [])
    if not 2 <= len(q) <= 3: errs.append(f"day {n}: need 2-3 reflection questions")
    for s in d.get("sources", []):
        if s not in valid_ids: errs.append(f"day {n}: unknown source id {s}")
    if not 1 <= len(d.get("sources", [])) <= 6: warns.append(f"day {n}: {len(d.get('sources', []))} sources (want 2-5)")
    sc = d.get("scripture") or {}
    if not (sc.get("reference") and sc.get("text")): errs.append(f"day {n}: scripture needs reference and text")
    blob = " ".join(str(d.get(k, "")) for k in ["title", "explanation", "challenge"]) + " " + " ".join(q)
    for b in BANNED:
        for m in re.finditer(b, blob, re.I):
            warns.append(f"day {n}: phrase to review: '{blob[max(0,m.start()-30):m.end()+30].strip()}'")
    if re.search(r"\b\d+\s?mg\b|\bIU\b", blob): errs.append(f"day {n}: contains a dosage")
nums = sorted(d.get("day_in_theme") for d in days)
if nums != list(range(1, len(days) + 1)): errs.append(f"day_in_theme must be 1..7, got {nums}")
for w in warns: print("WARN", w)
for e in errs: print("ERROR", e)
print(f"{path}: {len(errs)} errors, {len(warns)} warnings")
sys.exit(1 if errs else 0)
