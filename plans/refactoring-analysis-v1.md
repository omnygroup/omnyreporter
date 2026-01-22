# OmnyReporter Refactoring Analysis Plan v1

## Summary

Based on detailed analysis of the codebase against architecture.md and business-rules.md, I've identified significant dead code, unused DI registrations, missing registrations, and redundant patterns.

## Current Code Issues

### 1. Missing DI Registrations (Critical)

The following services have tokens defined but NO binding registration:

| Token                            | Class                        | Status             |
| -------------------------------- | ---------------------------- | ------------------ |
| `DIAGNOSTIC_APPLICATION_SERVICE` | DiagnosticApplicationService | ❌ No registration |
| `GENERATE_REPORT_USE_CASE`       | GenerateReportUseCase        | ❌ No registration |

**Impact**: The CLI will crash at runtime when trying to get these services.

### 2. Unused DI Registrations

The following are registered but NEVER retrieved via `container.get()`:

| Token                  | Class               | Evidence                    |
| ---------------------- | ------------------- | --------------------------- |
| `TYPESCRIPT_ANALYTICS` | TypeScriptAnalytics | Only registered, never used |
| `CONSOLE_LOGGER`       | ConsoleLogger       | Only registered, never used |
| `JSON_WRITER`          | JsonWriter          | Only registered, never used |
| `STREAM_WRITER`        | StreamWriter        | Only registered, never used |
| `FILE_WRITER`          | FileWriter          | Only registered, never used |
| `CONFIG_VALIDATOR`     | ConfigValidator     | Only registered, never used |
| `PATH_VALIDATOR`       | PathValidator       | Only registered, never used |

### 3. Completely Unused Value Objects (Dead Code)

```
src/core/types/DiagnosticSeverity.ts (129 lines)
src/core/types/DiagnosticSource.ts (102 lines)
```

These elaborate value object classes are NEVER instantiated anywhere. The codebase uses string literal types instead:

- `type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'note'`
- `type DiagnosticSource = 'eslint' | 'typescript' | 'vitest'`

**Total: ~231 lines of dead code**

### 4. Unused Analytics Module (Partially Dead)

```
src/domain/analytics/lint/
├── LintAnalytics.ts (54 lines) ❌ NOT USED
├── LintStatisticsCalculator.ts (~40 lines) ❌ NOT USED
├── types.ts (~20 lines) ❌ NOT USED
└── index.ts
```

```
src/domain/analytics/typescript/
├── TypeScriptAnalytics.ts (60 lines) ─ Registered but NEVER used
├── TypeScriptStatisticsCalculator.ts (~40 lines) ─ Only used by above
└── types.ts (~20 lines)
```

Only `DiagnosticAnalytics` and `TestAnalytics` are actually used.

**Total: ~170+ lines of effectively dead code**

### 5. Unused Infrastructure Writers

```
src/infrastructure/filesystem/JsonWriter.ts - 55 lines ❌
src/infrastructure/filesystem/StreamWriter.ts - 55 lines ❌
src/infrastructure/filesystem/FileWriter.ts - 40 lines ❌
```

These implement IWriter but are never used - only `StructuredReportWriter` is used.

**Total: ~150 lines of dead code**

### 6. Unused Logger

```
src/infrastructure/logging/VerboseLogger.ts - 80 lines ❌
```

Only `PinoLogger` is registered and used as the primary logger.

### 7. Reporter Duplication

Both Adapter and Reporter exist for eslint/typescript:

- `EslintAdapter` + `EslintReporter`
- `TypeScriptAdapter` + `TypeScriptReporter`

The Reporters just wrap Adapters with BaseDiagnosticSource. Currently:

- `DiagnosticApplicationService` uses Adapters directly
- `GenerateReportUseCase` expects `IDiagnosticSource[]` (would be Reporters)

**Inconsistent pattern - only one abstraction is needed.**

### 8. VitestAdapter - Stub Implementation

`VitestAdapter` and `TaskProcessor` have stub implementations that return empty arrays. Since Vitest integration isn't complete, this can be removed or clearly marked as stub.

---

## Proposed Architecture After Refactoring

