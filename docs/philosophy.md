# Философия проекта OmnyReporter

## Миссия

Стать единой платформой качества кода и тестирования, объединяющей возможности SonarQube (статический анализ, SAST, метрики кода), Allure (визуализация и аналитика тестов) и Zebrunner (real‑time triage, flakiness detection) — и расширяющей их за счёт AI/ML.

## Видение

OmnyReporter — не просто репортер, а интеллектуальная Code & Test Intelligence платформа:

- Единое окно: код‑качество + тест‑результаты + безопасность в одном месте.
- Корреляция: связь между дефектами кода и падениями тестов; root‑cause analysis.
- Автоматизация: AI‑приоритизация, auto‑triage, предсказание flaky‑тестов, рекомендации по исправлениям.
- Открытость: open‑source ядро, plugin‑архитектура, интеграции с любыми CI/VCS/TMS.

## Ключевые принципы

- **Unified Quality** — Статический анализ + тестовая аналитика + security в единой модели данных.
- **Real‑time & Historical** — Мгновенная обратная связь в CI/PR + тренды и ретроспектива.
- **AI‑first** — ML‑модели для детекции flaky, кластеризации ошибок, auto‑triage, предсказания рисков.
- **Developer Experience** — Минимум конфигурации, быстрая интеграция, понятный UI и CLI.
- **Extensibility** — Плагины для языков, фреймворков, внешних систем (Jira, Slack и т.д.).
- **Privacy & Security** — Self‑hosted и SaaS; контроль над данными; SAST/DAST без утечек.

## Функциональные столпы

1. **Code Quality Engine (аналог SonarQube)**
    - Статический анализ (ESLint, TSC, Semgrep, custom rules).
    - Метрики: coverage, duplication, complexity, maintainability.
    - Security: SAST, secrets detection, dependency audit.
    - Quality Gates для CI/CD.

2. **Test Intelligence Engine (аналог Allure + Zebrunner)**
    - Сбор результатов любых test runners (Vitest, Jest, Playwright, pytest, JUnit и др.).
    - Визуализация: steps, attachments, screenshots, video, logs.
    - Flakiness detection и triage‑доска.
    - История, тренды, сравнение прогонов.

3. **Correlation Layer**
    - Mapping test failures → source code lines → static analysis issues.
    - Root‑cause suggestions: «Тест X упал → вероятная причина: rule Y в файле Z».
    - Impact analysis: «Изменение в модуле A затронет N тестов».

4. **AI/ML Services**
    - Auto‑triage: классификация ошибок (infra, flaky, real bug).
    - Predictive quality: риск регрессии на основе diff и истории.
    - Smart prioritization: ранжирование issues по бизнес‑импакту.
    - Code fix suggestions: LLM‑based рекомендации и авто‑патчи.
    - Anomaly detection: алерты на резкие изменения метрик.

5. **Integrations & Extensibility**
    - CI/CD: GitHub Actions, GitLab CI, Jenkins, Azure DevOps.
    - VCS: PR decoration, inline comments, status checks.
    - Issue trackers: Jira, Linear, GitHub Issues.
    - Notifications: Slack, Teams, email, webhooks.
    - Plugin SDK: custom reporters, analyzers, ML models.

## Дифференциация

- **vs SonarQube**: + Тестовая аналитика и triage; + AI‑приоритизация; унифицированный обзор code+test.
- **vs Allure**: + Статический анализ и SAST; интеграция triage и history; enterprise‑возможности.
- **vs Zebrunner**: + Open‑core ядро с расширенной аналитикой и ML‑сервисами.

## Целевая аудитория

Engineering teams, QA, DevOps и Security — все, кто отвечает за качество и скорость релизов.

## Этапы развития (высокоуровнево)

1. Foundation — текущий функционал: Vitest reporter + ESLint/TS diagnostics → JSON.
2. Visualization — HTML/SPA dashboard, история прогонов, базовые тренды.
3. Aggregation — серверный компонент, хранение, API, multi‑project.
4. Correlation — связь code issues ↔ test failures, unified model.
5. AI Layer — flakiness prediction, auto‑triage, LLM suggestions.
6. Ecosystem — plugin SDK, marketplace, enterprise SaaS.

---

Документ создан автоматически как стартовая мудборд‑версия философии проекта. Дальше можно разделить на `vision.md`, `roadmap.md` и `architecture.md` по необходимости.
