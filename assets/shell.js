/* Light for Every Day — sidebar shell replicated from graceforevery.day. Requires assets/app.js (LD). */
(function () {
  const SHORT = {
    en: ['Understanding', 'Thoughts', 'Movement', 'Sleep & Light', 'Food & Mood', 'Water & Basics', 'Outdoors', 'What We Reach For', 'Gratitude', 'Connection', 'Trust & Meaning', 'Getting Help'],
    de: ['Verstehen', 'Gedanken', 'Bewegung', 'Schlaf & Licht', 'Essen & Stimmung', 'Wasser & Basis', 'Draussen', 'Wonach wir greifen', 'Dankbarkeit', 'Verbindung', 'Vertrauen & Sinn', 'Hilfe holen'],
    fr: ['Comprendre', 'Pensées', 'Bouger', 'Sommeil & lumière', 'Alimentation', 'Eau & bases', 'Dehors', 'Ce qu’on saisit', 'Gratitude', 'Liens', 'Confiance & sens', 'Demander de l’aide'] };
  const SLUGS = ['understanding_depression', 'thinking_rumination_cbt', 'exercise', 'sleep_light_circadian', 'nutrition', 'hydration', 'nature', 'alcohol_smoking', 'gratitude_positive_psych', 'social_connection', 'faith_spirituality', 'medication_treatment'];
  const L0 = (window.LD && LD.lang()) || 'en';
  const THEMES = SLUGS.map((s, i) => [s, (SHORT[L0] || SHORT.en)[i]]);
  const page = (location.pathname.split('/').pop() || 'index.html');
  const L = (window.LD && LD.lang()) || 'en';
  const DICT = {
    en: { sub: 'Small daily steps out of depression', today: "Today's Light", journey: 'The Journey', progress: 'My Progress', all: 'All Messages', toolbox: 'Toolbox', help: 'Help Now', email: 'Get It By E-mail', why: 'Why This Works', contact: 'Contact', settings: 'Settings',
      crisisShort: 'In crisis? Call', crisisLine: 'If you are thinking of ending your life, call now. Free, 24 hours, confidential.', lineName143: 'Die Dargebotene Hand', lineName147: 'Pro Juventute · under 25', lineName144: 'Emergency', helpNow: 'Help now', other: 'Other countries', crisisLong: 'If you are in crisis or thinking about ending your life, please reach out today.', youth: 'youth', emergency: 'emergency', disclaimer: 'Light for Every Day is daily encouragement grounded in research; it is not therapy and does not replace your doctor. Everything you write here stays on your device.', needHelp: 'If you need help now',
      greet: ['Good Night', 'Good Morning', 'Good Morning', 'Good Afternoon', 'Good Evening'], week: 'Week', day: 'Day', of: 'of', today_: 'Today', explanation: 'Explanation', challenge: "Today's Challenge", hope: 'A Word of Hope', thisWeek: 'This Week', evidence: 'Evidence', studies: 'studies behind today', evidenceNote: 'Every message draws on peer-reviewed research. The references are listed below.', beginReading: 'Begin Reading', beginDayOne: 'Begin Day One', carry: 'Carry This With You', reflection: 'Reflection', question: 'Question', notes: 'Your private notes…', notesNote: 'Your notes are saved only on this device.', mood: 'How Are You Right Now?', moods: ['Very low', 'Low', 'Flat', 'Okay', 'Good'], moodNote: 'One tap a day. Your pattern appears under My Progress.', helpful: 'Was This Helpful?', yes: 'Yes', notToday: 'Not Today', share: 'Share', copy: 'Copy', sources: 'Sources', deeper: 'Go Deeper', sevenDays: "This Week's Seven Days", toolboxLink: 'Toolbox: Self-Check & More', didIt: 'I did this, or my smaller version', ahead: 'You are reading ahead · your journey is on day', inEnglish: 'Shown in English · translation under review', finish: 'Finish', thanks: 'Thank you.', preparing: "Preparing today's light", days: 'Days', overview: 'Overview', allWeeks: '← The Journey', openToday: "Open as Today's Light", prev: '← Previous', next: 'Next →', quote: 'Quote' },
    de: { sub: 'Kleine tägliche Schritte aus der Depression', today: 'Licht für heute', journey: 'Der Weg', progress: 'Mein Fortschritt', all: 'Alle Nachrichten', toolbox: 'Werkzeugkasten', help: 'Hilfe jetzt', email: 'Per E-Mail erhalten', why: 'Warum das wirkt', contact: 'Kontakt', settings: 'Einstellungen',
      crisisShort: 'In einer Krise? Rufen Sie an:', crisisLine: 'Wenn Sie daran denken, sich das Leben zu nehmen, rufen Sie jetzt an. Kostenlos, rund um die Uhr, vertraulich.', lineName143: 'Die Dargebotene Hand', lineName147: 'Pro Juventute · unter 25', lineName144: 'Notruf', helpNow: 'Hilfe jetzt', other: 'Andere Länder', crisisLong: 'Wenn Sie in einer Krise sind oder daran denken, sich das Leben zu nehmen, holen Sie sich bitte heute Hilfe.', youth: 'Jugendliche', emergency: 'Notruf', disclaimer: 'Light for Every Day ist tägliche Ermutigung auf Grundlage der Forschung; es ist keine Therapie und ersetzt nicht Ihren Arzt oder Ihre Ärztin. Alles, was Sie hier schreiben, bleibt auf Ihrem Gerät.', needHelp: 'Wenn Sie jetzt Hilfe brauchen',
      greet: ['Gute Nacht', 'Guten Morgen', 'Guten Morgen', 'Guten Tag', 'Guten Abend'], week: 'Woche', day: 'Tag', of: 'von', today_: 'Heute', explanation: 'Erklärung', challenge: 'Die Aufgabe für heute', hope: 'Ein Wort der Hoffnung', thisWeek: 'Diese Woche', evidence: 'Belege', studies: 'Studien hinter dem heutigen Tag', evidenceNote: 'Jede Nachricht stützt sich auf begutachtete Forschung. Die Quellen stehen unten.', beginReading: 'Lesen beginnen', beginDayOne: 'Mit Tag eins beginnen', carry: 'Nehmen Sie das mit', reflection: 'Zum Nachdenken', question: 'Frage', notes: 'Ihre privaten Notizen…', notesNote: 'Ihre Notizen bleiben nur auf diesem Gerät.', mood: 'Wie geht es Ihnen gerade?', moods: ['Sehr tief', 'Tief', 'Flach', 'Okay', 'Gut'], moodNote: 'Ein Antippen pro Tag. Ihr Muster erscheint unter „Mein Fortschritt“.', helpful: 'War das hilfreich?', yes: 'Ja', notToday: 'Heute nicht', share: 'Teilen', copy: 'Kopieren', sources: 'Quellen', deeper: 'Weitergehen', sevenDays: 'Die sieben Tage dieser Woche', toolboxLink: 'Werkzeugkasten: Selbsttest & mehr', didIt: 'Das habe ich gemacht, oder meine kleinere Version', ahead: 'Sie lesen voraus · Ihr Weg ist bei Tag', inEnglish: 'Auf Englisch gezeigt · Übersetzung in Prüfung', finish: 'Abschluss', thanks: 'Danke.', preparing: 'Das Licht für heute wird vorbereitet', days: 'Tage', overview: 'Überblick', allWeeks: '← Der Weg', openToday: 'Als Licht für heute öffnen', prev: '← Zurück', next: 'Weiter →', quote: 'Zitat' },
    fr: { sub: 'Petits pas quotidiens pour sortir de la dépression', today: "La lumière du jour", journey: 'Le chemin', progress: 'Ma progression', all: 'Tous les messages', toolbox: 'Boîte à outils', help: 'Aide maintenant', email: 'Recevoir par e-mail', why: 'Pourquoi ça marche', contact: 'Contact', settings: 'Réglages',
      crisisShort: 'En crise ? Appelez', other: 'Autres pays', crisisLong: 'Si vous êtes en crise ou si vous pensez à mettre fin à vos jours, demandez de l’aide aujourd’hui.', youth: 'jeunes', emergency: 'urgences', disclaimer: 'Light for Every Day est un encouragement quotidien fondé sur la recherche ; ce n’est pas une thérapie et cela ne remplace pas votre médecin. Tout ce que vous écrivez ici reste sur votre appareil.', needHelp: 'Si vous avez besoin d’aide maintenant',
      greet: ['Bonne nuit', 'Bonjour', 'Bonjour', 'Bon après-midi', 'Bonsoir'], week: 'Semaine', day: 'Jour', of: 'sur', today_: "Aujourd'hui", explanation: 'Explication', challenge: 'Le défi du jour', hope: "Une parole d'espérance", thisWeek: 'Cette semaine', evidence: 'Preuves', studies: "études derrière ce jour", evidenceNote: 'Chaque message s’appuie sur des recherches évaluées par des pairs. Les références sont ci-dessous.', beginReading: 'Commencer la lecture', beginDayOne: 'Commencer le jour un', carry: 'Emportez ceci avec vous', reflection: 'Réflexion', question: 'Question', notes: 'Vos notes privées…', notesNote: 'Vos notes restent uniquement sur cet appareil.', mood: 'Comment allez-vous en ce moment ?', moods: ['Très bas', 'Bas', 'Neutre', 'Ça va', 'Bien'], moodNote: 'Un geste par jour. Votre courbe apparaît sous « Ma progression ».', helpful: 'Cela vous a-t-il aidé ?', yes: 'Oui', notToday: "Pas aujourd'hui", share: 'Partager', copy: 'Copier', sources: 'Sources', deeper: 'Aller plus loin', sevenDays: 'Les sept jours de cette semaine', toolboxLink: 'Boîte à outils : auto-évaluation et plus', didIt: "Je l'ai fait, ou ma version plus petite", ahead: 'Vous lisez en avance · votre chemin en est au jour', inEnglish: 'Affiché en anglais · traduction en cours de relecture', finish: 'Fin', thanks: 'Merci.', preparing: 'La lumière du jour se prépare', days: 'Jours', overview: 'Aperçu', allWeeks: '← Le chemin', openToday: 'Ouvrir comme lumière du jour', prev: '← Précédent', next: 'Suivant →', quote: 'Citation' }
  };
  const T = Object.assign({}, DICT.en, DICT[L] || {});
  window.T = T;
  document.documentElement.lang = L;
  const params = new URLSearchParams(location.search);
  const on = h => (h.split('?')[0] === page) ? ' on' : '';
  const topicOn = slug => (page === 'learn.html' && params.get('topic') === slug) ? ' on' : '';
  const html = `
<div class="mob-bar">
  <a class="mob-logo" href="index.html">Light for Every Day</a>
  <span style="display:flex;align-items:center;gap:10px"><a class="mob-sos" href="help.html">${T.helpNow}</a>
  <button class="mob-ham" onclick="sbOpen()" aria-label="Menu"><span></span><span></span><span></span></button></span>
</div>
<div class="mob-overlay" id="mob-overlay" onclick="sbClose()"></div>
<aside class="sb" id="sidebar">
  <div class="sb-logo">
    <a href="index.html">
      <div class="sb-logo-text">Light for Every Day</div>
      <div class="sb-logo-sub">${T.sub}</div>
    </a>
  </div>
  <nav class="sb-nav">
    <a class="sb-link${on('today.html')}" href="today.html">${T.today}</a>
    <button class="sb-btn" id="study-btn" onclick="sbStudy()">${T.journey}</button>
    <div class="sb-sub" id="study-sub">
      ${THEMES.map(([s, n]) => `<a class="sb-link${topicOn(s)}" href="learn.html?topic=${s}">${n}</a>`).join('')}
    </div>
    <div class="sb-divider"></div>
    <a class="sb-link${on('calendar.html')}" href="calendar.html">${T.progress}</a>
    <a class="sb-link${on('archive.html')}" href="archive.html">${T.all}</a>
    <a class="sb-link${on('tools.html')}" href="tools.html">${T.toolbox}</a>
    <a class="sb-link${on('help.html')}" href="help.html">${T.help}</a>
    <a class="sb-link${on('subscribe.html')}" href="subscribe.html">${T.email}</a>
    <a class="sb-link${on('about.html')}" href="about.html">${T.why}</a>
    <a class="sb-link${on('contact.html')}" href="contact.html">${T.contact}</a>
    <a class="sb-link${on('settings.html')}" href="settings.html">${T.settings}</a>
  </nav>
  <div class="sb-crisis"><span class="sbc-t">${T.crisisShort}</span> <a href="tel:143">143</a> · <a href="tel:147">147</a> · <a href="tel:144">144</a></div>
  <div class="sb-foot"><div class="sb-foot-date" id="sb-date"></div></div>
</aside>`;
  document.body.insertAdjacentHTML('afterbegin', html);
  var now = new Date();
  var LOC = { en: 'en-GB', de: 'de-CH', fr: 'fr-CH' }[L] || 'en-GB';
  var DAYNAME = now.toLocaleDateString(LOC, { weekday: 'long' }), MONNAME = now.toLocaleDateString(LOC, { month: 'long' });
  var cap = x => x.charAt(0).toUpperCase() + x.slice(1);
  var el = document.getElementById('sb-date');
  if (el) {
    const d = window.LD && LD.currentDay();
    const dayLine = d ? `<span class="sb-day">${T.day} ${d} ${T.of} ${LD.TOTAL_DAYS}</span>` : `<a class="sb-day" href="today.html?start=1">${T.beginDayOne}</a>`;
    el.innerHTML = dayLine;
  }
  var _so = false;
  window.sbStudy = function () {
    _so = !_so;
    var s = document.getElementById('study-sub'); var b = document.getElementById('study-btn');
    if (s) s.style.display = _so ? 'block' : 'none';
    if (b) { b.style.color = _so ? 'var(--gold)' : ''; b.style.borderLeftColor = _so ? 'var(--gold-d)' : ''; b.style.background = _so ? 'rgba(201,164,58,0.04)' : ''; }
  };
  window.sbStudyExpand = function () {
    _so = true;
    var s = document.getElementById('study-sub'); var b = document.getElementById('study-btn');
    if (s) s.style.display = 'block';
    if (b) { b.style.color = 'var(--gold)'; b.style.borderLeftColor = 'var(--gold-d)'; b.style.background = 'rgba(201,164,58,0.04)'; }
  };
  window.sbOpen = function () { document.getElementById('sidebar').classList.add('open'); document.getElementById('mob-overlay').classList.add('open'); };
  window.sbClose = function () { document.getElementById('sidebar').classList.remove('open'); document.getElementById('mob-overlay').classList.remove('open'); };
  if (page === 'learn.html' || page === 'topics.html') sbStudyExpand();
  if (params.get('study') === 'open') { sbOpen(); sbStudyExpand(); document.querySelectorAll('.sb-link.on').forEach(a => a.classList.remove('on')); document.getElementById('study-btn').classList.add('on'); }
  // crisis bar at the foot of the main column
  function addCrisis() {
    const main = document.querySelector('main.main, .content');
    if (!main || main.querySelector('.crisis-bar')) return;
    main.insertAdjacentHTML('beforeend', `<div class="crisis-bar"><span class="cb-lbl">${T.crisisShort}</span> <a href="tel:143">143</a> · <a href="tel:147">147</a> · <a href="tel:144">144</a> <span class="cb-note">· ${T.disclaimer}</span></div>`);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addCrisis); else addCrisis();
  window.LDshell = { THEMES, addCrisis };
  if (window.LD) { LD.applySettings(); if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {}); }
  window.greetingFor = function () { const h = now.getHours(); const g = T.greet[h < 5 ? 0 : h < 12 ? 1 : h < 13 ? 2 : h < 18 ? 3 : 4]; const n = window.LD && LD.settings.name; return `${g}${n ? ', ' + n : ''}`; };
  window.topDate = function () { return cap(now.toLocaleDateString(LOC, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })); };
})();
