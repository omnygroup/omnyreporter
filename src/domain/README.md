# Domain Module

Бизнес-логика OmnyReporter, независимая от фреймворков и внешних инструментов.

## Содержимое

### `analytics/` — Статистика и аналитика

- `DiagnosticAnalytics` — расчёт статистики диагностик (errors, warnings, info, hints)

### `reporting/` — Построение отчётов

- `DiagnosticGrouper` — группировка диагностик по интеграции и файлу
- `FileReportBuilder` — создание DiagnosticFileReport с исходным кодом

### `validation/` — Валидация конфигурации

- `ConfigValidator` — валидация CollectionConfig через Zod
- `schemas/` — Zod-схемы валидации

## Принципы

1. **Чистая бизнес-логика** — без HTTP, UI, БД
2. **Независимость от фреймворков** — работает без Express, React и т.д.
3. **Тестируемость** — нет жёстких зависимостей от внешних сервисов
4. **Single Responsibility** — каждый класс имеет одну причину для изменения
5. **Immutability** — работа с readonly структурами

## Примеры

### Аналитика

```typescript
import { DiagnosticAnalytics } from '@domain';

const analytics = new DiagnosticAnalytics();
analytics.collectAll(diagnostics);
const stats = analytics.getSnapshot();

console.log(`Errors: ${stats.errorCount}`);
console.log(`Warnings: ${stats.warningCount}`);
```

### Группировка диагностик

```typescript
import { DiagnosticGrouper } from '@domain';

const grouper = new DiagnosticGrouper();
const grouped = grouper.group(diagnostics);
// Map<IntegrationName, Map<filePath, Diagnostic[]>>

for (const [integration, fileMap] of grouped) {
	console.log(`${integration}: ${fileMap.size} files`);
}
```

### Построение отчётов

```typescript
import { FileReportBuilder } from '@domain';

const builder = new FileReportBuilder(fileSystem, logger);
const report = await builder.buildReport(IntegrationName.ESLINT, 'src/index.ts', diagnostics, rootPath);
// DiagnosticFileReport с sourceCode, metadata
```

### Валидация

```typescript
import { ConfigValidator } from '@domain';

const validator = new ConfigValidator();
const result = validator.validate(config);

if (result.isOk()) {
	const validated = result.value;
}
```

## Архитектура

```
┌─────────────────┐
│ APPLICATION     │ Оркестрирует domain
├─────────────────┤
│ DOMAIN          │ ← Этот слой (бизнес-логика)
│ - analytics/    │
│ - reporting/    │
│ - validation/   │
├─────────────────┤
│ INFRASTRUCTURE  │ Внешние сервисы (инъекция)
├─────────────────┤
│ CORE            │ Контракты и типы
└─────────────────┘
```

## Зависимости

**Использует:**

- `@core` — контракты, типы
- `neverthrow` — Result type
- `zod` — валидация схем

**НЕ зависит от:**

- Infrastructure реализаций
- Внешних API
- Web-фреймворков
- Баз данных

## Тестирование

```bash
npm run test:unit -- tests/unit/domain
```

---

См. [specs/architecture.md](../../specs/architecture.md)
