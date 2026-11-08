#!/usr/bin/env node
// ============================================================
// Light for Every Day — daily e-mail sender
// Runs hourly from GitHub Actions. For every confirmed subscriber whose local
// send_hour is now, sends the message for their current day (once).
// Also sends confirmation e-mails to new, unconfirmed subscribers.
//
//   npm install @supabase/supabase-js resend
//   SUPABASE_URL, SUPABASE_KEY (service role), RESEND_API_KEY, FROM_EMAIL, SITE_URL
// ============================================================
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || 'Light for Every Day <hello@lightforevery.day>';
const SITE = (process.env.SITE_URL || 'https://lightforevery.day').replace(/\/$/, '');
const TOTAL = 84;
const DRY = process.argv.includes('--dry');

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const paras = s => String(s || '').split(/\n\s*\n|\n/).filter(p => p.trim()).map(p => `<p style="margin:0 0 14px;line-height:1.65">${esc(p.trim())}</p>`).join('');

function localNow(tz) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: 'numeric', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const g = k => parts.find(p => p.type === k).value;
  return { hour: parseInt(g('hour')) % 24, date: `${g('year')}-${g('month')}-${g('day')}` };
}
function dayNumber(startedOn, localDate) {
  const a = new Date(startedOn + 'T00:00:00Z'), b = new Date(localDate + 'T00:00:00Z');
  return Math.round((b - a) / 86400000) + 1; // day 1 is the day after sign-up when started_on = sign-up date... see below
}

function layout(inner, footer) {
  return `<!doctype html><html><body style="margin:0;background:#FAF7F2;font-family:Georgia,'Times New Roman',serif;color:#2B3440">
  <div style="max-width:600px;margin:0 auto;padding:28px 18px">
    <div style="text-align:center;margin-bottom:18px"><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#D98E3B;vertical-align:middle"></span>
      <span style="font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#8A9099;vertical-align:middle;margin-left:8px">Light for Every Day</span></div>
    ${inner}
    <div style="margin-top:28px;padding:14px 16px;border-radius:12px;background:#F8E7E7;font-size:14px;line-height:1.5;font-family:Arial,sans-serif">
      <strong style="color:#C96F6F">If you are in crisis or thinking about ending your life, please reach out now.</strong> Switzerland <b>143</b> · youth <b>147</b> · emergency <b>144</b>. <a href="${SITE}/help.html" style="color:#5E86B5">Other countries →</a>
    </div>
    <div style="margin-top:18px;font-size:12.5px;color:#8A9099;line-height:1.6;font-family:Arial,sans-serif">
      Light for Every Day offers daily encouragement grounded in research. It is not therapy and does not replace your doctor.<br>${footer}
    </div>
  </div></body></html>`;
}

function messageHtml(m, day, unsubUrl) {
  const qs = (m.reflection_questions || []).map(q => `<li style="margin-bottom:8px">${esc(q)}</li>`).join('');
  const sc = m.scripture && m.scripture.text ? `<div style="background:#FBEEDB;border-radius:14px;padding:18px 20px;margin-top:18px"><div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8A9099;font-family:Arial,sans-serif;margin-bottom:8px">A word of hope</div><div style="font-size:17px;line-height:1.5">${esc(m.scripture.text)}</div><div style="font-size:13px;color:#5A6472;margin-top:6px;font-family:Arial,sans-serif">${esc(m.scripture.reference)}</div></div>` : '';
  const inner = `
    <div style="font-size:13px;color:#8A9099;font-family:Arial,sans-serif;margin-bottom:6px">Day ${day} of ${TOTAL}</div>
    <h1 style="font-size:28px;font-weight:500;margin:0 0 20px;line-height:1.2">${esc(m.title)}</h1>
    <div style="background:#fff;border:1px solid #E6DFD3;border-radius:14px;padding:20px 22px;margin-bottom:14px">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8A9099;font-family:Arial,sans-serif;margin-bottom:10px">Quote</div>
      <div style="font-size:21px;line-height:1.4;font-style:italic">“${esc(m.quote)}”</div>
      <div style="font-size:14px;color:#5A6472;margin-top:10px;font-family:Arial,sans-serif">— ${esc(m.quote_source)}</div>
    </div>
    <div style="background:#fff;border:1px solid #E6DFD3;border-radius:14px;padding:20px 22px;margin-bottom:14px;font-size:17px">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8A9099;font-family:Arial,sans-serif;margin-bottom:10px">Explanation</div>${paras(m.explanation)}
    </div>
    <div style="background:#E6F1EB;border-radius:14px;padding:20px 22px;margin-bottom:14px;font-size:17px">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8A9099;font-family:Arial,sans-serif;margin-bottom:10px">Today's challenge</div>${paras(m.challenge)}
    </div>
    <div style="background:#fff;border:1px solid #E6DFD3;border-radius:14px;padding:20px 22px;font-size:17px">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8A9099;font-family:Arial,sans-serif;margin-bottom:10px">Questions for reflection</div><ol style="margin:0;padding-left:22px;line-height:1.5">${qs}</ol>
    </div>
    ${sc}
    <div style="text-align:center;margin-top:22px"><a href="${SITE}/today.html?day=${day}" style="display:inline-block;background:#D98E3B;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-family:Arial,sans-serif;font-weight:bold">Open in the app · journal &amp; sources</a></div>`;
  return layout(inner, `You receive one message a day because you signed up at ${SITE}. <a href="${unsubUrl}" style="color:#8A9099">Unsubscribe</a> · <a href="${SITE}/privacy.html" style="color:#8A9099">Privacy</a>`);
}
function confirmHtml(confirmUrl, unsubUrl) {
  return layout(`<h1 style="font-size:26px;font-weight:500;margin:0 0 16px">One tap to begin</h1><p style="font-size:17px;line-height:1.6">Thank you for signing up. Please confirm your address and your first message will arrive tomorrow morning.</p>
    <div style="text-align:center;margin:24px 0"><a href="${confirmUrl}" style="display:inline-block;background:#D98E3B;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-family:Arial,sans-serif;font-weight:bold">Yes, send me the daily message</a></div>
    <p style="font-size:14px;color:#5A6472;font-family:Arial,sans-serif">If you did not sign up, ignore this e-mail and nothing more will be sent.</p>`,
    `<a href="${unsubUrl}" style="color:#8A9099">Unsubscribe</a> · <a href="${SITE}/privacy.html" style="color:#8A9099">Privacy</a>`);
}
function textVersion(m, day, unsubUrl) {
  return `LIGHT FOR EVERY DAY · Day ${day} of ${TOTAL}\n\n${m.title}\n\n"${m.quote}"\n— ${m.quote_source}\n\n${m.explanation}\n\nTODAY'S CHALLENGE\n${m.challenge}\n\nQUESTIONS FOR REFLECTION\n${(m.reflection_questions || []).map((q, i) => `${i + 1}. ${q}`).join('\n')}\n${m.scripture?.text ? `\nA WORD OF HOPE\n${m.scripture.text} (${m.scripture.reference})\n` : ''}\nOpen: ${SITE}/today.html?day=${day}\n\nIf you are in crisis, please call a crisis line now. Switzerland 143 · youth 147 · emergency 144. Other countries: ${SITE}/help.html\n\nNot therapy; does not replace your doctor. Unsubscribe: ${unsubUrl}`;
}

