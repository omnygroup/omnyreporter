# Application Module

Слой оркестрации: сервисы, координирующие domain и infrastructure.

## Содержимое

### `DiagnosticApplicationService`

Главный оркестратор диагностического workflow:

- Очистка предыдущих ошибок
- Сбор диагностик через ReportGenerator
- Построение файловых отчётов
- Запись структурированных отчётов

### `ReportGeneratorManager`

Управление генерацией отчётов:

- Координация интеграций (ESLint, TypeScript)
- Агрегация диагностик
- Расчёт статистики

## Принципы

- Оркестрация domain и infrastructure
- Бизнес-логика делегируется в domain
- Dependency Injection (Inversify)
- Result-типы для обработки ошибок (neverthrow)

## Архитектура

```
┌──────────────────┐
│ CLI / View       │
├──────────────────┤
│ APPLICATION      │ ← Этот слой
│ - Services       │
├──────────────────┤
│ REPORTERS        │
├──────────────────┤
│ DOMAIN           │
├──────────────────┤
│ INFRASTRUCTURE   │
├──────────────────┤
│ CORE             │
└──────────────────┘
```

## Workflow

```
DiagnosticApplicationService.run()
    ├─► Очистка предыдущих ошибок (DirectoryService)
    ├─► Сбор диагностик (ReportGenerator)
    │       ├─► ESLint интеграция
    │       ├─► TypeScript интеграция
    │       └─► Агрегация и статистика
    ├─► Группировка по интеграции и файлу (DiagnosticGrouper)
    ├─► Построение файловых отчётов (FileReportBuilder)
    └─► Запись отчётов (StructuredReportWriter)
```

## Зависимости

- `@core` — типы, контракты, ошибки
- `@domain` — DiagnosticGrouper, FileReportBuilder, ConfigValidator
- `@infrastructure` — DirectoryService, StructuredReportWriter

---

См. [docs/architecture.md](../../docs/architecture.md)
