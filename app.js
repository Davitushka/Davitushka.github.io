// Year
document.getElementById('year').textContent = new Date().getFullYear();

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
const phrases = [
  'Rust parsers & real-time pipelines',
  'React SOC portals',
  '.NET services @ Protonoro',
  'ClickHouse · Kafka · Grafana',
  'Docker & Kubernetes deployments'
];
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
