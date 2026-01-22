# SPECS INDEX

## 📐 АРХИТЕКТУРА

**[architecture.md](./architecture.md)** - описание 7-слойной архитектуры

- Обзор слоёв
- Архитектурные паттерны
- Инверсия зависимостей
- Метрики качества
- Используемые библиотеки

## 📅 ПЛАН РАЗРАБОТКИ (PHASES)

**[plans/PHASE_1.md](./plans/PHASE_1.md)** ✅ COMPLETE

- 7-слойная архитектура (120+ файлов)
- 17 ключевых библиотек
- 80+ TypeScript ошибок исправлено → 0
- 90% дублирования консолидировано
- 100% type coverage

**[plans/PHASE_2.md](./plans/PHASE_2.md)** ⏳ NEXT (4-5 часов)

- DI контейнер (src/container.ts)
- CLI типизация (yargs)
- Интеграция CLI с use-cases

**[plans/PHASE_3.md](./plans/PHASE_3.md)** 📅 (5-6 часов)

- Vitest Reporter update
- Analytics завершение (TestAnalytics, LintAnalytics)
- ReportingFacade полная реализация

**[plans/PHASE_4.md](./plans/PHASE_4.md)** 📅 (5-7 часов)

- Интеграционные тесты
- API документация
- Migration guide

## 📋 LINT СПЕЦИФИКАЦИИ

**[lint/01-linting-rules.md](./lint/01-linting-rules.md)** - основные ESLint правила

**[lint/02-typescript-standards.md](./lint/02-typescript-standards.md)** - TypeScript стандарты

**[lint/03-code-style-guide.md](./lint/03-code-style-guide.md)** - стайл гайд

---

**Всё соответствует lint спецификациям:** ✅

- Zero-tolerance (--max-warnings 0)
- Strict TypeScript mode
- Code style compliance
