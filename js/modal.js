function showCodeSnippet(id) {
  activeSnippet = id;
  const snip = TS_SNIPPETS[id];
  if (!snip) return;
  document.getElementById('modalCode').textContent = snip.code;
  document.getElementById('modalCodeFile').textContent = snip.file;
  document.querySelectorAll('.code-tab').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.snippet === id);
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
    showCodeSnippet(activeSnippet);
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
  if (id === 'thread-sync') activeSnippet = 'detect_format';
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

function initCodeTabs() {
  document.querySelectorAll('.code-tab').forEach(btn => {
    btn.addEventListener('click', () => showCodeSnippet(btn.dataset.snippet));
  });
  document.getElementById('codeCopyBtn')?.addEventListener('click', async () => {
    const code = document.getElementById('modalCode')?.textContent;
    const btn = document.getElementById('codeCopyBtn');
    if (!code || !btn) return;
    try {
      await navigator.clipboard.writeText(code);
      const orig = btn.textContent;
      btn.textContent = t('code_copied');
      setTimeout(() => { btn.textContent = orig; }, 1500);
    } catch { /* ignore */ }
  });
}

function initModal() {
  modalEl?.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalEl?.classList.contains('is-open')) closeModal();
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
}
