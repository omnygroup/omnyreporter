# Core Module

The **core** module is the foundation of OmnyReporter. It contains all interfaces (contracts), types, abstractions, and error definitions that all other modules depend on.

## Contents

### `types/` - Type Definitions
- `diagnostic.ts` - Core Diagnostic type and factories
- `statistics.ts` - Statistics type for aggregated counts
- `result.ts` - Result<T, E> type alias (neverthrow)
- `config.ts` - Collection configuration type

### `contracts/` - Interface Contracts
8 core interfaces that define the architecture:

| Interface | Purpose | Implemented By |
|-----------|---------|-----------------|
| `ILogger` | Logging interface | PinoLogger |
| `IFileSystem` | File I/O operations | NodeFileSystem |
| `IDiagnosticSource` | Diagnostic collection | EslintReporter, TypeScriptAdapter |
| `IFormatter<T>` | Output formatting | JsonFormatter, TableFormatter |
| `IWriter<T>` | Result output | JsonWriter, StreamWriter |
| `IPathService` | Path normalization | UpathService |
| `ISanitizer` | Sensitive data redaction | RedactSanitizer |
| `IAnalyticsCollector<T, S>` | Statistics collection | DiagnosticAnalytics |

### `abstractions/` - Base Classes
Template Method pattern base classes:

- `BaseDiagnosticSource` - Base for all diagnostic reporters
- `BaseAnalyticsCollector<T, S>` - Base for analytics calculators
- `BaseMapper` - Base for data transformations
- `BaseError` - Base for all custom errors

### `errors/` - Error Types
Typed error classes for compile-time safety:

- `ValidationError` - Invalid configuration
- `ConfigurationError` - Config-related errors
- `FileSystemError` - File I/O errors
- `DiagnosticError` - Diagnostic collection errors

### `utils/` - Utilities
- `type-guards.ts` - TypeScript type guards
- `assertions.ts` - Runtime assertion functions

## Key Principles

1. **Zero External Dependencies** - Core only uses TypeScript
2. **Interface Segregation** - Small, focused interfaces
3. **Immutability** - All types use `readonly` fields
4. **Type Safety** - Strict TypeScript mode enabled

## Usage Examples

### Using Contracts
```typescript
import type { ILogger, IDiagnosticSource } from '@/core/contracts';
import type { Diagnostic } from '@/core/types';

function createReporter(logger: ILogger): IDiagnosticSource {
  // Logger interface is defined in core
  logger.info('Creating reporter');
  // ...
}
```

### Creating Typed Errors
```typescript
import { ValidationError } from '@/core/errors';

if (!isValid(config)) {
  throw new ValidationError('Configuration is invalid', { config });
}
```

### Type Guards
```typescript
import { isError, isDiagnostic } from '@/core/utils';

if (isError(value)) {
  console.error(value.message);
}
```

## Extension Points

To add a new interface contract:

1. Create `IMyContract.ts` in `contracts/`
2. Document all methods with JSDoc
3. Export from `contracts/index.ts`
4. Create implementation in `infrastructure/` module
5. Add base class in `abstractions/` if pattern-based

## Dependencies

- No external dependencies (only TypeScript)
- All other modules depend on this module
- Changes here affect entire codebase

## Testing

Core module doesn't have unit tests (pure type definitions). However:
- Type correctness is verified by TypeScript compiler
- Implementation tests exist in infrastructure tests
- Contract compliance tested in integration tests

---

See [../../specs/architecture.md](../../specs/architecture.md) for detailed architecture overview.
