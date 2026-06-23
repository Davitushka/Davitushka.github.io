function showPipeDetail(nodeId) {
  const node = PIPELINE_NODES[nodeId];
  const panel = document.getElementById('pipeDetail');
  if (!node || !panel) return;
  document.querySelectorAll('.pipe-node').forEach(el => {
    el.classList.toggle('is-active', el.dataset.node === nodeId);
  });
  document.getElementById('pipeDetailTitle').textContent = node.title[currentLang];
  document.getElementById('pipeDetailDesc').textContent = node.desc[currentLang];
  panel.hidden = false;
}

function updatePipelineLabels() {
  const keys = ['pg_step_ingest', 'pg_step_detect', 'pg_step_normalize', 'pg_step_kafka', 'pg_step_ch'];
  document.querySelectorAll('.pipeline-step').forEach((el, i) => {
    if (keys[i]) el.textContent = t(keys[i]);
  });
}

function initPipelineMap() {
  document.querySelectorAll('.pipe-node').forEach(btn => {
    btn.addEventListener('click', () => showPipeDetail(btn.dataset.node));
  });
  showPipeDetail('parser');
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
