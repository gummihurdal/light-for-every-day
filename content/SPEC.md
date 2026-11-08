# Content specification — Light for Every Day

Daily messages for people living with depression. 12 themes × 7 days = 84 days. English first.
Structure requested by Valérie (EUD): **Quote → Explanation → Challenge → Questions for personal reflection**.

## Who reads this
Someone who is depressed right now. Concentration is poor, energy is low, self-criticism is loud, hope is thin.
They may be a church member or may have no faith at all. They may be on medication or in therapy, or not yet.
They are reading on a phone, probably in the morning, possibly in bed. Each message must be readable in 3–4 minutes.

## Voice
- Warm, direct, unhurried. Second person ("you"). Short sentences. One idea per paragraph.
- Honest about how hard depression is. Never cheerful, never preachy, never "just".
- Evidence-based: the explanation draws on the research in the brief and says so in plain words ("In a study of 156 older adults, ..."). Numbers only when they help the reader; round them.
- Zero jargon unless explained in the same sentence (e.g. "rumination, the mind replaying the same painful thoughts").
- Spiritual content is gentle and optional (see `scripture`). It never replaces practical help and never implies depression is a lack of faith.

## Hard safety rules (every message is checked against these)
1. Never suggest stopping, skipping, reducing or avoiding medication or therapy. Supplements and lifestyle are "alongside", never "instead of".
2. Never diagnose, never promise recovery, never give dosages. "Talk to your doctor before..." for supplements, fasting, big diet changes, intense exercise, sleep deprivation.
3. Never shame: no "you should have", no "simply", no "all you need to do".
4. If a message touches hopelessness or suicidal thoughts, it must point to immediate help (the app shows crisis lines on every page; the text may say "if you are thinking about ending your life, please call a crisis line today — the Help page has your country's number").
5. Alcohol/smoking: compassionate, no moralising; nicotine and alcohol are coping attempts that backfire.
6. Faith week: hope and trust; never "pray harder", never suggest God is punishing; acknowledge believers also get depressed (Elijah, David, Jeremiah).
7. Medication week: balanced. Antidepressants help many, especially in moderate–severe depression; for mild depression the evidence is weaker and lifestyle/therapy matter more. Always "with your doctor".

## Challenge design
- One action, doable today, within 2–20 minutes, by someone with very low energy. Specific (what, when, how long).
- Scale down: "If that is too much today, then ...". Behavioural activation logic: action before motivation.
- Over the 7 days of a theme, challenges build gently (day 1 notice/observe → day 7 small commitment).

## Reflection questions
- 2 or 3 questions. Gentle, personal, open. Never interrogating. The reader may write answers in a private journal in the app.

## Quote rules (no invented quotes)
`quote` must be one of:
- (a) a verbatim sentence from a source in the brief (then `quote_source` = authors (year), and list that source id in `sources`), or
- (b) a Bible verse, public-domain translation (WEB or KJV), `quote_source` = "Psalm 34:18 (WEB)", or
- (c) a widely documented quotation you are certain of, with the work named ("Viktor Frankl, Man's Search for Meaning"). If in any doubt, use (a) or (b).

## Scripture (optional card, user can switch off)
`scripture` = {"reference": "...", "text": "..."} from a public-domain translation (WEB preferred, KJV ok), chosen to fit the day. Include on every day; keep it short (1–2 verses). The app shows it as "A word of hope" only if the reader has it enabled.

## Sources
`sources` = list of source ids from the brief that the explanation actually draws on (2–5). The app renders full citations with DOI links from the database. Do not cite what you did not use.

## Output format
One JSON file per theme: `content/<theme_slug>.json`

```json
{
  "theme": "exercise",
  "theme_intro": "2–3 sentences introducing the week, shown on the Journey page.",
  "days": [
    {
      "day_in_theme": 1,
      "title": "Short title, max 8 words",
      "quote": "...",
      "quote_source": "...",
      "explanation": "Paragraph one.\n\nParagraph two.\n\nParagraph three (optional). 140–260 words total.",
      "challenge": "One concrete action for today. 40–90 words. Include the scale-down.",
      "reflection_questions": ["...", "...", "..."],
      "scripture": {"reference": "Psalm 34:18 (WEB)", "text": "..."},
      "sources": [14, 27],
      "keywords": ["exercise", "walking", "mood"]
    }
  ]
}
```

Exactly 7 days per theme. Valid JSON, UTF-8, no trailing commas. `day_in_theme` 1..7; the app computes `day_number = (week-1)*7 + day_in_theme`.

## Week order
1 understanding_depression · 2 thinking_rumination_cbt · 3 exercise · 4 sleep_light_circadian · 5 nutrition · 6 hydration · 7 nature · 8 alcohol_smoking · 9 gratitude_positive_psych · 10 social_connection · 11 faith_spirituality · 12 medication_treatment

## Quality bar
Imagine Valérie forwarding one message to a friend who has been depressed for months. It must feel like it was written for that friend by someone who both read the research and has sat with depressed people. Specific beats general. Concrete beats abstract. Kind beats clever.
