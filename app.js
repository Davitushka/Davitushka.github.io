const TS_CODE = `/// Detect log format from first bytes (JSON, CEF, syslog, plaintext)
pub fn detect_format(raw: &[u8]) -> LogFormat {
    let trimmed = raw.iter()
        .position(|&b| !b.is_ascii_whitespace())
        .map(|i| &raw[i..]).unwrap_or(raw);

    if trimmed.first() == Some(&b'{') { return LogFormat::Json; }
    if trimmed.starts_with(b"CEF:") { return LogFormat::Cef; }
    // ... syslog RFC5424 / RFC3164 / plaintext
    LogFormat::PlainText
}`;

const I18N = {
  en: {
    tab_about: 'About', tab_projects: 'Projects', tab_playground: 'Playground',
    tab_stack: 'Stack', tab_contact: 'Contact',
    eyebrow: 'Full-stack developer @ <a href="https://protonoro.com/" target="_blank" rel="noopener">Protonoro</a>',
    hero: 'Hi, I\'m <span class="grad">Senri</span> <span class="wave">👋</span>',
    lead: 'I build production tooling end to end — Rust parsing pipelines and SIEM backends, React portals, and the Docker/Kubernetes setups that keep them running. Right now I\'m co-building products at <a href="https://protonoro.com/" target="_blank" rel="noopener">Protonoro</a>. I care about clean architecture, real-time data, and shipping things people actually use.',
    stat_years: 'Years coding', stat_contrib: 'Contributions / yr', stat_repos: 'Repositories', stat_products: 'Live products',
    cta_projects: 'View projects', cta_playground: 'Try log parser',
    projects_title: 'Projects',
    pill_oss: 'Open source', pill_product: 'Product',
    ts_desc: 'My production-grade SIEM for microservice environments — I wrote the Rust parser, the React SOC portal, and the ClickHouse / Kafka / Grafana pipeline behind it.',
    ts_link: 'Repository ↗',
    pt_desc: 'A full-stack productivity timer I\'m building at Protonoro — frontend and backend for daily focus workflows. It\'s a commercial product, so the source stays private.',
    pt_meta3: 'Team focus', pt_link: 'Open the app ↗',
    card_hint: 'Click card to preview code ↗',
    card_hint_app: 'Click card for details ↗',
    stack_title: 'Technology stack', stack_lang: 'Languages', stack_front: 'Frontend',
    stack_data: 'Data &amp; messaging', stack_ops: 'Ops &amp; observability',
    contact_title: 'Get in touch',
    contact_lead: 'I\'m open to collaboration and interesting problems in real-time systems, security analytics and platform engineering. Drop me a line — I read everything.',
    c_website: 'Website', c_email: 'Email',
    footer: 'Built with care',
    modal_code_label: 'Code preview — rust-parser/src/parser.rs',
    modal_private: 'Source code is private — you can only try the live app.',
    modal_ts_title: 'thread-sync',
    modal_ts_desc: 'Production SIEM I built from scratch: ingest → parse → enrich → Kafka → ClickHouse → SOC portal & Grafana. Below is a real snippet from the Rust log parser.',
    modal_ts_meta: ['10k – 50k EPS', 'alerts ≤ 30s', 'parse <5ms p99'],
    modal_ts_btn: 'Full repository on GitHub',
    modal_pt_title: 'Protonoro Timer',
    modal_pt_desc: 'Productivity app with Pomodoro timer, tasks, categories and team features. I handle both frontend and backend. The repo is closed — here\'s what the product does.',
    modal_pt_meta: ['Pomodoro & focus modes', 'Tasks & categories', 'Real-time sync'],
    modal_pt_btn: 'Open protonoro.com',
    pg_title: 'Live log parser',
    pg_lead: 'Paste a log line — the same format detection logic from my thread-sync Rust parser, running in your browser.',
    pg_parse: 'Parse',
    pg_format: 'Detected format',
    pg_output: 'Normalized preview',
    pg_ex_json: 'JSON event',
    pg_ex_cef: 'CEF alert',
    pg_ex_syslog: 'Syslog line',
    pg_step_ingest: 'ingest',
    pg_step_detect: 'detect',
    pg_step_normalize: 'normalize',
    pg_step_kafka: 'Kafka',
    pg_step_ch: 'ClickHouse',
    _typed: ['Rust parsers & real-time pipelines', 'React SOC portals', '.NET services @ Protonoro', 'ClickHouse · Kafka · Grafana', 'Docker & Kubernetes deployments']
  },
  ru: {
    tab_about: 'Обо мне', tab_projects: 'Проекты', tab_playground: 'Демо',
    tab_stack: 'Стек', tab_contact: 'Контакты',
    eyebrow: 'Full-stack разработчик @ <a href="https://protonoro.com/" target="_blank" rel="noopener">Protonoro</a>',
    hero: 'Привет, я <span class="grad">Senri</span> <span class="wave">👋</span>',
    lead: 'Делаю продакшен-инструменты от и до — парсинг-пайплайны на Rust и бэкенды SIEM, порталы на React и связку Docker/Kubernetes, которая всё это держит. Сейчас вместе с командой строю продукты в <a href="https://protonoro.com/" target="_blank" rel="noopener">Protonoro</a>. Люблю чистую архитектуру, данные в реальном времени и вещи, которыми реально пользуются.',
    stat_years: 'Года в коде', stat_contrib: 'Коммитов / год', stat_repos: 'Репозиториев', stat_products: 'Живых продукта',
    cta_projects: 'Смотреть проекты', cta_playground: 'Попробовать парсер',
    projects_title: 'Проекты',
    pill_oss: 'Открытый код', pill_product: 'Продукт',
    ts_desc: 'Моя продакшен-SIEM для микросервисных сред — я написал парсер на Rust, SOC-портал на React и весь пайплайн на ClickHouse / Kafka / Grafana.',
    ts_link: 'Репозиторий ↗',
    pt_desc: 'Full-stack таймер продуктивности, который я делаю в Protonoro — фронтенд и бэкенд для ежедневного фокуса. Это коммерческий продукт, поэтому исходники закрыты.',
    pt_meta3: 'Командный фокус', pt_link: 'Открыть приложение ↗',
    card_hint: 'Нажми на карточку — покажу код ↗',
    card_hint_app: 'Нажми на карточку — подробности ↗',
    stack_title: 'Технологии', stack_lang: 'Языки', stack_front: 'Фронтенд',
    stack_data: 'Данные и очереди', stack_ops: 'Ops и observability',
    contact_title: 'Связаться',
    contact_lead: 'Открыт к сотрудничеству и интересным задачам в real-time системах, security-аналитике и платформенной инженерии. Напиши — я читаю всё.',
    c_website: 'Сайт', c_email: 'Почта',
    footer: 'Сделано с душой',
    modal_code_label: 'Фрагмент кода — rust-parser/src/parser.rs',
    modal_private: 'Исходники закрыты — можно только открыть живое приложение.',
    modal_ts_title: 'thread-sync',
    modal_ts_desc: 'Продакшен-SIEM, которую я собрал с нуля: ingest → parse → enrich → Kafka → ClickHouse → SOC-портал и Grafana. Ниже — реальный кусок из Rust-парсера логов.',
    modal_ts_meta: ['10k – 50k EPS', 'алерты ≤ 30с', 'parse <5ms p99'],
    modal_ts_btn: 'Весь репозиторий на GitHub',
    modal_pt_title: 'Protonoro Timer',
    modal_pt_desc: 'Приложение для продуктивности: помодоро-таймер, задачи, категории и командные фичи. Делаю и фронт, и бэк. Репозиторий закрыт — вот что умеет продукт.',
    modal_pt_meta: ['Помодоро и режимы фокуса', 'Задачи и категории', 'Синхронизация в реальном времени'],
    modal_pt_btn: 'Открыть protonoro.com',
    pg_title: 'Live log parser',
    pg_lead: 'Вставь строку лога — та же логика определения формата из моего Rust-парсера thread-sync, прямо в браузере.',
    pg_parse: 'Разобрать',
    pg_format: 'Определённый формат',
    pg_output: 'Нормализованный preview',
    pg_ex_json: 'JSON событие',
    pg_ex_cef: 'CEF алерт',
    pg_ex_syslog: 'Syslog строка',
    pg_step_ingest: 'ingest',
    pg_step_detect: 'detect',
    pg_step_normalize: 'normalize',
    pg_step_kafka: 'Kafka',
    pg_step_ch: 'ClickHouse',
    _typed: ['Парсеры на Rust и real-time пайплайны', 'SOC-порталы на React', 'Сервисы .NET @ Protonoro', 'ClickHouse · Kafka · Grafana', 'Деплой в Docker и Kubernetes']
  }
};