```
┌──────────────────────────────────────────┐
│ VIEW (CLI)                               │
│ - diagnostics.ts command                 │
│ - Simple layer: calls Application        │
├──────────────────────────────────────────┤
│ APPLICATION (Use-Cases)                  │
│ - DiagnosticApplicationService           │
│   └── Orchestrates: ESLint, TypeScript   │
│ - GenerateReportUseCase                  │
│   └── Collects → Aggregates → Analytics  │
├──────────────────────────────────────────┤
│ REPORTERS (Adapters)                     │
│ - EslintReporter (IDiagnosticSource)     │
│ - TypeScriptReporter (IDiagnosticSource) │
├──────────────────────────────────────────┤
│ DOMAIN (Business Logic)                  │
│ - DiagnosticAggregator                   │
│ - DiagnosticAnalytics                    │
│ - DiagnosticMapper                       │
│ - ConfigValidator                        │
├──────────────────────────────────────────┤
│ INFRASTRUCTURE (Services)                │
│ - PinoLogger (ILogger)                   │
│ - NodeFileSystem (IFileSystem)           │
│ - DirectoryService                       │
│ - StructuredReportWriter                 │
│ - ConsoleFormatter, JsonFormatter, etc.  │
│ - UpathService (IPathService)            │
│ - RedactSanitizer (ISanitizer)           │
├──────────────────────────────────────────┤
│ CORE (Contracts, Types)                  │
│ - Interfaces (ILogger, IFileSystem, ...) │
│ - Types (Diagnostic, Statistics, ...)    │
│ - Abstractions (BaseDiagnosticSource)    │
│ - Errors (BaseError, DiagnosticError)    │
└──────────────────────────────────────────┘
```

---

## Detailed Refactoring Tasks

### Phase 1: Fix Critical Issues

1. **Create `registerApplication.ts`** to register:
    - DiagnosticApplicationService
    - GenerateReportUseCase (with proper dependencies)

2. **Fix GenerateReportUseCase DI** - needs sources injected properly

### Phase 2: Delete Unused Files

| File                                            | Lines | Reason                                        |
| ----------------------------------------------- | ----- | --------------------------------------------- |
| `src/core/types/DiagnosticSeverity.ts`          | 129   | Value object never used                       |
| `src/core/types/DiagnosticSource.ts`            | 102   | Value object never used                       |
| `src/domain/analytics/lint/`                    | ~114  | LintAnalytics never used                      |
| `src/domain/analytics/typescript/`              | ~120  | TypeScriptAnalytics registered but never used |
| `src/infrastructure/filesystem/JsonWriter.ts`   | 55    | Never used                                    |
| `src/infrastructure/filesystem/StreamWriter.ts` | 55    | Never used                                    |
| `src/infrastructure/filesystem/FileWriter.ts`   | 40    | Never used                                    |
| `src/infrastructure/logging/VerboseLogger.ts`   | 80    | Never used                                    |

**Total estimated reduction: ~695 lines**

### Phase 3: Consolidate Reporters

**Option A**: Keep Adapter + Reporter pattern (current)

- Adapter = low-level tool wrapper
- Reporter = IDiagnosticSource adapter

**Option B (Recommended)**: Merge into single class per tool

- `EslintDiagnosticSource` implements `IDiagnosticSource`, uses ESLint API directly
- Remove separate Adapter layer

**Decision needed**: Which pattern do you prefer?

### Phase 4: Clean Up DI Tokens

Remove from `tokens.ts`:

```typescript
// REMOVE these unused tokens:
CONSOLE_LOGGER;
JSON_WRITER;
STREAM_WRITER;
FILE_WRITER;
TYPESCRIPT_ANALYTICS;
```

### Phase 5: Update Barrel Exports

Remove dead exports from:

- `src/core/types/index.ts`
- `src/domain/analytics/index.ts`
- `src/infrastructure/filesystem/index.ts`
- `src/infrastructure/logging/index.ts`

### Phase 6: Consider Vitest Integration

Current state: VitestAdapter is a stub returning empty arrays.

Options:

1. **Remove it entirely** - Clean up dead code
2. **Mark as TODO** - Keep stub with clear documentation
3. **Implement properly** - Actually integrate with Vitest

---

## Summary Statistics

| Metric                | Before | After (Est.) |
| --------------------- | ------ | ------------ |
| Dead code files       | ~15    | 0            |
| Unused DI tokens      | 7      | 0            |
| Total lines removed   | -      | ~700+        |
| Missing registrations | 2      | 0            |

---

## Questions for Discussion

1. **Reporter pattern**: Keep Adapter+Reporter separation or consolidate?

2. **Vitest**: Remove stub implementation or keep as placeholder?

3. **ConfigValidator**: Currently registered but not used via DI - should validation happen in CLI or Application layer?

4. **TypeScript value objects** (DiagnosticSeverity, DiagnosticSource classes): Delete entirely or convert to simple validators?

---

## Next Steps

After approval:

1. Switch to Code mode
2. Execute refactoring tasks in phases
3. Run tests after each phase
4. Update documentation
