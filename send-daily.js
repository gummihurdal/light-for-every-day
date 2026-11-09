#!/usr/bin/env node
// ============================================================
// Light for Every Day — daily e-mail sender
// Runs hourly (server cron or GitHub Actions). For every confirmed subscriber
// whose local send_hour is now, sends the message for their current day, once.
// Also sends one confirmation e-mail to new, unconfirmed subscribers.
//
// Needs no service-role key: it talks to Supabase through the ld_job_* RPCs,
// which are guarded by LD_JOB_SECRET (stored in table ld_config).
//
//   npm install resend
//   SUPABASE_URL, SUPABASE_ANON_KEY, LD_JOB_SECRET, RESEND_API_KEY, FROM_EMAIL, SITE_URL
//   node send-daily.js [--dry]
// ============================================================
import { Resend } from 'resend';

const SB = (process.env.SUPABASE_URL || 'https://mjphpctvuxmbjhmcscoj.supabase.co').replace(/\/$/, '');
const ANON = process.env.SUPABASE_ANON_KEY || 'sb_publishable_MDPfXyMjG0eadmvp7uoqdg_EHwj4Alm';
const SECRET = process.env.LD_JOB_SECRET;
const FROM = process.env.FROM_EMAIL || 'Light for Every Day <hello@lightforevery.day>';
const SITE = (process.env.SITE_URL || 'https://light.azurenexus.com').replace(/\/$/, '');
const TOTAL = 84;
const DRY = process.argv.includes('--dry');
if (!SECRET) { console.error('LD_JOB_SECRET missing'); process.exit(1); }
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function rpc(fn, args) {
  const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: ANON, Authorization: 'Bearer ' + ANON, 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ p_secret: SECRET }, args)) });
  if (!r.ok) throw new Error(`${fn} ${r.status} ${await r.text()}`);
  const t = await r.text(); return t ? JSON.parse(t) : null;
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const paras = s => String(s || '').split(/\n\s*\n|\n/).filter(p => p.trim()).map(p => `<p style="margin:0 0 14px;line-height:1.65">${esc(p.trim())}</p>`).join('');

function localNow(tz) {
  let parts;
  try { parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: 'numeric', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()); }
  catch (e) { return localNow('Europe/Zurich'); }
  const g = k => parts.find(p => p.type === k).value;
  return { hour: parseInt(g('hour')) % 24, date: `${g('year')}-${g('month')}-${g('day')}` };
}
// started_on is the sign-up date; day 1 is delivered the next morning
function dayNumber(startedOn, localDate) { return Math.round((new Date(localDate + 'T00:00:00Z') - new Date(startedOn + 'T00:00:00Z')) / 86400000); }

const L = {
  en: { day: 'Day', of: 'of', quote: 'Quote', expl: 'Explanation', chal: "Today's challenge", refl: 'Questions for reflection', hope: 'A word of hope', open: 'Open in the app · journal & sources', crisis: 'If you are in crisis or thinking about ending your life, please reach out now.', other: 'Other countries →', disclaimer: 'Light for Every Day offers daily encouragement grounded in research. It is not therapy and does not replace your doctor.', why: 'You receive one message a day because you signed up at', unsub: 'Unsubscribe', privacy: 'Privacy', confirmSubj: 'Please confirm: Light for Every Day', confirmH: 'One tap to begin', confirmP: 'Thank you for signing up. Please confirm your address and your first message will arrive tomorrow morning.', confirmBtn: 'Yes, send me the daily message', ignore: 'If you did not sign up, ignore this e-mail and nothing more will be sent.' },
  de: { day: 'Tag', of: 'von', quote: 'Zitat', expl: 'Erklärung', chal: 'Die Aufgabe für heute', refl: 'Fragen zum Nachdenken', hope: 'Ein Wort der Hoffnung', open: 'In der App öffnen · Tagebuch & Quellen', crisis: 'Wenn Sie in einer Krise sind oder daran denken, sich das Leben zu nehmen, holen Sie sich bitte jetzt Hilfe.', other: 'Andere Länder →', disclaimer: 'Light for Every Day bietet tägliche Ermutigung auf Grundlage der Forschung. Es ist keine Therapie und ersetzt nicht Ihren Arzt oder Ihre Ärztin.', why: 'Sie erhalten täglich eine Nachricht, weil Sie sich angemeldet haben auf', unsub: 'Abmelden', privacy: 'Datenschutz', confirmSubj: 'Bitte bestätigen: Light for Every Day', confirmH: 'Ein Klick zum Anfangen', confirmP: 'Danke für Ihre Anmeldung. Bitte bestätigen Sie Ihre Adresse; die erste Nachricht kommt morgen früh.', confirmBtn: 'Ja, schickt mir die tägliche Nachricht', ignore: 'Falls Sie sich nicht angemeldet haben, ignorieren Sie diese E-Mail; es folgt nichts weiter.' },
  fr: { day: 'Jour', of: 'sur', quote: 'Citation', expl: 'Explication', chal: "Le défi du jour", refl: 'Questions pour la réflexion', hope: "Une parole d'espérance", open: "Ouvrir dans l'app · journal et sources", crisis: 'Si vous êtes en crise ou si vous pensez à mettre fin à vos jours, demandez de l’aide maintenant.', other: 'Autres pays →', disclaimer: 'Light for Every Day propose un encouragement quotidien fondé sur la recherche. Ce n’est pas une thérapie et cela ne remplace pas votre médecin.', why: 'Vous recevez un message par jour parce que vous vous êtes inscrit·e sur', unsub: 'Se désabonner', privacy: 'Confidentialité', confirmSubj: 'Merci de confirmer : Light for Every Day', confirmH: 'Un clic pour commencer', confirmP: 'Merci de votre inscription. Confirmez votre adresse et votre premier message arrivera demain matin.', confirmBtn: 'Oui, envoyez-moi le message quotidien', ignore: 'Si vous ne vous êtes pas inscrit·e, ignorez cet e-mail ; rien d’autre ne sera envoyé.' },
  es: { day: 'Día', of: 'de', quote: 'Cita', expl: 'Explicación', chal: 'El reto de hoy', refl: 'Preguntas para reflexionar', hope: 'Una palabra de esperanza', open: 'Abrir en la app · diario y fuentes', crisis: 'Si está en crisis o piensa en quitarse la vida, pida ayuda ahora.', other: 'Otros países →', disclaimer: 'Light for Every Day ofrece ánimo diario basado en la investigación. No es terapia y no sustituye a su médico.', why: 'Recibe un mensaje al día porque se inscribió en', unsub: 'Darse de baja', privacy: 'Privacidad', confirmSubj: 'Por favor confirme: Light for Every Day', confirmH: 'Un clic para empezar', confirmP: 'Gracias por inscribirse. Confirme su dirección y su primer mensaje llegará mañana por la mañana.', confirmBtn: 'Sí, envíenme el mensaje diario', ignore: 'Si usted no se inscribió, ignore este correo y no se enviará nada más.' }
};

