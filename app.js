const TS_SNIPPETS = {
  detect_format: {
    file: 'rust-parser/src/parser.rs',
    code: `/// Detect log format from first bytes (JSON, CEF, syslog, plaintext)
pub fn detect_format(raw: &[u8]) -> LogFormat {
    let trimmed = raw
        .iter()
        .position(|&b| !b.is_ascii_whitespace())
        .map(|i| &raw[i..])
        .unwrap_or(raw);

    if trimmed.first() == Some(&b'{') {
        return LogFormat::Json;
    }

    if trimmed.starts_with(b"CEF:") {
        return LogFormat::Cef;
    }

    if trimmed.first() == Some(&b'<') {
        if let Some(gt_pos) = trimmed.iter().position(|&b| b == b'>') {
            let after_prio = &trimmed[gt_pos + 1..];
            if after_prio.first().map(|b| b.is_ascii_digit()) == Some(true) {
                return LogFormat::Syslog5424;
            }
            return LogFormat::Syslog3164;
        }
    }

    LogFormat::PlainText
}`
  },
  parse: {
    file: 'rust-parser/src/parser.rs',
    code: `#[derive(Debug, Clone, PartialEq)]
pub enum LogFormat {
    Json, Cef, Syslog5424, Syslog3164, PlainText,
}

const MAX_EVENT_SIZE: usize = 1024 * 1024;

pub fn parse(raw: Bytes, source_type: &str, host: &str)
    -> Result<NormalizedEvent, ParserError>
{
    if raw.len() > MAX_EVENT_SIZE {
        return Err(ParserError::EventTooLarge {
            size: raw.len(), max: MAX_EVENT_SIZE,
        });
    }

    let format = detect_format(&raw);
    let mut event = NormalizedEvent::new(source_type);
    event.host = host.to_string();
    event.ingest_ts = Utc::now();

    match format {
        LogFormat::Json => parse_json(raw, &mut event)?,
        LogFormat::Cef => parse_cef(raw, &mut event)?,
        LogFormat::Syslog5424 => parse_syslog5424(raw, &mut event)?,
        LogFormat::Syslog3164 => parse_syslog3164(raw, &mut event)?,
        LogFormat::PlainText => parse_plaintext(raw, &mut event),
    }

    Ok(event)
}`
  },
  handle_parse: {
    file: 'rust-parser/src/main.rs',
    code: `async fn handle_parse(
    State(state): State<Arc<AppState>>,
    body: Bytes,
) -> impl IntoResponse {
    let request: ParseRequest = match serde_json::from_slice(&body) {
        Ok(r) => r,
        Err(e) => {
            return (StatusCode::BAD_REQUEST, Json(json!({
                "error": format!("Invalid JSON: {}", e)
            }))).into_response();
        }
    };

    let mut processed = 0usize;
    let mut errors = 0usize;

    for raw_event in request.events {
        let raw_bytes = Bytes::from(raw_event.raw.into_bytes());
        match state.pipeline
            .process(raw_bytes, &raw_event.source_type, &raw_event.host)
            .await
        {
            Ok(normalized) => {
                let payload = serde_json::to_vec(&normalized)?;
                state.producer.send(/* kafka topic */, &payload).await?;
                processed += 1;
            }
            Err(e) => { errors += 1; }
        }
    }

    Json(json!({ "processed": processed, "errors": errors }))
}`
  }
};

