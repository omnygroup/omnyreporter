# PHASE 2: DI CONTAINER & CLI INTEGRATION

**Статус:** PENDING  
**Оценка:** 4-5 часов  
**Цель:** Интегрировать DI контейнер и CLI с use-cases

## Задачи

### 1. Создать src/container.ts (1-2 часа)

```
- Импортировать все сервисы из infrastructure/
- Создать TOKENS объект со всеми ключами
- Регистрировать в inversify контейнере:
  * ILogger → PinoLogger (singleton)
  * IFileSystem → NodeFileSystem (singleton)
  * IPathService → UpathService (singleton)
  * ISanitizer → RedactSanitizer (singleton)
  * IFormatter → ConsoleFormatter (singleton)
  * IWriter → JsonWriter, StreamWriter
  * Все остальные infrastructure сервисы
  * Application use-cases
- Экспортировать setupContainer() функцию
```

### 2. Исправить View/CLI типизация (2-3 часа)

```
- Адаптировать yargs CommandBuilder для DiagnosticsOptions
- Использовать builder pattern без конфликтов типов
- Или использовать сырой yargs без типизации (pragmatic)
- Включить src/view/ обратно в tsconfig.json
```

### 3. Интегрировать CLI с use-cases (1 час)

```
- Получить container из App.ts
- В diagnostics команде:
  * Получить useCase из container
  * Передать config
  * Вывести результаты через formatter
  * Обработать ошибки (Result.isErr())
- Протестировать bin/omny.js
```

### 4. Создать интеграционные точки

```
- Обновить ReportingOrchestrator для работы с DI
- Обновить ReportingFacade для использования use-cases
- Убедиться что старый код совместим
```

## Результаты

✅ DI контейнер работает (все сервисы зарегистрированы)  
✅ CLI работает (bin/omny.js запускается без ошибок)  
✅ Use-cases вызываются из CLI  
✅ Результаты выводятся через форматтеры  
✅ 0 TypeScript ошибок (включая CLI)

## Следующее: PHASE 3
