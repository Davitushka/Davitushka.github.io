/** JS port of thread-sync rust-parser detect_format + preview normalizer */
const LogFormat = {
  Json: 'JSON',
  Cef: 'CEF',
  Syslog5424: 'Syslog RFC5424',
  Syslog3164: 'Syslog RFC3164',
  PlainText: 'Plaintext'
};

const EXAMPLES = {
  json: '{"event":"login_failed","user":"admin","src_ip":"10.0.0.5","severity":"high"}',
  cef: 'CEF:0|Protonoro|AuthGateway|2.1|1003|Failed login|7|src=10.0.0.5 dst=192.168.1.10 suser=admin',
  syslog: '<134>1 2026-06-23T12:00:00.000Z api-gateway auth - - - User login successful uid=42'
};

function trimStartBytes(str) {
  return str.replace(/^\s+/, '');
}

function detectFormat(raw) {
  const trimmed = trimStartBytes(raw);
  if (!trimmed.length) return LogFormat.PlainText;
  if (trimmed[0] === '{') return LogFormat.Json;
  if (trimmed.startsWith('CEF:')) return LogFormat.Cef;
  if (trimmed[0] === '<') {
    const gt = trimmed.indexOf('>');
    if (gt !== -1) {
      const after = trimmed.slice(gt + 1);
      if (after.length && /\d/.test(after[0])) return LogFormat.Syslog5424;
      return LogFormat.Syslog3164;
    }
  }
  return LogFormat.PlainText;
}

function normalizePreview(raw, format) {
  const base = {
    source_type: 'playground',
    host: 'demo-host',
    ingest_ts: new Date().toISOString(),
    format_detected: format,
    raw_preview: raw.slice(0, 200) + (raw.length > 200 ? '…' : '')
  };

  if (format === LogFormat.Json) {
    try {
      const parsed = JSON.parse(raw);
      return { ...base, normalized: { ...parsed, _pipeline: 'kafka → clickhouse' } };
    } catch {
      return { ...base, error: 'Invalid JSON', normalized: null };
    }
  }

  if (format === LogFormat.Cef) {
    const parts = raw.split('|');
    return {
      ...base,
      normalized: {
        cef_version: parts[0]?.replace('CEF:', ''),
        vendor: parts[1],
        product: parts[2],
        severity: parts[6],
        extensions: parts[7],
        _pipeline: 'kafka → clickhouse'
      }
    };
  }

  if (format === LogFormat.Syslog5424 || format === LogFormat.Syslog3164) {
    return {
      ...base,
      normalized: {
        message: raw,
        syslog_variant: format,
        _pipeline: 'kafka → clickhouse'
      }
    };
  }

  return {
    ...base,
    normalized: {
      message: raw.trim(),
      _pipeline: 'kafka → clickhouse'
    }
  };
}

window.ParserDemo = { LogFormat, EXAMPLES, detectFormat, normalizePreview };