async function send(to, subject, html, text) {
  if (DRY) { console.log('[dry] →', to, '|', subject); return { id: 'dry' }; }
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html, text });
  if (error) throw new Error(error.message || JSON.stringify(error));
  return data;
}

async function main() {
  const { data: subs, error } = await sb.from('ld_subscribers').select('*').is('unsubscribed_at', null).eq('channel', 'email');
  if (error) throw error;
  let sent = 0, confirms = 0, skipped = 0;
  for (const s of subs) {
    const unsubUrl = `${SITE}/unsubscribe.html?t=${s.token}`;
    if (!s.confirmed_at) {
      // one confirmation e-mail, recorded as a delivery with message_id null
      const { data: already } = await sb.from('ld_deliveries').select('id').eq('subscriber_id', s.id).is('message_id', null).limit(1);
      if (already && already.length) { skipped++; continue; }
      const r = await send(s.email, 'Please confirm: Light for Every Day', confirmHtml(`${SITE}/confirm.html?t=${s.token}`, unsubUrl), `Confirm your subscription: ${SITE}/confirm.html?t=${s.token}\nUnsubscribe: ${unsubUrl}`);
      await sb.from('ld_deliveries').insert({ subscriber_id: s.id, message_id: null, channel: 'email', status: 'confirm', provider_id: r.id });
      confirms++; continue;
    }
    const now = localNow(s.timezone || 'Europe/Zurich');
    if (now.hour !== s.send_hour) { skipped++; continue; }
    // day 1 = first morning after sign-up (started_on = sign-up date)
    const day = dayNumber(s.started_on, now.date);
    if (day < 1 || day > TOTAL) { skipped++; continue; }
    const { data: msgs } = await sb.from('ld_messages').select('*').eq('lang', s.lang || 'en').eq('day_number', day).eq('status', 'published').limit(1);
    const m = msgs && msgs[0];
    if (!m) { skipped++; continue; }
    const { data: dup } = await sb.from('ld_deliveries').select('id').eq('subscriber_id', s.id).eq('message_id', m.id).limit(1);
    if (dup && dup.length) { skipped++; continue; }
    try {
      const r = await send(s.email, `Day ${day}: ${m.title}`, messageHtml(m, day, unsubUrl), textVersion(m, day, unsubUrl));
      await sb.from('ld_deliveries').insert({ subscriber_id: s.id, message_id: m.id, channel: 'email', status: 'sent', provider_id: r.id });
      sent++;
    } catch (e) {
      console.error('send failed', s.id, e.message);
      await sb.from('ld_deliveries').insert({ subscriber_id: s.id, message_id: m.id, channel: 'email', status: 'failed:' + e.message.slice(0, 80) });
    }
  }
  console.log(`subscribers ${subs.length} · sent ${sent} · confirmations ${confirms} · skipped ${skipped}`);
}
main().catch(e => { console.error(e); process.exit(1); });
