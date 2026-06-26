let currentLang = localStorage.getItem('lang') || 'ru';
let phrases, pi = 0, ci = 0, deleting = false;
let countersDone = false;
let openProjectId = null;
let activeSnippet = 'detect_format';

let modalEl, typed;

function t(key) { return I18N[currentLang][key]; }

function applyLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.body.dataset.lang = lang;
  const dict = I18N[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = dict[el.getAttribute('data-i18n')];
    if (v != null) el.innerHTML = v;
  });
  document.querySelectorAll('.lang-opt').forEach(btn => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  phrases = dict._typed;
  pi = 0; ci = 0; deleting = false;
  localStorage.setItem('lang', lang);
  if (modalEl?.classList.contains('is-open') && openProjectId) fillModal(openProjectId);
  updatePipelineLabels();
  const activeNode = document.querySelector('.pipe-node.is-active');
  if (activeNode) showPipeDetail(activeNode.dataset.node);
}

function activate(name, updateHash = true) {
  if (!PANEL_IDS.includes(name)) return;
  document.querySelectorAll('.panel').forEach(p => {
    const active = p.id === name;
    p.classList.toggle('is-active', active);
    p.hidden = !active;
  });
  document.querySelectorAll('.tab').forEach(tab => {
    const active = tab.dataset.tab === name;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  if (updateHash && location.hash.replace('#', '') !== name) {
    history.replaceState(null, '', `#${name}`);
  }
  if (name === 'about') runCounters();
}

function type() {
  if (!typed) return;
  const word = phrases[pi];
  typed.textContent = word.slice(0, ci);
  if (!deleting && ci < word.length) ci++;
  else if (deleting && ci > 0) ci--;
  else if (!deleting && ci === word.length) { deleting = true; setTimeout(type, 1400); return; }
  else { deleting = false; pi = (pi + 1) % phrases.length; }
  setTimeout(type, deleting ? 40 : 80);
}

function runCounters() {
  if (countersDone) return;
  countersDone = true;
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = +el.dataset.count;
    let cur = 0;
    const step = Math.max(1, Math.round(target / 40));
    const tick = () => {
      cur = Math.min(target, cur + step);
      el.textContent = cur;
      if (cur < target) requestAnimationFrame(tick);
    };
    tick();
  });
}

function bindRefs() {
  modalEl = document.getElementById('projectModal');
  typed = document.getElementById('typed');
}
