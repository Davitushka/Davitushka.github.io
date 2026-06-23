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

const PROJECTS = {
  'thread-sync': { repo: 'https://github.com/Davitushka/thread-sync' },
  'protonoro-timer': { url: 'https://protonoro.com/' }
};
