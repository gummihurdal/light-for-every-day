/* Light for Every Day — shared client code (no framework, no build step) */
window.LD = (function () {
  const SB = 'https://mjphpctvuxmbjhmcscoj.supabase.co';
  const KEY = 'sb_publishable_MDPfXyMjG0eadmvp7uoqdg_EHwj4Alm';
  const TOTAL_DAYS = 84;
  const H = { apikey: KEY, Authorization: 'Bearer ' + KEY };

  /* ---------- storage (all personal data stays on the device) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('ld_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ld_' + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem('ld_' + k); } catch (e) {} }
  };

  /* ---------- settings ---------- */
  const settings = Object.assign({ scripture: true, size: 'normal', theme: 'auto', name: '' }, store.get('settings', {}));
  function saveSettings(patch) { Object.assign(settings, patch); store.set('settings', settings); applySettings(); }
  function applySettings() {
    document.documentElement.dataset.theme = settings.theme === 'auto' ? '' : settings.theme;
    document.body.dataset.size = settings.size;
  }

  /* ---------- journey ---------- */
  function todayISO() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function daysBetween(a, b) { const A = new Date(a + 'T00:00:00'), B = new Date(b + 'T00:00:00'); return Math.round((B - A) / 86400000); }
  function startedOn() { return store.get('started_on', null); }
  function start(dateISO) { store.set('started_on', dateISO || todayISO()); }
  function currentDay() {
    const s = startedOn(); if (!s) return null;
    const n = daysBetween(s, todayISO()) + 1;
    return Math.min(Math.max(n, 1), TOTAL_DAYS);
  }
  function unlockedDay() { return currentDay(); }
  const done = () => store.get('done', {});
  function markDone(day, v) { const d = done(); if (v) d[day] = todayISO(); else delete d[day]; store.set('done', d); }
  const journal = () => store.get('journal', {});
  function saveJournal(day, idx, text) { const j = journal(); j[day] = j[day] || {}; j[day][idx] = text; store.set('journal', j); }
  const moods = () => store.get('moods', {});
  function saveMood(v) { const m = moods(); m[todayISO()] = v; store.set('moods', m); }
  function eraseAll() { ['started_on', 'done', 'journal', 'moods', 'settings', 'phq9', 'gratitude'].forEach(store.del); }

  /* ---------- data ---------- */
  const cache = {};
  async function sb(path) {
    const r = await fetch(SB + '/rest/v1/' + path, { headers: H });
    if (!r.ok) throw new Error('db ' + r.status);
    return r.json();
  }
  async function getThemes() {
    if (cache.themes) return cache.themes;
    const t = await sb('ld_themes?select=*&order=week');
    cache.themes = t; return t;
  }
  async function getMessage(day, lang) {
    lang = lang || 'en';
    const k = 'msg_' + lang + '_' + day; if (cache[k]) return cache[k];
    const rows = await sb(`ld_messages?select=*&lang=eq.${lang}&day_number=eq.${day}&status=eq.published&limit=1`);
    cache[k] = rows[0] || null; return cache[k];
  }
  async function getMessagesIndex(lang) {
    lang = lang || 'en';
    if (cache.index) return cache.index;
    const rows = await sb(`ld_messages?select=day_number,theme,title&lang=eq.${lang}&status=eq.published&order=day_number`);
    cache.index = rows; return rows;
  }
  async function getSources(ids) {
    if (!ids || !ids.length) return [];
    return sb(`ld_sources?select=id,title,authors,year,journal,doi,citation,kind&id=in.(${ids.join(',')})`);
  }
  async function sendFeedback(message_id, helpful, note) {
    try {
      await fetch(SB + '/rest/v1/ld_feedback', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }, H),
        body: JSON.stringify({ message_id, helpful, note: note || null, lang: 'en' }) });
    } catch (e) {}
  }
  async function subscribe(email, send_hour, timezone) {
    const r = await fetch(SB + '/rest/v1/ld_subscribers', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }, H),
      body: JSON.stringify({ email, channel: 'email', lang: 'en', send_hour, timezone, started_on: startedOn() || todayISO() }) });
    if (r.status === 409) return 'exists';
    if (!r.ok) throw new Error('subscribe ' + r.status);
    return 'ok';
  }

  /* ---------- helpers ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const paras = s => String(s || '').split(/\n\s*\n|\n/).filter(p => p.trim()).map(p => `<p>${esc(p.trim())}</p>`).join('');
  function toast(msg) {
    let t = document.querySelector('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
  }
  function greeting() {
    const h = new Date().getHours(); const g = h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    return settings.name ? `${g}, ${settings.name}` : g;
  }
  function shareText(m) {
    return `${m.title}\n\n"${m.quote}"\n— ${m.quote_source}\n\n${m.explanation}\n\nToday's challenge: ${m.challenge}\n\nLight for Every Day · day ${m.day_number}\n${new URL('today.html?day=' + m.day_number, location.href).href}`;
  }

  /* ---------- chrome ---------- */
  const ICONS = {
    sun: '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="26" r="9" fill="#D98E3B"/><path d="M6 34h36" stroke="#6FA38A" stroke-width="3" stroke-linecap="round"/><path d="M24 8v5M36.7 13.3l-3.5 3.5M11.3 13.3l3.5 3.5M42 26h-5M11 26H6" stroke="#D98E3B" stroke-width="3" stroke-linecap="round"/></svg>',
    today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="4"/><path d="M3 19h18M12 5v2M5 8l1.5 1.5M19 8l-1.5 1.5"/></svg>',
    journey: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19c4-8 8 2 12-6s4-6 4-6"/><circle cx="4" cy="19" r="1.5"/><circle cx="20" cy="7" r="1.5"/></svg>',
    tools: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="5"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>'
  };
  function chrome(active) {
    const nav = [['today.html', 'Today', 'today'], ['journey.html', 'Journey', 'journey'], ['tools.html', 'Tools', 'tools'], ['help.html', 'Help', 'help'], ['settings.html', 'More', 'more']];
    const hdr = document.createElement('header'); hdr.className = 'hdr';
    hdr.innerHTML = `<div class="hdr-in"><a class="logo" href="index.html">${ICONS.sun}<span>Light for Every Day</span></a>
      <nav class="nav" aria-label="Main">${nav.map(([h, l, i]) => `<a href="${h}" class="${i === active ? 'on ' : ''}${i === 'help' ? 'help' : ''}">${ICONS[i]}<span>${l}</span></a>`).join('')}</nav></div>`;
    document.body.prepend(hdr);
    const f = document.createElement('footer');
    f.innerHTML = `<div class="foot-in">
      <div class="crisis"><span aria-hidden="true">☎</span><div><strong>If you are in crisis or thinking about ending your life, please reach out now.</strong>
        Switzerland <b>143</b> (Die Dargebotene Hand) · youth <b>147</b> · emergency <b>144</b>. <a href="help.html">Other countries and more help →</a></div></div>
      <div>Light for Every Day offers daily encouragement grounded in research. It is not therapy and does not replace your doctor.
      Everything you write here stays on your device.</div>
      <div class="foot-links"><a href="about.html">About &amp; sources</a><a href="subscribe.html">Daily e-mail</a><a href="privacy.html">Privacy</a><a href="https://graceforevery.day" rel="noopener">Grace for Every Day</a></div>
    </div>`;
    document.body.appendChild(f);
    applySettings();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  return { TOTAL_DAYS, store, settings, saveSettings, applySettings, todayISO, startedOn, start, currentDay, unlockedDay, done, markDone, journal, saveJournal, moods, saveMood, eraseAll,
    getThemes, getMessage, getMessagesIndex, getSources, sendFeedback, subscribe, esc, paras, toast, greeting, shareText, chrome, ICONS, SB, KEY };
})();
