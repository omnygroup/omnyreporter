# Application Module

Слой оркестрации: use-cases и сервисы, координирующие domain и infrastructure.

## Содержимое

### `services/`
- `DiagnosticApplicationService` — главный оркестратор диагностического workflow

### `usecases/`
- `GenerateReportUseCase` — сбор диагностик, агрегация, расчёт статистики

## Принципы

- Оркестрация domain и infrastructure
- Бизнес-логика делегируется в domain
- Dependency Injection
- Result-типы для обработки ошибок

## Архитектура

```
┌──────────────────┐
│ CLI              │
├──────────────────┤
│ APPLICATION      │ ← Этот слой
│ - Services       │
│ - Use Cases      │
├──────────────────┤
│ REPORTERS        │
├──────────────────┤
│ DOMAIN           │
├──────────────────┤
│ INFRASTRUCTURE   │
└──────────────────┘
```

## Workflow

```
DiagnosticApplicationService.generateAndWriteReport()
    ├─► Очистка предыдущих ошибок
    ├─► Генерация отчёта (GenerateReportUseCase)
    │       ├─► Сбор из ESLint/TypeScript
    │       ├─► Агрегация результатов
    │       └─► Расчёт статистики
    └─► Запись структурированных отчётов
```

---

См. [docs/architecture.md](../../docs/architecture.md)
