#!/usr/bin/env node
// Translate the 84 English messages (and theme titles) into other languages with Claude.
// Output: content/<theme>.<lang>.json (same shape as the English files) + content/themes.<lang>.json
// Hard cost cap: stops when the running estimate exceeds COST_CAP_USD.
//   ANTHROPIC_API_KEY=... node content/translate.mjs de fr
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const MODEL = 'claude-opus-5-5';
const PRICE = { in: 4 / 1e6, out: 20 / 1e6, cacheRead: 0.2 / 1e6, cacheWrite: 5 / 1e6 };
const COST_CAP_USD = parseFloat(process.env.COST_CAP_USD || '30');
const CONCURRENCY = 3;
const WEEKS = ['understanding_depression', 'thinking_rumination_cbt', 'exercise', 'sleep_light_circadian', 'nutrition', 'hydration', 'nature', 'alcohol_smoking', 'gratitude_positive_psych', 'social_connection', 'faith_spirituality', 'medication_treatment'];
const LANGS = { de: { name: 'German (Swiss/standard German, formal "Sie")', adj: 'German', translated: '(übersetzt)', bible: 'Luther 1912 or Schlachter 1951 (public domain); tag the reference e.g. "Psalm 34,18 (Luther 1912)"' },
                fr: { name: 'French (formal "vous")', adj: 'French', translated: '(traduction)', bible: 'Louis Segond 1910 (public domain); tag the reference e.g. "Psaume 34:18 (Segond 1910)"' },
                es: { name: 'Spanish (neutral, understood in Spain and Latin America, formal "usted")', adj: 'Spanish', translated: '(traducción)', bible: 'Reina-Valera 1909 (public domain); tag the reference e.g. "Salmos 34:18 (Reina-Valera 1909)"' } };
const targets = process.argv.slice(2).filter(l => LANGS[l]);
if (!targets.length) { console.error('usage: node translate.mjs de fr es'); process.exit(1); }

const client = new Anthropic();
let spent = 0, calls = 0;
const logf = fs.createWriteStream(path.join(here, 'translate.log'), { flags: 'a' });
const log = s => { const line = `${new Date().toISOString()} ${s}`; console.log(line); logf.write(line + '\n'); };
function addUsage(u) {
  spent += (u.input_tokens || 0) * PRICE.in + (u.output_tokens || 0) * PRICE.out + (u.cache_read_input_tokens || 0) * PRICE.cacheRead + (u.cache_creation_input_tokens || 0) * PRICE.cacheWrite;
  calls++;
  if (spent > COST_CAP_USD) { log(`COST CAP ${COST_CAP_USD} USD reached (spent ${spent.toFixed(2)}). Stopping.`); process.exit(2); }
}

const SYSTEM = (lang) => `You are a careful literary translator for "Light for Every Day", a programme of daily messages for people living with depression, written in English for a Swiss and European church-affiliated audience. You translate into ${LANGS[lang].name}.

Rules:
- Translate meaning and tone faithfully: warm, direct, unhurried, never preachy. Short sentences. Natural ${LANGS[lang].adj}, not word-for-word. Keep paragraph breaks (\\n\\n) exactly.
- Keep every number, study detail, author name and year exactly as in the English. Do not add or remove claims.
- "quote": if it is a sentence from a research paper or an author, translate it and append " ${LANGS[lang].translated}" to quote_source. If it is a Bible verse, use ${LANGS[lang].bible} and put the translation name in quote_source instead of (WEB)/(KJV).
- "scripture": give the verse in ${LANGS[lang].bible}; "reference" in the target language's book-name convention with the translation tag.
- Keep JSON keys, "day_in_theme", "sources" and "keywords" unchanged (translate keyword words, keep the array).
- Crisis line numbers and "talk to your doctor" style safety sentences must survive intact.
- Respond with ONLY the JSON object, no markdown fences, no commentary.`;

async function translateDay(lang, theme, day) {
  const user = `Translate this day's message. Return the same JSON object with translated values.\n\n${JSON.stringify(day, null, 1)}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await client.beta.messages.create({
        model: MODEL, max_tokens: 16000, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default',
        system: [{ type: 'text', text: SYSTEM(lang), cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: user }], output_config: { effort: 'medium' }
      });
      addUsage(r.usage);
      if (r.stop_reason === 'refusal') throw new Error('refusal ' + (r.stop_details?.category || ''));
      const text = r.content.filter(b => b.type === 'text').map(b => b.text).join('').trim().replace(/^```json|```$/g, '').trim();
      const out = JSON.parse(text);
      for (const k of ['title', 'quote', 'quote_source', 'explanation', 'challenge', 'reflection_questions', 'scripture']) if (!out[k]) throw new Error('missing ' + k);
      out.day_in_theme = day.day_in_theme; out.sources = day.sources; out.keywords = out.keywords || day.keywords;
      return out;
    } catch (e) {
      log(`retry ${attempt} ${lang} ${theme} d${day.day_in_theme}: ${e.message.slice(0, 120)}`);
      if (attempt === 3) throw e;
      await new Promise(r => setTimeout(r, 3000 * attempt));
    }
  }
}
async function translateThemes(lang) {
  const themes = JSON.parse(fs.readFileSync(path.join(here, 'themes.en.json'), 'utf8'));
  const r = await client.beta.messages.create({
    model: MODEL, max_tokens: 16000, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default',
    system: SYSTEM(lang), messages: [{ role: 'user', content: `Translate the "title", "subtitle" and "intro" of each theme. Keep "slug". Return the same JSON array.\n\n${JSON.stringify(themes, null, 1)}` }], output_config: { effort: 'medium' }
  });
  addUsage(r.usage);
  const text = r.content.filter(b => b.type === 'text').map(b => b.text).join('').trim().replace(/^```json|```$/g, '').trim();
  fs.writeFileSync(path.join(here, `themes.${lang}.json`), JSON.stringify(JSON.parse(text), null, 2));
  log(`${lang} themes done · spent $${spent.toFixed(2)}`);
}

async function runPool(tasks) {
  let i = 0; const workers = Array.from({ length: CONCURRENCY }, async () => { while (i < tasks.length) { const t = tasks[i++]; await t(); } });
  await Promise.all(workers);
}

for (const lang of targets) {
  if (!fs.existsSync(path.join(here, `themes.${lang}.json`))) await translateThemes(lang);
  for (const theme of WEEKS) {
    const outp = path.join(here, `${theme}.${lang}.json`);
    if (fs.existsSync(outp)) { log(`skip ${lang} ${theme} (exists)`); continue; }
    const src = JSON.parse(fs.readFileSync(path.join(here, `${theme}.json`), 'utf8'));
    const days = new Array(7);
    await runPool(src.days.map(d => async () => { days[d.day_in_theme - 1] = await translateDay(lang, theme, d); }));
    const introR = await client.messages.create({ model: MODEL, max_tokens: 4000, system: SYSTEM(lang), messages: [{ role: 'user', content: `Translate this paragraph. Return only the translated text.\n\n${src.theme_intro}` }], output_config: { effort: 'low' } });
    addUsage(introR.usage);
    const intro = introR.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
    fs.writeFileSync(outp, JSON.stringify({ theme, lang, theme_intro: intro, days }, null, 2));
    log(`${lang} ${theme} done · calls ${calls} · spent $${spent.toFixed(2)}`);
  }
}
log(`ALL DONE · calls ${calls} · spent $${spent.toFixed(2)}`);
