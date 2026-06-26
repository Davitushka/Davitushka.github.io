const PANEL_IDS = ['about', 'projects', 'playground', 'stack', 'contact'];

async function loadPartials() {
  const main = document.querySelector('.stage');
  if (!main) return;
  const panels = await Promise.all(
    PANEL_IDS.map(async id => {
      const response = await fetch(`partials/panel-${id}.html`);
      if (!response.ok) throw new Error(`Failed to load panel: ${id}`);
      return response.text();
    })
  );
  panels.forEach(html => main.insertAdjacentHTML('beforeend', html));
  const modalResponse = await fetch('partials/modal.html');
  if (!modalResponse.ok) throw new Error('Failed to load modal');
  const modal = await modalResponse.text();
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
        number: { value: 110, density: { enable: true, area: 1200 } },
        color: { value: ['#ffffff', '#dbeafe', '#f5d0fe', '#bae6fd'] },
        links: { enable: false },
        move: { enable: true, speed: 0.14, outModes: { default: 'out' } },
        opacity: {
          value: { min: 0.12, max: 0.7 },
          animation: { enable: true, speed: 0.5, sync: false, startValue: 'random', mode: 'auto' }
        },
        size: {
          value: { min: 0.6, max: 2.2 },
          animation: { enable: true, speed: 1.1, sync: false, startValue: 'random', minimumValue: 0.4 }
        }
      },
      interactivity: {
        events: { onHover: { enable: false } }
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
  activate(hash && document.getElementById(hash) ? hash : 'about', Boolean(hash));

  initBgVideo();
  initParticles();
}

async function boot() {
  try {
    await loadPartials();
    init();
  } catch (error) {
    console.error(error);
    const main = document.querySelector('.stage');
    if (main) {
      main.innerHTML = '<section class="panel is-active"><h1 class="hero-title">Portfolio loading error</h1><p class="lead">Open this site through a local server or GitHub Pages so HTML partials can load.</p></section>';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