function layout(t, inner, footer) {
  return `<!doctype html><html><body style="margin:0;background:#FAF7F2;font-family:Georgia,'Times New Roman',serif;color:#2B3440">
  <div style="max-width:600px;margin:0 auto;padding:28px 18px">
    <div style="text-align:center;margin-bottom:18px"><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#D98E3B;vertical-align:middle"></span>
      <span style="font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#8A9099;vertical-align:middle;margin-left:8px">Light for Every Day · small daily steps out of depression</span></div>
    ${inner}
    <div style="margin-top:28px;padding:14px 16px;border-radius:12px;background:#F8E7E7;font-size:14px;line-height:1.5;font-family:Arial,sans-serif">
      <strong style="color:#C96F6F">${t.crisis}</strong> Schweiz/Suisse/Switzerland <b>143</b> · <b>147</b> · <b>144</b>. <a href="${SITE}/help.html" style="color:#5E86B5">${t.other}</a>
    </div>
    <div style="margin-top:18px;font-size:12.5px;color:#8A9099;line-height:1.6;font-family:Arial,sans-serif">${t.disclaimer}<br>${footer}</div>
  </div></body></html>`;
}
const card = (label, body, bg = '#fff', border = '1px solid #E6DFD3') => `<div style="background:${bg};border:${border};border-radius:14px;padding:20px 22px;margin-bottom:14px;font-size:17px"><div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8A9099;font-family:Arial,sans-serif;margin-bottom:10px">${label}</div>${body}</div>`;

