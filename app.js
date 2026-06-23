// Year
document.getElementById('year').textContent = new Date().getFullYear();

// ---- i18n (RU / EN) ----
const I18N = {
  en: {
    tab_about: 'About', tab_projects: 'Projects', tab_stack: 'Stack', tab_contact: 'Contact',
    eyebrow: 'Full-stack developer @ <a href="https://protonoro.com/" target="_blank" rel="noopener">Protonoro</a>',
    hero: 'Hi, I\'m <span class="grad">Senri</span> <span class="wave">👋</span>',
    lead: 'I build production tooling end to end — Rust parsing pipelines and SIEM backends, React portals, and the Docker/Kubernetes setups that keep them running. Right now I\'m co-building products at <a href="https://protonoro.com/" target="_blank" rel="noopener">Protonoro</a>. I care about clean architecture, real-time data, and shipping things people actually use.',
    stat_years: 'Years coding', stat_contrib: 'Contributions / yr', stat_repos: 'Repositories', stat_products: 'Live products',
    cta_projects: 'View projects',
    projects_title: 'Projects',
    pill_oss: 'Open source', pill_product: 'Product',
    ts_desc: 'My production-grade SIEM for microservice environments — I wrote the Rust parser, the React SOC portal, and the ClickHouse / Kafka / Grafana pipeline behind it.',
    ts_link: 'Repository ↗',
    pt_desc: 'A full-stack productivity timer I\'m building at Protonoro — frontend and backend for daily focus workflows. It\'s a commercial product, so the source stays private.',
    pt_meta3: 'Team focus', pt_link: 'Open the app ↗',
    stack_title: 'Technology stack', stack_lang: 'Languages', stack_front: 'Frontend', stack_data: 'Data &amp; messaging', stack_ops: 'Ops &amp; observability',
    contact_title: 'Get in touch',
    contact_lead: 'I\'m open to collaboration and interesting problems in real-time systems, security analytics and platform engineering. Drop me a line — I read everything.',
    c_website: 'Website', c_email: 'Email',
    footer: 'Built with care',
    _typed: ['Rust parsers & real-time pipelines', 'React SOC portals', '.NET services @ Protonoro', 'ClickHouse · Kafka · Grafana', 'Docker & Kubernetes deployments']
  },
  ru: {
    tab_about: 'Обо мне', tab_projects: 'Проекты', tab_stack: 'Стек', tab_contact: 'Контакты',
    eyebrow: 'Full-stack разработчик @ <a href="https://protonoro.com/" target="_blank" rel="noopener">Protonoro</a>',
    hero: 'Привет, я <span class="grad">Senri</span> <span class="wave">👋</span>',
    lead: 'Делаю продакшен-инструменты от и до — парсинг-пайплайны на Rust и бэкенды SIEM, порталы на React и связку Docker/Kubernetes, которая всё это держит. Сейчас вместе с командой строю продукты в <a href="https://protonoro.com/" target="_blank" rel="noopener">Protonoro</a>. Люблю чистую архитектуру, данные в реальном времени и вещи, которыми реально пользуются.',
    stat_years: 'Года в коде', stat_contrib: 'Коммитов / год', stat_repos: 'Репозиториев', stat_products: 'Живых продукта',
    cta_projects: 'Смотреть проекты',
    projects_title: 'Проекты',
    pill_oss: 'Открытый код', pill_product: 'Продукт',
    ts_desc: 'Моя продакшен-SIEM для микросервисных сред — я написал парсер на Rust, SOC-портал на React и весь пайплайн на ClickHouse / Kafka / Grafana.',
    ts_link: 'Репозиторий ↗',
    pt_desc: 'Full-stack таймер продуктивности, который я делаю в Protonoro — фронтенд и бэкенд для ежедневного фокуса. Это коммерческий продукт, поэтому исходники закрыты.',
    pt_meta3: 'Командный фокус', pt_link: 'Открыть приложение ↗',
    stack_title: 'Технологии', stack_lang: 'Языки', stack_front: 'Фронтенд', stack_data: 'Данные и очереди', stack_ops: 'Ops и observability',
    contact_title: 'Связаться',
    contact_lead: 'Открыт к сотрудничеству и интересным задачам в real-time системах, security-аналитике и платформенной инженерии. Напиши — я читаю всё.',
    c_website: 'Сайт', c_email: 'Почта',
    footer: 'Сделано с душой',
    _typed: ['Парсеры на Rust и real-time пайплайны', 'SOC-порталы на React', 'Сервисы .NET @ Protonoro', 'ClickHouse · Kafka · Grafana', 'Деплой в Docker и Kubernetes']
  }
};