const PIPELINE_NODES = {
  apps: {
    title: { en: 'Apps & agents', ru: 'Приложения и агенты' },
    desc: {
      en: 'Microservices, VMs and containers ship logs via agents. This is the raw ingest layer before any parsing.',
      ru: 'Микросервисы, VM и контейнеры шлют логи через агенты. Сырой ingest-слой до парсинга.'
    }
  },
  vector: {
    title: { en: 'Vector', ru: 'Vector' },
    desc: {
      en: 'Collects, buffers and routes logs. Handles backpressure so bursts do not kill the pipeline.',
      ru: 'Собирает, буферизует и маршрутизирует логи. Держит backpressure, чтобы всплески не роняли пайплайн.'
    }
  },
  kafka: {
    title: { en: 'Kafka / Redpanda', ru: 'Kafka / Redpanda' },
    desc: {
      en: 'Durable event bus between ingest and parser. Decouples producers from consumers at 10k–50k EPS.',
      ru: 'Устойчивая шина между ingest и парсером. Развязывает продьюсеров и консьюмеров на 10k–50k EPS.'
    }
  },
  parser: {
    title: { en: 'Rust Parser', ru: 'Rust Parser' },
    desc: {
      en: 'My service: format detection, normalization, PII masking, GeoIP enrich. Target: parse <5ms p99.',
      ru: 'Мой сервис: детект формата, нормализация, PII-маскирование, GeoIP. Цель: parse <5ms p99.'
    }
  },
  clickhouse: {
    title: { en: 'ClickHouse', ru: 'ClickHouse' },
    desc: {
      en: 'Column store for analytics and SOC queries. Alerts land here within ≤30s of the event.',
      ru: 'Колоночное хранилище для аналитики и SOC-запросов. Алерты попадают сюда за ≤30с.'
    }
  },
  portal: {
    title: { en: 'SOC Portal & Grafana', ru: 'SOC Portal & Grafana' },
    desc: {
      en: 'React SOC portal I built + Grafana dashboards for ops. Where analysts actually work.',
      ru: 'React SOC-портал, который я написал, + дашборды Grafana. Тут аналитики реально работают.'
    }
  }
};

