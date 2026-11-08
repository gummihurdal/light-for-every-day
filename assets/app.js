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
  const LANGS = { en: 'English', de: 'Deutsch', fr: 'Français' };
  const settings = Object.assign({ scripture: true, size: 'normal', theme: 'auto', name: '', lang: '' }, store.get('settings', {}));
  (function () { const q = new URLSearchParams(location.search).get('lang'); if (q && LANGS[q] && q !== settings.lang) { settings.lang = q; store.set('settings', settings); } })();
  function lang() { if (settings.lang && LANGS[settings.lang]) return settings.lang; const b = (navigator.language || 'en').slice(0, 2); return LANGS[b] ? b : 'en'; }
  const UI = {
    en: { today: 'Today', journey: 'Journey', tools: 'Tools', help: 'Help', more: 'More', week: 'Week', day: 'Day', of: 'of', quote: 'Quote', expl: 'Explanation', chal: "Today's challenge", refl: 'Questions for reflection', hope: 'A word of hope', did: 'I did this (or my smaller version of it)', notes: 'Write as little or as much as you like. Your notes are saved only on this device.', mood: 'How are you right now?', helpful: 'Was this helpful?', yes: 'Yes', no: 'Not today', share: 'Share', copy: 'Copy text', sources: 'Where this comes from', hide: 'hide these', crisis: 'If you are in crisis or thinking about ending your life, please reach out now.', other: 'Other countries and more help →', disclaimer: 'Light for Every Day offers daily encouragement grounded in research. It is not therapy and does not replace your doctor. Everything you write here stays on your device.', moods: ['Very low', 'Low', 'Flat', 'Okay', 'Good'], notready: 'is not ready yet', notready2: 'This part of the journey is still being written and reviewed.', inEnglish: 'This day is not yet available in your language; shown in English.', moodNote: 'A one-tap check-in. Over the weeks you will see your pattern on the Journey page. Stored only on your device.', ahead: 'You are reading ahead. Your journey is on day', aheadEnd: 'this one comes later.', preview: 'You are previewing. Start your own journey and the app will bring you one message a day.', startBtn: 'Start day 1 today', finish: 'Finish' },
    de: { today: 'Heute', journey: 'Weg', tools: 'Werkzeuge', help: 'Hilfe', more: 'Mehr', week: 'Woche', day: 'Tag', of: 'von', quote: 'Zitat', expl: 'Erklärung', chal: 'Die Aufgabe für heute', refl: 'Fragen zum Nachdenken', hope: 'Ein Wort der Hoffnung', did: 'Das habe ich gemacht (oder meine kleinere Version)', notes: 'Schreiben Sie so wenig oder so viel Sie möchten. Ihre Notizen bleiben nur auf diesem Gerät.', mood: 'Wie geht es Ihnen gerade?', helpful: 'War das hilfreich?', yes: 'Ja', no: 'Heute nicht', share: 'Teilen', copy: 'Text kopieren', sources: 'Woher das kommt', hide: 'ausblenden', crisis: 'Wenn Sie in einer Krise sind oder daran denken, sich das Leben zu nehmen, holen Sie sich bitte jetzt Hilfe.', other: 'Andere Länder und weitere Hilfe →', disclaimer: 'Light for Every Day bietet tägliche Ermutigung auf Grundlage der Forschung. Es ist keine Therapie und ersetzt nicht Ihren Arzt oder Ihre Ärztin. Alles, was Sie hier schreiben, bleibt auf Ihrem Gerät.', moods: ['Sehr tief', 'Tief', 'Flach', 'Okay', 'Gut'], notready: 'ist noch nicht bereit', notready2: 'Dieser Teil des Weges wird noch geschrieben und geprüft.', inEnglish: 'Dieser Tag ist in Ihrer Sprache noch nicht verfügbar; er wird auf Englisch gezeigt.', moodNote: 'Ein Antippen genügt. Über die Wochen sehen Sie Ihr Muster auf der Seite «Weg». Bleibt nur auf Ihrem Gerät.', ahead: 'Sie lesen voraus. Ihr Weg ist bei Tag', aheadEnd: 'dieser Tag kommt später.', preview: 'Sie sehen eine Vorschau. Beginnen Sie Ihren eigenen Weg, und die App bringt Ihnen täglich eine Nachricht.', startBtn: 'Heute mit Tag 1 beginnen', finish: 'Abschliessen' },
    fr: { today: "Aujourd'hui", journey: 'Chemin', tools: 'Outils', help: 'Aide', more: 'Plus', week: 'Semaine', day: 'Jour', of: 'sur', quote: 'Citation', expl: 'Explication', chal: 'Le défi du jour', refl: 'Questions pour la réflexion', hope: "Une parole d'espérance", did: "Je l'ai fait (ou ma version plus petite)", notes: 'Écrivez aussi peu ou autant que vous voulez. Vos notes restent uniquement sur cet appareil.', mood: 'Comment allez-vous en ce moment ?', helpful: 'Cela vous a-t-il aidé ?', yes: 'Oui', no: "Pas aujourd'hui", share: 'Partager', copy: 'Copier le texte', sources: "D'où cela vient", hide: 'masquer', crisis: 'Si vous êtes en crise ou si vous pensez à mettre fin à vos jours, demandez de l’aide maintenant.', other: 'Autres pays et plus d’aide →', disclaimer: 'Light for Every Day propose un encouragement quotidien fondé sur la recherche. Ce n’est pas une thérapie et cela ne remplace pas votre médecin. Tout ce que vous écrivez ici reste sur votre appareil.', moods: ['Très bas', 'Bas', 'Neutre', 'Ça va', 'Bien'], notready: "n'est pas encore prêt", notready2: 'Cette partie du chemin est encore en cours d’écriture et de relecture.', inEnglish: "Ce jour n'est pas encore disponible dans votre langue ; il est affiché en anglais.", moodNote: 'Un seul geste. Au fil des semaines, vous verrez votre courbe sur la page Chemin. Reste uniquement sur votre appareil.', ahead: 'Vous lisez en avance. Votre chemin en est au jour', aheadEnd: 'celui-ci viendra plus tard.', preview: 'Vous êtes en aperçu. Commencez votre propre chemin et l’app vous apportera un message par jour.', startBtn: 'Commencer le jour 1 aujourd’hui', finish: 'Terminer' }
  };
  function t(k) { return (UI[lang()] || UI.en)[k] ?? UI.en[k]; }
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
    const L = lang(); const k = 'themes_' + L; if (cache[k]) return cache[k];
    const base = await sb('ld_themes?select=*&order=week');
    if (L !== 'en') {
      try { const tr = await sb(`ld_theme_i18n?select=*&lang=eq.${L}`); base.forEach(th => { const x = tr.find(y => y.slug === th.slug); if (x) { th.title = x.title; th.subtitle = x.subtitle || th.subtitle; th.description = x.intro || th.description; } }); } catch (e) {}
    }
    cache[k] = base; return base;
  }
  async function getMessage(day, L) {
    L = L || lang();
    const k = 'msg_' + L + '_' + day; if (cache[k]) return cache[k];
    let rows = await sb(`ld_messages?select=*&lang=eq.${L}&day_number=eq.${day}&status=eq.published&limit=1`);
    if (!rows.length && L !== 'en') { rows = await sb(`ld_messages?select=*&lang=eq.en&day_number=eq.${day}&status=eq.published&limit=1`); if (rows[0]) rows[0].fallback = true; }
    cache[k] = rows[0] || null; return cache[k];
  }
  async function getMessagesIndex(L) {
    L = L || lang();
    const k = 'index_' + L; if (cache[k]) return cache[k];
    let rows = await sb(`ld_messages?select=day_number,theme,title&lang=eq.${L}&status=eq.published&order=day_number`);
    if (L !== 'en') { const en = await sb(`ld_messages?select=day_number,theme,title&lang=eq.en&status=eq.published&order=day_number`); const have = new Set(rows.map(r => r.day_number)); rows = rows.concat(en.filter(r => !have.has(r.day_number))).sort((a, b) => a.day_number - b.day_number); }
    cache[k] = rows; return rows;
  }
  async function getSources(ids) {
    if (!ids || !ids.length) return [];
    return sb(`ld_sources?select=id,title,authors,year,journal,doi,citation,kind&id=in.(${ids.join(',')})`);
  }
  async function sendFeedback(message_id, helpful, note) {
    try {
      await fetch(SB + '/rest/v1/ld_feedback', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }, H),
        body: JSON.stringify({ message_id, helpful, note: note || null, lang: lang() }) });
    } catch (e) {}
  }
  async function subscribe(email, send_hour, timezone) {
    const r = await fetch(SB + '/rest/v1/ld_subscribers', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }, H),
      body: JSON.stringify({ email, channel: 'email', lang: lang(), send_hour, timezone, started_on: startedOn() || todayISO() }) });
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
    const nav = [['today.html', t('today'), 'today'], ['journey.html', t('journey'), 'journey'], ['tools.html', t('tools'), 'tools'], ['help.html', t('help'), 'help'], ['settings.html', t('more'), 'more']];
    document.documentElement.lang = lang();
    const hdr = document.createElement('header'); hdr.className = 'hdr';
    hdr.innerHTML = `<div class="hdr-in"><a class="logo" href="index.html">${ICONS.sun}<span>Light for Every Day</span></a>
      <nav class="nav" aria-label="Main">${nav.map(([h, l, i]) => `<a href="${h}" class="${i === active ? 'on ' : ''}${i === 'help' ? 'help' : ''}">${ICONS[i]}<span>${l}</span></a>`).join('')}</nav></div>`;
    document.body.prepend(hdr);
    if (active === 'today' || active === 'home' || active === 'journey') {
      const day = currentDay(); const frac = day ? (day - 1) / (TOTAL_DAYS - 1) : 0;
      const x = 20 + frac * 560, y = day ? 44 - 26 * Math.sin(Math.PI * frac) : 52;
      const hz = document.createElement('div'); hz.className = 'horizon'; hz.setAttribute('aria-hidden', 'true');
      hz.innerHTML = `<svg viewBox="0 0 600 64" preserveAspectRatio="none"><line class="ground" x1="0" y1="48" x2="600" y2="48"/>${[1,2,3,4,5,6,7,8,9,10,11].map(w => `<line class="tick" x1="${20 + (w * 7) / (TOTAL_DAYS - 1) * 560}" y1="46" x2="${20 + (w * 7) / (TOTAL_DAYS - 1) * 560}" y2="50"/>`).join('')}<circle class="glow" cx="${x}" cy="${y}" r="22"/><circle class="disc" cx="${x}" cy="${y}" r="10"/><rect x="0" y="48.5" width="600" height="20" fill="var(--sky)"/></svg>
        <div class="horizon-cap"><span>${day ? `${t('day')} ${day} ${t('of')} ${TOTAL_DAYS}` : ''}</span><span>${greeting()}</span></div>`;
      hdr.after(hz);
    }
    const f = document.createElement('footer');
    f.innerHTML = `<div class="foot-in">
      <div class="crisis"><span aria-hidden="true">☎</span><div><strong>${t('crisis')}</strong>
        Schweiz · Suisse · Switzerland <b>143</b> (Die Dargebotene Hand · La Main Tendue) · <b>147</b> (Pro Juventute) · <b>144</b>. <a href="help.html">${t('other').replace(' →','')}</a></div></div>
      <div>${t('disclaimer')}</div>
      <div class="foot-links"><a href="about.html">About &amp; sources</a><a href="subscribe.html">Daily e-mail</a><a href="privacy.html">Privacy</a><a href="https://graceforevery.day" rel="noopener">Grace for Every Day</a></div>
    </div>`;
    document.body.appendChild(f);
    applySettings();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  return { TOTAL_DAYS, LANGS, lang, t, store, settings, saveSettings, applySettings, todayISO, startedOn, start, currentDay, unlockedDay, done, markDone, journal, saveJournal, moods, saveMood, eraseAll,
    getThemes, getMessage, getMessagesIndex, getSources, sendFeedback, subscribe, esc, paras, toast, greeting, shareText, chrome, ICONS, SB, KEY };
})();