const PROJECTS = {
  'thread-sync': { repo: 'https://github.com/Davitushka/thread-sync' },
  'protonoro-timer': { url: 'https://protonoro.com/' }
};

let currentLang = localStorage.getItem('lang') || 'ru';
let phrases, pi = 0, ci = 0, deleting = false;
let countersDone = false;
let openProjectId = null;

const modalEl = document.getElementById('projectModal');
const typed = document.getElementById('typed');

function t(key) {
  return I18N[currentLang][key];
}

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
}

function activate(name) {
  document.querySelectorAll('.panel').forEach(p =>
    p.classList.toggle('is-active', p.id === name));
  document.querySelectorAll('.tab').forEach(t =>
    t.classList.toggle('is-active', t.dataset.tab === name));
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

function fillModal(id) {
  if (!modalEl || !id) return;
  const dict = I18N[currentLang];
  const cfg = PROJECTS[id];
  document.getElementById('modalTitle').textContent = id === 'thread-sync' ? dict.modal_ts_title : dict.modal_pt_title;
  const pill = document.getElementById('modalPill');
  pill.textContent = id === 'thread-sync' ? dict.pill_oss : dict.pill_product;
  pill.className = id === 'thread-sync' ? 'pill' : 'pill alt';
  document.getElementById('modalDesc').textContent = id === 'thread-sync' ? dict.modal_ts_desc : dict.modal_pt_desc;
  const meta = id === 'thread-sync' ? dict.modal_ts_meta : dict.modal_pt_meta;
  document.getElementById('modalMeta').innerHTML = meta.map(m => `<li>${m}</li>`).join('');
  const codeWrap = document.getElementById('modalCodeWrap');
  const priv = document.getElementById('modalPrivate');
  const actions = document.getElementById('modalActions');
  if (id === 'thread-sync') {
    codeWrap.hidden = false;
    document.getElementById('modalCode').textContent = TS_CODE;
    document.getElementById('modalCodeFile').textContent = 'rust-parser/src/parser.rs';
    priv.hidden = true;
    actions.innerHTML = `<a class="btn primary" href="${cfg.repo}" target="_blank" rel="noopener">${dict.modal_ts_btn} ↗</a>`;
  } else {
    codeWrap.hidden = true;
    priv.hidden = false;
    actions.innerHTML = `<a class="btn primary" href="${cfg.url}" target="_blank" rel="noopener">${dict.modal_pt_btn} ↗</a>`;
  }
}

function openModal(id) {
  if (!modalEl) return;
  openProjectId = id;
  fillModal(id);
  modalEl.removeAttribute('hidden');
  modalEl.classList.add('is-open');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal() {
  if (!modalEl) return;
  modalEl.setAttribute('hidden', '');
  modalEl.classList.remove('is-open');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  openProjectId = null;
}

const PIPELINE_STEPS = ['ingest', 'detect', 'normalize', 'kafka', 'clickhouse'];

function updatePipelineLabels() {
  const keys = ['pg_step_ingest', 'pg_step_detect', 'pg_step_normalize', 'pg_step_kafka', 'pg_step_ch'];
  document.querySelectorAll('.pipeline-step').forEach((el, i) => {
    if (keys[i]) el.textContent = t(keys[i]);
  });
}

function animatePipeline(onDone) {
  const steps = document.querySelectorAll('.pipeline-step');
  steps.forEach(s => s.classList.remove('is-active', 'is-done'));
  let i = 0;
  const next = () => {
    if (i > 0) steps[i - 1].classList.replace('is-active', 'is-done');
    if (i >= steps.length) { onDone?.(); return; }
    steps[i].classList.add('is-active');
    i++;
    setTimeout(next, 300);
  };
  next();
}

function runParser() {
  const input = document.getElementById('pgInput');
  const formatEl = document.getElementById('pgFormat');
  const outputEl = document.getElementById('pgOutput');
  if (!input || !window.ParserDemo) return;
  const raw = input.value.trim();
  if (!raw) return;

  formatEl.textContent = '…';
  outputEl.textContent = '';
  document.getElementById('pgResult').hidden = true;

  animatePipeline(() => {
    const format = ParserDemo.detectFormat(raw);
    const preview = ParserDemo.normalizePreview(raw, format);
    formatEl.innerHTML = `<span class="format-badge">${format}</span>`;
    outputEl.textContent = JSON.stringify(preview, null, 2);
    document.getElementById('pgResult').hidden = false;
  });
}

function initPlayground() {
  document.getElementById('pgParse')?.addEventListener('click', runParser);
  document.getElementById('pgInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runParser();
  });
  document.querySelectorAll('[data-example]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.example;
      const input = document.getElementById('pgInput');
      if (input && ParserDemo.EXAMPLES[key]) {
        input.value = ParserDemo.EXAMPLES[key];
        runParser();
      }
    });
  });
  updatePipelineLabels();
}

