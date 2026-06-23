const PANEL_IDS = ['about', 'projects', 'playground', 'stack', 'contact'];

async function loadPartials() {
  const main = document.querySelector('.stage');
  if (!main) return;
  const panels = await Promise.all(
    PANEL_IDS.map(id => fetch(`partials/panel-${id}.html`).then(r => r.text()))
  );
  panels.forEach(html => main.insertAdjacentHTML('beforeend', html));
  const modal = await fetch('partials/modal.html').then(r => r.text());
  document.body.insertAdjacentHTML('beforeend', modal);
}

function initParticles() {
  if (!window.tsParticles) return;
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

function initBgVideo() {
  const v = document.getElementById('bg-video');
  if (!v) return;
  fetch('assets/bg.mp4', { method: 'HEAD' })
    .then(r => { if (r.ok) { v.src = 'assets/bg.mp4'; v.classList.add('on'); } })
    .catch(() => {});
}

function init() {
  bindRefs();
  document.getElementById('year').textContent = new Date().getFullYear();
  applyLang(currentLang);
  type();
  runCounters();
  initCodeTabs();
  initPipelineMap();

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

  initModal();
  initPlayground();

  const hash = location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) activate(hash);

  initBgVideo();
  initParticles();
}

async function boot() {
  await loadPartials();
  init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
