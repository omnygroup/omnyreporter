# Domain Module

The **domain** module contains all business logic, independent of any frameworks or external tools. It implements the core algorithms and rules of OmnyReporter.

## Contents

### `analytics/` - Statistics & Analytics
Calculate and aggregate diagnostic statistics:

- `base/StatisticsCalculator` - Base class for statistic calculations
- `diagnostics/DiagnosticAnalytics` - Analytics specific to diagnostics
- `diagnostics/DiagnosticAggregator` - Aggregate diagnostics from multiple sources
- `tests/TestAnalytics` - Statistics for test results
- `lint/LintAnalytics` - Statistics for linting results

### `mappers/` - Data Transformation
Transform data between formats:

- `DiagnosticMapper` - Convert diagnostics to/from persistence format

### `validation/` - Configuration Validation
Validate and type-check configurations:

- `ConfigValidator` - Validates CollectionConfig using Zod
- `schemas/` - Zod validation schemas

## Key Principles

1. **Pure Business Logic** - No HTTP, UI, or database concerns
2. **Framework Independent** - Works without Express, React, etc.
3. **Testable** - No hard dependencies on external services
4. **Single Responsibility** - Each class has one reason to change
5. **Immutability** - Work with readonly data structures

## Usage Examples

### Analytics
```typescript
import { DiagnosticAnalytics } from '@/domain/analytics';

const analytics = new DiagnosticAnalytics();
const result = await analytics.collect(diagnostics);

if (result.isOk()) {
  const stats = result.value;
  console.log(`Found ${stats.errorCount} errors`);
  console.log(`Found ${stats.warningCount} warnings`);
}
```

### Aggregation
```typescript
import { DiagnosticAggregator } from '@/domain/analytics';

const allDiags = DiagnosticAggregator.aggregate([
  eslintDiags,
  typescriptDiags,
  vitestDiags,
]);

const bySource = DiagnosticAggregator.groupBySource(allDiags);
console.log(`ESLint: ${bySource.eslint.length}`);
console.log(`TypeScript: ${bySource.typescript.length}`);
```

### Validation
```typescript
import { ConfigValidator } from '@/domain/validation';

const validator = new ConfigValidator();
const result = validator.validate(config);

if (result.isOk()) {
  const validated = result.value;
  // Config is now fully typed and validated
}
```

### Mapping
```typescript
import { DiagnosticMapper } from '@/domain/mappers';

// Convert to JSON format
const json = DiagnosticMapper.toPersistence(diagnostic);

// Convert back from JSON
const restored = DiagnosticMapper.fromPersistence(json);
```

## Architecture

Domain layer sits in the middle:

```
┌─────────────────┐
│ APPLICATION     │ Use cases coordinate domain
├─────────────────┤
│ DOMAIN          │ ← You are here (business logic)
├─────────────────┤
│ INFRASTRUCTURE  │ External services injected
├─────────────────┤
│ CORE            │ Contracts & types
└─────────────────┘
```

## Dependencies

- **Core Module** (contracts, types)
- **neverthrow** (Result type)
- **zod** (validation schemas)

Does NOT depend on:
- Infrastructure implementations
- External APIs
- Web frameworks
- Databases

## Testing

Domain layer should be heavily tested:

```bash
# Run domain tests
npm run test:unit -- tests/unit/domain
```

Examples: [tests/unit/domain/](../../tests/unit/domain/)

## Adding New Business Logic

To add a new domain concept:

1. Create directory in `domain/feature/`
2. Define types in `core/types/`
3. Define contract in `core/contracts/` if needed
4. Implement business logic in domain
5. Add unit tests in `tests/unit/domain/feature/`
6. Export from `domain/index.ts`

Example: Adding a new analytics type:

```typescript
// src/domain/analytics/custom/CustomAnalytics.ts
import { BaseAnalyticsCollector } from '@/core/abstractions';

export class CustomAnalytics extends BaseAnalyticsCollector<Input, Output> {
  async collect(input: Input[]): Promise<Result<Output, Error>> {
    // Business logic here
    return ok(output);
  }
}

// src/domain/index.ts
export { CustomAnalytics } from './analytics/custom/index.js';
```

## Extension Points

- **New analytics calculators:** Extend `BaseAnalyticsCollector`
- **New mappers:** Implement transformation logic
- **New validators:** Add Zod schemas and validation logic
- **New statistical measures:** Add to analytics classes

---

See [../../specs/architecture.md](../../specs/architecture.md) for detailed architecture.