function init() {
  document.getElementById('year').textContent = new Date().getFullYear();

  applyLang(currentLang);
  type();
  runCounters();

  document.querySelectorAll('[data-tab]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      activate(el.dataset.tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  document.querySelectorAll('.lang-opt').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  document.querySelectorAll('.card-clickable').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('[data-stop-prop]')) return;
      openModal(card.dataset.project);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.project);
      }
    });
  });

  modalEl?.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalEl?.classList.contains('is-open')) closeModal();
  });

  initPlayground();

  const hash = location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) activate(hash);

  const v = document.getElementById('bg-video');
  if (v) {
    fetch('assets/bg.mp4', { method: 'HEAD' })
      .then(r => { if (r.ok) { v.src = 'assets/bg.mp4'; v.classList.add('on'); } })
      .catch(() => {});
  }

  if (window.tsParticles) {
    tsParticles.load({
      id: 'tsparticles',
      options: {
        fpsLimit: 60,
        fullScreen: { enable: false },
        particles: {
          number: { value: 35, density: { enable: true, area: 1200 } },
          color: { value: ['#7c3aed', '#a855f7'] },
          links: { enable: true, distance: 140, color: '#7c3aed', opacity: 0.12, width: 1 },
          move: { enable: true, speed: 0.5, outModes: { default: 'out' } },
          opacity: { value: 0.3 },
          size: { value: { min: 1, max: 2 } }
        },
        interactivity: {
          events: { onHover: { enable: true, mode: 'grab' } },
          modes: { grab: { distance: 140, links: { opacity: 0.25 } } }
        },
        detectRetina: true
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