const I18N = {
  en: {
    tab_about: 'About', tab_projects: 'Projects', tab_playground: 'Playground',
    tab_stack: 'Stack', tab_contact: 'Contact',
    eyebrow: 'Full-stack developer @ <a href="https://protonoro.com/" target="_blank" rel="noopener">Protonoro</a>',
    hero: 'Hi, I\'m <span class="grad">Senri</span> <span class="wave">👋</span>',
    lead: 'I build production tooling end to end — Rust parsing pipelines and SIEM backends, React portals, and the Docker/Kubernetes setups that keep them running. Right now I\'m co-building products at <a href="https://protonoro.com/" target="_blank" rel="noopener">Protonoro</a>.',
    about_story: '3 years in development. I started on backends and data pipelines, now I\'m full-stack — I own the path from a raw log line to a dashboard an analyst can actually use.<br><br>I like code that survives load: parsers that hold p99, deploys that don\'t wake me at 3am, UIs that don\'t lag on real data.',
    about_focus: '<li><strong>Rust</strong> — parsers, ingest services, CLI tooling</li><li><strong>React</strong> — SOC portals, productivity apps</li><li><strong>.NET</strong> — backend services @ Protonoro</li><li><strong>ClickHouse / Kafka</strong> — real-time data planes</li><li><strong>Docker / K8s</strong> — how it all runs in prod</li>',
    about_now: 'Right now: maintaining <strong>thread-sync</strong> (open-source SIEM), building <strong>Protonoro Timer</strong>, and this portfolio with a live log parser demo.',
    stat_years: 'Years coding', stat_contrib: 'Contributions / yr', stat_repos: 'Repositories', stat_products: 'Live products',
    cta_projects: 'View projects', cta_playground: 'Try log parser',
    map_title: 'How thread-sync works', map_hint: 'Click a node to see what it does', map_cta: 'Try the parser ↗',
    projects_title: 'Projects',
    pill_oss: 'Open source', pill_product: 'Product',
    ts_desc: 'My production-grade SIEM for microservice environments — I wrote the Rust parser, the React SOC portal, and the ClickHouse / Kafka / Grafana pipeline behind it.',
    ts_link: 'Repository ↗',
    pt_desc: 'A full-stack productivity timer I\'m building at Protonoro — frontend and backend for daily focus workflows. It\'s a commercial product, so the source stays private.',
    pt_meta3: 'Team focus', pt_link: 'Open the app ↗',
    card_hint: 'Click card to preview code ↗',
    card_hint_app: 'Click card for details ↗',
    code_copy: 'Copy', code_copied: 'Copied!',
    stack_title: 'Technology stack', stack_lang: 'Languages', stack_front: 'Frontend',
    stack_data: 'Data &amp; messaging', stack_ops: 'Ops &amp; observability',
    contact_title: 'Get in touch',
    contact_lead: 'I\'m open to collaboration and interesting problems in real-time systems, security analytics and platform engineering. Drop me a line — I read everything.',
    c_website: 'Website', c_email: 'Email',
    footer: 'Built with care',
    modal_private: 'Source code is private — you can only try the live app.',
    modal_ts_title: 'thread-sync',
    modal_ts_desc: 'Production SIEM I built from scratch: ingest → parse → enrich → Kafka → ClickHouse → SOC portal & Grafana. Real code from the repo below.',
    modal_ts_meta: ['10k – 50k EPS', 'alerts ≤ 30s', 'parse <5ms p99'],
    modal_ts_btn: 'Full repository on GitHub',
    modal_pt_title: 'Protonoro Timer',
    modal_pt_desc: 'Productivity app with Pomodoro timer, tasks, categories and team features. I handle both frontend and backend. The repo is closed — here\'s what the product does.',
    modal_pt_meta: ['Pomodoro & focus modes', 'Tasks & categories', 'Real-time sync'],
    modal_pt_btn: 'Open protonoro.com',
    pg_title: 'Live log parser',
    pg_lead: 'Paste a log line — the same format detection logic from my thread-sync Rust parser, running in your browser.',
    pg_parse: 'Parse', pg_format: 'Detected format', pg_output: 'Normalized preview',
    pg_ex_json: 'JSON event', pg_ex_cef: 'CEF alert', pg_ex_syslog: 'Syslog line',
    pg_step_ingest: 'ingest', pg_step_detect: 'detect', pg_step_normalize: 'normalize',
    pg_step_kafka: 'Kafka', pg_step_ch: 'ClickHouse',
    _typed: ['Rust parsers & real-time pipelines', 'React SOC portals', '.NET services @ Protonoro', 'ClickHouse · Kafka · Grafana', 'Docker & Kubernetes deployments']
  },
  ru: {
    tab_about: 'Обо мне', tab_projects: 'Проекты', tab_playground: 'Демо',
    tab_stack: 'Стек', tab_contact: 'Контакты',
    eyebrow: 'Full-stack разработчик @ <a href="https://protonoro.com/" target="_blank" rel="noopener">Protonoro</a>',
    hero: 'Привет, я <span class="grad">Senri</span> <span class="wave">👋</span>',
    lead: 'Делаю продакшен-инструменты от и до — парсинг-пайплайны на Rust, бэкенды SIEM, порталы на React и связку Docker/Kubernetes. Сейчас строю продукты в <a href="https://protonoro.com/" target="_blank" rel="noopener">Protonoro</a>.',
    about_story: '3 года в разработке. Начинал с бэкенда и data-пайплайнов, сейчас full-stack — веду путь от сырой строки лога до дашборда, которым реально пользуется аналитик.<br><br>Люблю код, который выдерживает нагрузку: парсеры с нормальным p99, деплои без будильника в 3 ночи, UI без лагов на реальных данных.',
    about_focus: '<li><strong>Rust</strong> — парсеры, ingest-сервисы, CLI</li><li><strong>React</strong> — SOC-порталы, продуктивити-приложения</li><li><strong>.NET</strong> — бэкенд-сервисы в Protonoro</li><li><strong>ClickHouse / Kafka</strong> — data plane в реальном времени</li><li><strong>Docker / K8s</strong> — как всё крутится в проде</li>',
    about_now: 'Сейчас: веду <strong>thread-sync</strong> (open-source SIEM), делаю <strong>Protonoro Timer</strong> и это портфолио с live-демо парсера логов.',
    stat_years: 'Года в коде', stat_contrib: 'Коммитов / год', stat_repos: 'Репозиториев', stat_products: 'Живых продукта',
    cta_projects: 'Смотреть проекты', cta_playground: 'Попробовать парсер',
    map_title: 'Как устроен thread-sync', map_hint: 'Нажми на узел — расскажу что он делает', map_cta: 'Попробовать парсер ↗',
    projects_title: 'Проекты',
    pill_oss: 'Открытый код', pill_product: 'Продукт',
    ts_desc: 'Моя продакшен-SIEM — парсер на Rust, SOC-портал на React и пайплайн ClickHouse / Kafka / Grafana.',
    ts_link: 'Репозиторий ↗',
    pt_desc: 'Full-stack таймер продуктивности в Protonoro. Коммерческий продукт — исходники закрыты.',
    pt_meta3: 'Командный фокус', pt_link: 'Открыть приложение ↗',
    card_hint: 'Нажми на карточку — покажу код ↗',
    card_hint_app: 'Нажми на карточку — подробности ↗',
    code_copy: 'Копировать', code_copied: 'Скопировано!',
    stack_title: 'Технологии', stack_lang: 'Языки', stack_front: 'Фронтенд',
    stack_data: 'Данные и очереди', stack_ops: 'Ops и observability',
    contact_title: 'Связаться',
    contact_lead: 'Открыт к сотрудничеству в real-time системах, security-аналитике и платформенной инженерии. Напиши — читаю всё.',
    c_website: 'Сайт', c_email: 'Почта',
    footer: 'Сделано с душой',
    modal_private: 'Исходники закрыты — можно только открыть живое приложение.',
    modal_ts_title: 'thread-sync',
    modal_ts_desc: 'Продакшен-SIEM с нуля: ingest → parse → enrich → Kafka → ClickHouse → SOC и Grafana. Ниже — реальный код из репозитория.',
    modal_ts_meta: ['10k – 50k EPS', 'алерты ≤ 30с', 'parse <5ms p99'],
    modal_ts_btn: 'Весь репозиторий на GitHub',
    modal_pt_title: 'Protonoro Timer',
    modal_pt_desc: 'Помодоро, задачи, категории, командные фичи. Делаю фронт и бэк. Репозиторий закрыт.',
    modal_pt_meta: ['Помодоро и фокус', 'Задачи и категории', 'Синхронизация'],
    modal_pt_btn: 'Открыть protonoro.com',
    pg_title: 'Live log parser',
    pg_lead: 'Вставь строку лога — та же логика из моего Rust-парсера thread-sync, прямо в браузере.',
    pg_parse: 'Разобрать', pg_format: 'Определённый формат', pg_output: 'Нормализованный preview',
    pg_ex_json: 'JSON событие', pg_ex_cef: 'CEF алерт', pg_ex_syslog: 'Syslog строка',
    pg_step_ingest: 'ingest', pg_step_detect: 'detect', pg_step_normalize: 'normalize',
    pg_step_kafka: 'Kafka', pg_step_ch: 'ClickHouse',
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
let activeSnippet = 'detect_format';

const modalEl = document.getElementById('projectModal');
const typed = document.getElementById('typed');

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

function activate(name) {
  document.querySelectorAll('.panel').forEach(p =>
    p.classList.toggle('is-active', p.id === name));
  document.querySelectorAll('.tab').forEach(tab =>
    tab.classList.toggle('is-active', tab.dataset.tab === name));
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

function initPipelineMap() {
  document.querySelectorAll('.pipe-node').forEach(btn => {
    btn.addEventListener('click', () => showPipeDetail(btn.dataset.node));
  });
  showPipeDetail('parser');
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