function messageHtml(m, day, lang, unsubUrl) {
  const t = L[lang] || L.en;
  const qs = (m.reflection_questions || []).map(q => `<li style="margin-bottom:8px">${esc(q)}</li>`).join('');
  const sc = m.scripture && m.scripture.text ? card(t.hope, `<div style="font-size:17px;line-height:1.5">${esc(m.scripture.text)}</div><div style="font-size:13px;color:#5A6472;margin-top:6px;font-family:Arial,sans-serif">${esc(m.scripture.reference)}</div>`, '#FBEEDB', 'none') : '';
  const inner = `<div style="font-size:13px;color:#8A9099;font-family:Arial,sans-serif;margin-bottom:6px">${t.day} ${day} ${t.of} ${TOTAL}</div>
    <h1 style="font-size:28px;font-weight:500;margin:0 0 20px;line-height:1.2">${esc(m.title)}</h1>
    ${card(t.quote, `<div style="font-size:21px;line-height:1.4;font-style:italic">“${esc(m.quote)}”</div><div style="font-size:14px;color:#5A6472;margin-top:10px;font-family:Arial,sans-serif">— ${esc(m.quote_source)}</div>`)}
    ${card(t.expl, paras(m.explanation))}
    ${card(t.chal, paras(m.challenge), '#E6F1EB', 'none')}
    ${card(t.refl, `<ol style="margin:0;padding-left:22px;line-height:1.5">${qs}</ol>`)}
    ${sc}
    <div style="text-align:center;margin-top:22px"><a href="${SITE}/today.html?day=${day}&lang=${lang}" style="display:inline-block;background:#D98E3B;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-family:Arial,sans-serif;font-weight:bold">${t.open}</a></div>`;
  return layout(t, inner, `${t.why} ${SITE}. <a href="${unsubUrl}" style="color:#8A9099">${t.unsub}</a> · <a href="${SITE}/privacy.html" style="color:#8A9099">${t.privacy}</a>`);
}
function confirmHtml(lang, confirmUrl, unsubUrl) {
  const t = L[lang] || L.en;
  return layout(t, `<h1 style="font-size:26px;font-weight:500;margin:0 0 16px">${t.confirmH}</h1><p style="font-size:17px;line-height:1.6">${t.confirmP}</p>
    <div style="text-align:center;margin:24px 0"><a href="${confirmUrl}" style="display:inline-block;background:#D98E3B;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-family:Arial,sans-serif;font-weight:bold">${t.confirmBtn}</a></div>
    <p style="font-size:14px;color:#5A6472;font-family:Arial,sans-serif">${t.ignore}</p>`, `<a href="${unsubUrl}" style="color:#8A9099">${t.unsub}</a> · <a href="${SITE}/privacy.html" style="color:#8A9099">${t.privacy}</a>`);
}
function textVersion(m, day, lang, unsubUrl) {
  const t = L[lang] || L.en;
  return `LIGHT FOR EVERY DAY · ${t.day} ${day} ${t.of} ${TOTAL}\n\n${m.title}\n\n"${m.quote}"\n— ${m.quote_source}\n\n${m.explanation}\n\n${t.chal.toUpperCase()}\n${m.challenge}\n\n${t.refl.toUpperCase()}\n${(m.reflection_questions || []).map((q, i) => `${i + 1}. ${q}`).join('\n')}\n${m.scripture?.text ? `\n${t.hope.toUpperCase()}\n${m.scripture.text} (${m.scripture.reference})\n` : ''}\n${SITE}/today.html?day=${day}&lang=${lang}\n\n${t.crisis} 143 · 147 · 144. ${SITE}/help.html\n\n${t.disclaimer} ${t.unsub}: ${unsubUrl}`;
}

async function send(to, subject, html, text) {
  if (DRY || !resend) { console.log(`[${DRY ? 'dry' : 'no-provider'}] → ${to} | ${subject}`); return { id: 'dry' }; }
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html, text });
  if (error) throw new Error(error.message || JSON.stringify(error));
  return data;
}

async function main() {
  const subs = await rpc('ld_job_subscribers', {});
  let sent = 0, confirms = 0, skipped = 0, failed = 0;
  for (const s of subs) {
    const lang = ['en', 'de', 'fr', 'es'].includes(s.lang) ? s.lang : 'en';
    const unsubUrl = `${SITE}/unsubscribe.html?t=${s.token}`;
    if (!s.confirmed) {
      if (s.confirm_sent) { skipped++; continue; }
      try {
        const r = await send(s.email, L[lang].confirmSubj, confirmHtml(lang, `${SITE}/confirm.html?t=${s.token}`, unsubUrl), `${SITE}/confirm.html?t=${s.token}\n${unsubUrl}`);
        if (!DRY) await rpc('ld_job_record', { p_subscriber: s.id, p_message: null, p_status: 'confirm', p_provider_id: r.id });
        confirms++;
      } catch (e) { failed++; console.error('confirm failed', s.id, e.message); }
      continue;
    }
    const now = localNow(s.timezone || 'Europe/Zurich');
    if (now.hour !== s.send_hour) { skipped++; continue; }
    const day = dayNumber(s.started_on, now.date);
    if (day < 1 || day > TOTAL) { skipped++; continue; }
    let msgs = await rpc('ld_job_message', { p_lang: lang, p_day: day });
    if (!msgs.length && lang !== 'en') msgs = await rpc('ld_job_message', { p_lang: 'en', p_day: day });
    const m = msgs[0]; if (!m) { skipped++; continue; }
    if (await rpc('ld_job_already_sent', { p_subscriber: s.id, p_message: m.id })) { skipped++; continue; }
    try {
      const r = await send(s.email, `${L[lang].day} ${day}: ${m.title}`, messageHtml(m, day, lang, unsubUrl), textVersion(m, day, lang, unsubUrl));
      if (!DRY) await rpc('ld_job_record', { p_subscriber: s.id, p_message: m.id, p_status: 'sent', p_provider_id: r.id });
      sent++;
    } catch (e) {
      failed++; console.error('send failed', s.id, e.message);
      if (!DRY) await rpc('ld_job_record', { p_subscriber: s.id, p_message: m.id, p_status: 'failed:' + e.message.slice(0, 80), p_provider_id: null });
    }
  }
  console.log(`${new Date().toISOString()} subscribers ${subs.length} · sent ${sent} · confirmations ${confirms} · skipped ${skipped} · failed ${failed}${resend ? '' : ' · NO RESEND_API_KEY (nothing really sent)'}`);
}
main().catch(e => { console.error(e); process.exit(1); });
