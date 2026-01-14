# Reporters Module

The **reporters** module contains adapters for external diagnostic tools. Each reporter collects diagnostics from a specific tool (ESLint, TypeScript, Vitest) and adapts them to the common `IDiagnosticSource` interface.

## Contents

### `eslint/` - ESLint Integration
- `EslintAdapter` - Wrapper around ESLint API
- `EslintReporter` - Diagnostic source implementation
- `types.ts` - ESLint-specific types

### `typescript/` - TypeScript Integration
- `TypeScriptAdapter` - TypeScript compiler API wrapper
- `TypeScriptReporter` - Diagnostic source implementation

### `vitest/` - Vitest Integration
- `VitestAdapter` - Vitest API wrapper
- `TaskProcessor` - Test task processing

## Key Principles

1. **Adapter Pattern** - Isolate external tool APIs
2. **Common Interface** - All reporters implement `IDiagnosticSource`
3. **Independence** - Each reporter is isolated from others
4. **Error Handling** - Wrap tool errors in Result types
5. **Diagnostics Normalization** - Convert tool-specific errors to common format

## Usage Examples

### ESLint Reporter
```typescript
import { EslintReporter } from '@/reporters/eslint';
import { PinoLogger } from '@/infrastructure/logging';

const logger = new PinoLogger();
const eslint = new EslintReporter(logger);

const result = await eslint.collect({
  patterns: ['src/**/*.ts', 'tests/**/*.test.ts'],
  ignorePatterns: ['dist/**', 'node_modules/**']
});

if (result.isOk()) {
  const diagnostics = result.value;
  console.log(`Found ${diagnostics.length} ESLint issues`);
} else {
  console.error('ESLint collection failed:', result.error);
}
```

### TypeScript Adapter
```typescript
import { TypeScriptAdapter } from '@/reporters/typescript';

const logger = new PinoLogger();
const typescript = new TypeScriptAdapter(logger);

const result = await typescript.collect({
  patterns: ['src/**/*.ts']
});

if (result.isOk()) {
  const diagnostics = result.value;
  diagnostics.forEach(d => {
    console.log(`${d.filePath}:${d.line} - ${d.message}`);
  });
}
```

### Combined Collection
```typescript
import { CollectDiagnosticsUseCase } from '@/application/usecases';
import { EslintReporter } from '@/reporters/eslint';
import { TypeScriptAdapter } from '@/reporters/typescript';

const sources = [
  new EslintReporter(logger),
  new TypeScriptAdapter(logger),
];

const useCase = new CollectDiagnosticsUseCase(sources, logger);

const result = await useCase.execute({
  patterns: ['src/**/*.ts']
});

if (result.isOk()) {
  const allDiagnostics = result.value;
  // Combined diagnostics from all sources
}
```

## Adding a New Reporter

To add support for a new tool:

1. **Create Directory** - `reporters/mytools/`

2. **Create Adapter** - Wrap tool API:
```typescript
// src/reporters/mytool/MyToolAdapter.ts
import type { ILogger } from '@/core/contracts';
import { BaseDiagnosticSource } from '@/core/abstractions';
import { MyToolAPI } from 'mytool';

export class MyToolAdapter extends BaseDiagnosticSource {
  constructor(private readonly logger: ILogger) {
    super('mytool', logger);
  }

  protected async collect(
    config: CollectionConfig
  ): Promise<Result<readonly Diagnostic[], Error>> {
    try {
      const tool = new MyToolAPI();
      const results = await tool.lint(config.patterns);
      return ok(this.normalizeDiagnostics(results));
    } catch (error) {
      return err(new DiagnosticError('MyTool failed', error as Error));
    }
  }

  private normalizeDiagnostics(results: any[]): Diagnostic[] {
    return results.map(r => ({
      id: `mytool-${r.id}`,
      source: 'mytool' as const, // Update type in core/types
      filePath: r.file,
      line: r.loc.start.line,
      column: r.loc.start.column,
      severity: r.severity as DiagnosticSeverity,
      code: r.ruleId,
      message: r.message,
      timestamp: new Date(),
    }));
  }
}
```

3. **Export from Index**:
```typescript
// src/reporters/mytools/index.ts
export { MyToolAdapter } from './MyToolAdapter.js';
```

4. **Update Types** if new source:
```typescript
// src/core/types/diagnostic.ts
export type DiagnosticSource = 'eslint' | 'typescript' | 'vitest' | 'mytool';
```

5. **Add Tests**:
```typescript
// tests/integration/reporters/MyTool.test.ts
import { MyToolAdapter } from '@/reporters/mytool';

describe('MyToolAdapter', () => {
  // Test cases
});
```

## Architecture Pattern

Each reporter follows the Template Method pattern:

```
┌─────────────────────────────┐
│ BaseDiagnosticSource        │
│ (template method skeleton)  │
├─────────────────────────────┤
│ collect() {                 │
│   1. validate config        │
│   2. call abstract collect()│
│   3. normalize diagnostics  │
│   4. return Result          │
│ }                           │
├─────────────────────────────┤
│ abstract collect(config)    │
└─────────────────────────────┘
         ↑
    ┌────┴─────┬──────────┐
    │           │          │
┌───────┐ ┌──────────┐ ┌────────┐
│ ESLint│ │TypeScript│ │ Vitest │
└───────┘ └──────────┘ └────────┘
```

## Normalization Strategy

Each tool has different output format. Normalization converts to common `Diagnostic`:

| Tool | Raw Type | Our Type |
|------|----------|----------|
| ESLint | `LintMessage` | `Diagnostic` |
| TypeScript | `Diagnostic` | `Diagnostic` |
| Vitest | `TestError` | `Diagnostic` |

## Error Handling

All reporters wrap errors in `Result` type:

```typescript
return await eslint.collect(config);
// Returns: Result<Diagnostic[], Error>

// If ESLint is not installed:
// err(new DiagnosticError('ESLint not found'))

// If pattern is invalid:
// err(new ValidationError('Invalid glob pattern'))

// Success:
// ok(diagnostics)
```

## Testing Reporters

```bash
# Test specific reporter
npm run test:integration -- tests/integration/reporters/EslintReporter

# Test all reporters
npm run test:integration -- tests/integration/reporters
```

## Performance Optimization

1. **Parallel Collection** - Run multiple reporters in parallel
2. **Incremental Analysis** - Only check changed files
3. **Caching** - Cache tool results if not changed
4. **Lazy Loading** - Load tools only when needed

## Known Issues & Limitations

- **ESLint**: Requires ESLint 8+ (flat config)
- **TypeScript**: Requires TypeScript 4.5+
- **Vitest**: Requires Vitest 0.30+

---

See [../../specs/architecture.md](../../specs/architecture.md) for architecture overview.
