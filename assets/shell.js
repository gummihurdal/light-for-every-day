/* Light for Every Day — sidebar shell replicated from graceforevery.day. Requires assets/app.js (LD). */
(function () {
  const THEMES = [
    ['understanding_depression', 'Understanding'], ['thinking_rumination_cbt', 'Thoughts'], ['exercise', 'Movement'], ['sleep_light_circadian', 'Sleep & Light'],
    ['nutrition', 'Food & Mood'], ['hydration', 'Water & Basics'], ['nature', 'Outdoors'], ['alcohol_smoking', 'What We Reach For'],
    ['gratitude_positive_psych', 'Gratitude'], ['social_connection', 'Connection'], ['faith_spirituality', 'Trust & Meaning'], ['medication_treatment', 'Getting Help']];
  const page = (location.pathname.split('/').pop() || 'index.html');
  const params = new URLSearchParams(location.search);
  const on = h => (h.split('?')[0] === page) ? ' on' : '';
  const topicOn = slug => (page === 'learn.html' && params.get('topic') === slug) ? ' on' : '';
  const html = `
<div class="mob-bar">
  <a class="mob-logo" href="index.html">Light for Every Day</a>
  <button class="mob-ham" onclick="sbOpen()" aria-label="Menu"><span></span><span></span><span></span></button>
</div>
<div class="mob-overlay" id="mob-overlay" onclick="sbClose()"></div>
<aside class="sb" id="sidebar">
  <div class="sb-logo">
    <a href="index.html">
      <div class="sb-logo-text">Light for Every Day</div>
      <div class="sb-logo-sub">Daily Hope &amp; Reflection</div>
    </a>
  </div>
  <nav class="sb-nav">
    <a class="sb-link${on('today.html')}" href="today.html">Today's Light</a>
    <button class="sb-btn" id="study-btn" onclick="sbStudy()">Twelve Weeks</button>
    <div class="sb-sub" id="study-sub">
      ${THEMES.map(([s, n]) => `<a class="sb-link${topicOn(s)}" href="learn.html?topic=${s}">${n}</a>`).join('')}
    </div>
    <div class="sb-divider"></div>
    <a class="sb-link${on('calendar.html')}" href="calendar.html">Calendar</a>
    <a class="sb-link${on('archive.html')}" href="archive.html">Archive</a>
    <a class="sb-link${on('tools.html')}" href="tools.html">The Well</a>
    <a class="sb-link${on('help.html')}" href="help.html">Help Now</a>
    <a class="sb-link${on('subscribe.html')}" href="subscribe.html">Daily E-mail</a>
    <a class="sb-link${on('contact.html')}" href="contact.html">Contact</a>
    <a class="sb-link${on('settings.html')}" href="settings.html">Settings</a>
  </nav>
  <div class="sb-crisis">In crisis? Switzerland <b>143</b> · youth <b>147</b> · emergency <b>144</b><br><a href="help.html">Other countries</a></div>
  <div class="sb-foot"><div class="sb-foot-date" id="sb-date"></div></div>
</aside>`;
  document.body.insertAdjacentHTML('afterbegin', html);
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var now = new Date();
  var el = document.getElementById('sb-date');
  if (el) el.innerHTML = DAYS[now.getDay()] + '<br>' + MON[now.getMonth()] + ' ' + now.getDate() + '<br>' + now.getFullYear();
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
    main.insertAdjacentHTML('beforeend', `<div class="crisis-bar"><span class="cb-lbl">If you need help now</span><div>If you are in crisis or thinking about ending your life, please reach out today. Switzerland <b>143</b> (Die Dargebotene Hand) · youth <b>147</b> · emergency <b>144</b> · <a href="help.html">other countries</a>. Light for Every Day is daily encouragement grounded in research; it is not therapy and does not replace your doctor. Everything you write here stays on your device.</div></div>`);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addCrisis); else addCrisis();
  window.LDshell = { THEMES, addCrisis };
  if (window.LD) { LD.applySettings(); if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {}); }
  window.greetingFor = function () { const h = now.getHours(); const G = ['Midnight', 'Early Morning', 'Early Morning', 'Dawn', 'Dawn', 'Morning', 'Morning', 'Morning', 'Morning', 'Morning', 'Morning', 'Morning', 'Midday', 'Afternoon', 'Afternoon', 'Afternoon', 'Afternoon', 'Afternoon', 'Evening', 'Evening', 'Evening', 'Evening', 'Night', 'Night']; const n = window.LD && LD.settings.name; return `Good ${G[h]}${n ? ', ' + n : ''}`; };
  window.topDate = function () { return `${DAYS[now.getDay()]} · ${MON[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`; };
})();
