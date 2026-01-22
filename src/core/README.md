# Core Module

Фундамент OmnyReporter: интерфейсы (контракты), типы, абстракции и ошибки.

## Содержимое

### `types/` — Определения типов

| Файл                                  | Описание                                       |
| ------------------------------------- | ---------------------------------------------- |
| `diagnostic/Diagnostic.ts`            | Класс Diagnostic и его props                   |
| `diagnostic/DiagnosticFileReport.ts`  | Отчёт по файлу с диагностиками                 |
| `diagnostic/DiagnosticIntegration.ts` | Enum IntegrationName                           |
| `diagnostic/DiagnosticSeverity.ts`    | Уровни severity                                |
| `statistics.ts`                       | Типы статистики                                |
| `result.ts`                           | Result<T, E> (neverthrow)                      |
| `config.ts`                           | FileOperationOptions, WriteOptions, WriteStats |

### `contracts/` — Интерфейсы

| Интерфейс               | Назначение            | Реализация                         |
| ----------------------- | --------------------- | ---------------------------------- |
| `ILogger`               | Логирование           | PinoLogger, ConsoleLogger          |
| `IFileSystem`           | Файловые операции     | NodeFileSystem                     |
| `IFormatter<T>`         | Форматирование вывода | JsonFormatter, TableFormatter      |
| `IWriter<T>`            | Запись результатов    | JsonWriter, StreamWriter           |
| `IPathService`          | Нормализация путей    | UpathService                       |
| `ISanitizer`            | Редактирование данных | RedactSanitizer                    |
| `DiagnosticIntegration` | Интерфейс интеграции  | EslintReporter, TypeScriptReporter |

### `abstractions/` — Базовые классы

- `BaseReportGenerator` — Template Method для репортеров
- `BaseError` — Базовый класс ошибок

### `errors/` — Типизированные ошибки

| Класс                | Использование           |
| -------------------- | ----------------------- |
| `ValidationError`    | Невалидная конфигурация |
| `ConfigurationError` | Ошибки конфигурации     |
| `FileSystemError`    | Ошибки файловой системы |
| `DiagnosticError`    | Ошибки сбора диагностик |

## Принципы

1. **Минимум зависимостей** — только TypeScript и neverthrow
2. **Interface Segregation** — маленькие, фокусированные интерфейсы
3. **Immutability** — `readonly` поля
4. **Type Safety** — strict TypeScript

## Примеры

### Использование контрактов

```typescript
import type { ILogger, DiagnosticIntegration } from '@core';
import type { Diagnostic } from '@core';

class MyReporter implements DiagnosticIntegration {
	constructor(private readonly logger: ILogger) {}

	async collect(config): Promise<Result<Diagnostic[], Error>> {
		this.logger.info('Collecting...');
		// ...
	}
}
```

### Типизированные ошибки

```typescript
import { ValidationError } from '@core';

if (!isValid(config)) {
	throw new ValidationError('Invalid config', { config });
}
```

## Зависимости

- `neverthrow` — Result type
- Все остальные модули зависят от core

---

См. [specs/architecture.md](../../specs/architecture.md)
