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
