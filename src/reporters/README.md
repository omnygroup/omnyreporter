# Reporters Module

Адаптеры для внешних диагностических инструментов (ESLint, TypeScript, Vitest).

## Содержимое

### `eslint/` — ESLint интеграция

| Файл               | Описание                         |
| ------------------ | -------------------------------- |
| `EslintReporter`   | Реализация DiagnosticIntegration |
| `EslintLintResult` | Типы результатов ESLint          |

### `typescript/` — TypeScript интеграция

| Файл                         | Описание                         |
| ---------------------------- | -------------------------------- |
| `TypeScriptReporter`         | Реализация DiagnosticIntegration |
| `TypeScriptDiagnosticResult` | Типы результатов TypeScript      |

### `vitest/` — Vitest интеграция

| Файл            | Описание                 |
| --------------- | ------------------------ |
| `VitestAdapter` | Адаптер Vitest API       |
| `TaskProcessor` | Обработка тестовых задач |
| `TestAnalytics` | Аналитика тестов         |

## Принципы

1. **Adapter Pattern** — изоляция внешних API
2. **Единый интерфейс** — все реализуют `DiagnosticIntegration`
3. **Независимость** — репортеры изолированы друг от друга
4. **Error Handling** — ошибки обёрнуты в Result types
5. **Нормализация** — преобразование в единый Diagnostic формат

## Примеры

### ESLint Reporter

```typescript
import { EslintReporter } from '@reporters/eslint';

const eslint = new EslintReporter(logger);
const result = await eslint.collect({
	patterns: ['src/**/*.ts'],
	ignorePatterns: ['dist/**'],
});

if (result.isOk()) {
	console.log(`Found ${result.value.length} ESLint issues`);
}
```

### TypeScript Reporter

```typescript
import { TypeScriptReporter } from '@reporters/typescript';

const typescript = new TypeScriptReporter(logger);
const result = await typescript.collect({
	patterns: ['src/**/*.ts'],
});

if (result.isOk()) {
	result.value.forEach((d) => {
		console.log(`${d.filePath}:${d.line} - ${d.message}`);
	});
}
```

## Архитектура

```
┌─────────────────────────────┐
│ DiagnosticIntegration       │
│ (интерфейс из @core)        │
├─────────────────────────────┤
│ collect(config)             │
│   → Result<Diagnostic[]>    │
└─────────────────────────────┘
         ↑
    ┌────┴────┬──────────┐
    │         │          │
┌───────┐ ┌──────────┐ ┌────────┐
│ESLint │ │TypeScript│ │ Vitest │
│Reporter│ │Reporter  │ │Adapter │
└───────┘ └──────────┘ └────────┘
    ↓         ↓          ↓
[ESLint]  [tsc API]  [Vitest API]
```

## Нормализация

Каждый инструмент имеет свой формат. Нормализация приводит к единому `Diagnostic`:

| Инструмент | Исходный тип    | Результат    |
| ---------- | --------------- | ------------ |
| ESLint     | `LintMessage`   | `Diagnostic` |
| TypeScript | `ts.Diagnostic` | `Diagnostic` |
| Vitest     | `TestError`     | `Diagnostic` |

## Обработка ошибок

Все репортеры возвращают `Result` тип:

```typescript
const result = await eslint.collect(config);
// Result<readonly Diagnostic[], Error>

// Успех
if (result.isOk()) {
	const diagnostics = result.value;
}

// Ошибка
if (result.isErr()) {
	console.error(result.error.message);
}
```

## Добавление нового репортера

1. Создать директорию `reporters/mytool/`
2. Реализовать `DiagnosticIntegration`:

```typescript
import { BaseReportGenerator } from '@core';

export class MyToolReporter extends BaseReportGenerator {
	readonly name = IntegrationName.MYTOOL;

	protected async execute(config): Promise<Result<Diagnostic[], Error>> {
		// Вызов API инструмента
		// Нормализация результатов
		return ok(diagnostics);
	}
}
```

3. Экспортировать из `reporters/mytool/index.ts`
4. Добавить тесты в `tests/integration/reporters/`

## Тестирование

```bash
# Все репортеры
npm run test:integration -- tests/integration/reporters

# Конкретный репортер
npm run test:integration -- tests/integration/reporters/EslintReporter
```

## Требования

- ESLint 8+ (flat config)
- TypeScript 4.5+
- Vitest 0.30+

---

См. [specs/architecture.md](../../specs/architecture.md)