let currentLang = localStorage.getItem('lang') || 'ru';
function applyLang(lang){
  currentLang = lang;
  document.documentElement.lang = lang;
  document.body.dataset.lang = lang;
  const dict = I18N[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = dict[el.getAttribute('data-i18n')];
    if (v != null) el.innerHTML = v;
  });
  const btn = document.getElementById('langSwitch');
  if (btn) btn.textContent = lang === 'ru' ? 'EN' : 'RU';
  phrases = dict._typed;
  pi = 0; ci = 0; deleting = false;
  localStorage.setItem('lang', lang);
}

// ---- Tabs ----
const tabs = document.querySelectorAll('[data-tab]');
const panels = document.querySelectorAll('.panel');
function activate(name){
  panels.forEach(p => p.classList.toggle('is-active', p.id === name));
  document.querySelectorAll('.tab').forEach(t =>
    t.classList.toggle('is-active', t.dataset.tab === name));
  if (name === 'about') runCounters();
}
tabs.forEach(el => el.addEventListener('click', e => {
  e.preventDefault();
  activate(el.dataset.tab);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}));

// ---- Typing effect ----
let phrases = I18N[currentLang]._typed;
const typed = document.getElementById('typed');
let pi = 0, ci = 0, deleting = false;
function type(){
  const word = phrases[pi];
  typed.textContent = word.slice(0, ci);
  if (!deleting && ci < word.length) { ci++; }
  else if (deleting && ci > 0) { ci--; }
  else if (!deleting && ci === word.length) { deleting = true; setTimeout(type, 1400); return; }
  else { deleting = false; pi = (pi + 1) % phrases.length; }
  setTimeout(type, deleting ? 40 : 80);
}
type();

// ---- Language toggle ----
applyLang(currentLang);
const langBtn = document.getElementById('langSwitch');
if (langBtn) langBtn.addEventListener('click', () => applyLang(currentLang === 'ru' ? 'en' : 'ru'));

// ---- Animated counters ----
let countersDone = false;
function runCounters(){
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
runCounters();

// ---- Optional custom background video ----
// Drop assets/bg.mp4 to use a video background; otherwise particles show.
(function(){
  const v = document.getElementById('bg-video');
  fetch('assets/bg.mp4', { method: 'HEAD' })
    .then(r => { if (r.ok) { v.src = 'assets/bg.mp4'; v.classList.add('on'); } })
    .catch(() => {});
})();

// ---- tsParticles background ----
if (window.tsParticles){
  tsParticles.load({
    id: 'tsparticles',
    options: {
      fpsLimit: 60,
      fullScreen: { enable: false },
      particles: {
        number: { value: 60, density: { enable: true, area: 900 } },
        color: { value: ['#7c3aed', '#a855f7', '#22d3ee'] },
        links: { enable: true, distance: 140, color: '#7c3aed', opacity: 0.25, width: 1 },
        move: { enable: true, speed: 0.8, outModes: { default: 'out' } },
        opacity: { value: 0.5 },
        size: { value: { min: 1, max: 3 } }
      },
      interactivity: {
        events: { onHover: { enable: true, mode: 'grab' } },
        modes: { grab: { distance: 160, links: { opacity: 0.5 } } }
      },
      detectRetina: true
    }
  });
}
