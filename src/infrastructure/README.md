# Infrastructure Module

Реализация контрактов из core с использованием внешних библиотек.

## Содержимое

### `filesystem/` — Файловые операции

| Класс                    | Описание                          |
| ------------------------ | --------------------------------- |
| `NodeFileSystem`         | Реализация IFileSystem (fs-extra) |
| `DirectoryService`       | Операции с директориями           |
| `StructuredReportWriter` | Запись структурированных отчётов  |
| `JsonWriter`             | Запись JSON-файлов                |
| `StreamWriter`           | Потоковая запись                  |
| `FileWriter`             | Базовая запись файлов             |

### `logging/` — Логирование

| Класс           | Описание                             |
| --------------- | ------------------------------------ |
| `PinoLogger`    | Структурированное логирование (Pino) |
| `ConsoleLogger` | Простой консольный логгер            |
| `VerboseLogger` | Расширенное логирование              |

### `formatting/` — Форматирование вывода

| Класс              | Описание                    |
| ------------------ | --------------------------- |
| `ConsoleFormatter` | CLI-вывод с цветами (chalk) |
| `JsonFormatter`    | JSON-форматирование         |
| `TableFormatter`   | ASCII-таблицы (cli-table3)  |

### `paths/` — Работа с путями

| Класс          | Описание                        |
| -------------- | ------------------------------- |
| `UpathService` | Кроссплатформенные пути (upath) |

### `security/` — Безопасность

| Класс             | Описание                             |
| ----------------- | ------------------------------------ |
| `RedactSanitizer` | Редактирование чувствительных данных |
| `PathValidator`   | Валидация безопасности путей         |

## Принципы

1. **Реализация контрактов** — имплементация интерфейсов из core
2. **Изоляция зависимостей** — внешние библиотеки обёрнуты
3. **Dependency Injection** — все сервисы инъектируются
4. **Single Responsibility** — один сервис на одну задачу

## Примеры

### Файловая система

```typescript
import { NodeFileSystem } from '@infrastructure/filesystem';

const fs = new NodeFileSystem();
const content = await fs.readFile('/path/to/file.ts');
await fs.writeFile('/path/to/new/file.json', JSON.stringify(data));
await fs.ensureDir('/path/to/create');
```

### Логирование

```typescript
import { PinoLogger } from '@infrastructure/logging';

const logger = new PinoLogger();
logger.info('Starting analysis', { patterns: ['src/**'] });
logger.warn('Missing config', { field: 'timeout' });
logger.error('Failed', { error: err.message });
```

### Форматирование

```typescript
import { JsonFormatter, ConsoleFormatter } from '@infrastructure/formatting';

const jsonFormatter = new JsonFormatter();
const json = jsonFormatter.format(diagnostics);

const consoleFormatter = new ConsoleFormatter();
const pretty = consoleFormatter.format(diagnostics);
```

### Пути

```typescript
import { UpathService } from '@infrastructure/paths';

const pathService = new UpathService();
const normalized = pathService.normalize('/path/to\\file.ts');
const relative = pathService.relative('/root', '/root/src/file.ts');
```

## Архитектура

```
┌──────────────────┐
│ APPLICATION      │
├──────────────────┤
│ DOMAIN           │
├──────────────────┤
│ INFRASTRUCTURE   │ ← Этот слой (реализация контрактов)
│ - filesystem/    │
│ - logging/       │
│ - formatting/    │
│ - paths/         │
│ - security/      │
├──────────────────┤
│ CORE (contracts) │
└──────────────────┘
       ↓
  [External Libraries]
  fs-extra, pino, chalk, cli-table3, upath
```

## Внешние зависимости

| Библиотека   | Назначение                    | Модуль     |
| ------------ | ----------------------------- | ---------- |
| `fs-extra`   | Файловая система              | filesystem |
| `pino`       | Структурированное логирование | logging    |
| `chalk`      | Цвета в терминале             | formatting |
| `cli-table3` | ASCII-таблицы                 | formatting |
| `upath`      | Кроссплатформенные пути       | paths      |

## Заменяемость реализаций

```typescript
// Production
const logger: ILogger = new PinoLogger();

// Testing
const logger: ILogger = new MockLogger();

// Оба реализуют один интерфейс
```

---

См. [specs/architecture.md](../../specs/architecture.md)
