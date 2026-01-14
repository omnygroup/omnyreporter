# Application Module

The **application** module contains use-cases that orchestrate the domain layer and coordinate with infrastructure. Use-cases implement business scenarios and are the primary entry point for the CLI.

## Contents

### `usecases/` - Business Use Cases
High-level operations:

- `CollectDiagnosticsUseCase` - Collect diagnostics from all sources
- `GenerateReportUseCase` - Generate formatted reports

## Key Principles

1. **Orchestration** - Coordinates domain and infrastructure
2. **Use Cases** - Implements user-facing scenarios
3. **No Business Logic** - Delegates to domain layer
4. **Dependency Injection** - All dependencies injected
5. **Result Types** - Returns `Result<T, E>` for error handling

## Architecture

Application layer sits at the coordination level:

```
┌──────────────────┐
│ CLI              │ Calls use cases
├──────────────────┤
│ APPLICATION      │ ← You are here (orchestration)
│ - Use Cases      │
├──────────────────┤
│ REPORTERS        │ Inject as dependencies
├──────────────────┤
│ DOMAIN           │ Inject as dependencies
├──────────────────┤
│ INFRASTRUCTURE   │ Inject as dependencies
└──────────────────┘
```

## Usage Examples

### Collect Diagnostics Use Case
```typescript
import { CollectDiagnosticsUseCase } from '@/application/usecases';
import { EslintReporter } from '@/reporters/eslint';
import { TypeScriptAdapter } from '@/reporters/typescript';
import { PinoLogger } from '@/infrastructure/logging';

// Setup
const logger = new PinoLogger();
const sources = [
  new EslintReporter(logger),
  new TypeScriptAdapter(logger),
];

// Create use case
const useCase = new CollectDiagnosticsUseCase(sources, logger);

// Execute
const result = await useCase.execute({
  patterns: ['src/**/*.ts'],
  ignorePatterns: ['dist/**']
});

if (result.isOk()) {
  const diagnostics = result.value;
  console.log(`Found ${diagnostics.length} issues`);
  
  // Use domain layer for analytics
  const analytics = new DiagnosticAnalytics();
  const statsResult = await analytics.collect(diagnostics);
  const stats = statsResult.value;
  console.log(`Errors: ${stats.errorCount}`);
} else {
  console.error('Failed to collect diagnostics:', result.error);
}
```

### Generate Report Use Case
```typescript
import { GenerateReportUseCase } from '@/application/usecases';
import { JsonFormatter } from '@/infrastructure/formatting';
import { JsonWriter } from '@/infrastructure/filesystem';

const formatter = new JsonFormatter();
const writer = new JsonWriter();
const logger = new PinoLogger();

const useCase = new GenerateReportUseCase(writer, formatter, logger);

// Prepare report data
const reports: DiagnosticReport[] = [{
  timestamp: new Date(),
  totalDiagnostics: 10,
  bySource: { eslint: 7, typescript: 3, vitest: 0 },
  bySeverity: { error: 2, warning: 8, info: 0, note: 0 },
  diagnostics: allDiagnostics,
}];

// Generate and write report
const result = await useCase.execute(reports, {
  path: '/output/report.json'
});

if (result.isOk()) {
  console.log('Report generated successfully');
} else {
  console.error('Report generation failed:', result.error);
}
```

### Combined Workflow
```typescript
async function analyzeProject() {
  const logger = new PinoLogger();
  const config = { patterns: ['src/**/*.ts'] };
  
  // Step 1: Collect diagnostics
  const collectUseCase = new CollectDiagnosticsUseCase(sources, logger);
  const diagResult = await collectUseCase.execute(config);
  if (diagResult.isErr()) return diagResult;
  
  const diagnostics = diagResult.value;
  
  // Step 2: Analyze statistics
  const analytics = new DiagnosticAnalytics();
  const statsResult = await analytics.collect(diagnostics);
  if (statsResult.isErr()) return statsResult;
  
  // Step 3: Generate report
  const report: DiagnosticReport = {
    timestamp: new Date(),
    totalDiagnostics: diagnostics.length,
    bySource: groupBySource(diagnostics),
    bySeverity: groupBySeverity(diagnostics),
    diagnostics,
  };
  
  // Step 4: Write report
  const generateUseCase = new GenerateReportUseCase(writer, formatter, logger);
  return generateUseCase.execute([report]);
}
```

## Adding New Use Cases

To add a new use-case:

1. **Identify Scenario** - What user action does it represent?
2. **Define Execute Method**:
```typescript
// src/application/usecases/MyUseCase.ts
import type { Result } from '@/core/types';

export class MyUseCase {
  constructor(
    private readonly dependency1: IDependency1,
    private readonly dependency2: IDependency2,
    private readonly logger: ILogger
  ) {}

  async execute(input: InputType): Promise<Result<OutputType, Error>> {
    try {
      this.logger.info('Starting MyUseCase');
      
      // Step 1: Validate input
      const validated = validateInput(input);
      
      // Step 2: Call domain layer
      const result = await this.dependency1.doSomething(validated);
      if (result.isErr()) return result;
      
      // Step 3: Process results
      const output = await this.dependency2.process(result.value);
      
      this.logger.info('MyUseCase completed successfully');
      return output;
    } catch (error) {
      this.logger.error('MyUseCase failed', error as Error);
      return err(new ApplicationError('MyUseCase failed', error as Error));
    }
  }
}
```

3. **Export from Index**:
```typescript
// src/application/usecases/index.ts
export { MyUseCase } from './MyUseCase.js';
```

4. **Add Tests**:
```typescript
// tests/integration/usecases/MyUseCase.test.ts
describe('MyUseCase', () => {
  // Test cases with mocks
});
```

## Error Handling Pattern

All use-cases follow this pattern:

```typescript
async execute(input: Input): Promise<Result<Output, Error>> {
  try {
    // Orchestrate operations
    const step1 = await operation1(input);
    if (step1.isErr()) return step1;
    
    const step2 = await operation2(step1.value);
    if (step2.isErr()) return step2;
    
    return ok(step2.value);
  } catch (error) {
    // Unexpected errors
    return err(new ApplicationError('Failed', error as Error));
  }
}
```

## Dependency Injection

Use-cases receive all dependencies via constructor:

```typescript
class MyUseCase {
  constructor(
    private readonly service1: IService1, // Injected
    private readonly service2: IService2, // Injected
    private readonly logger: ILogger       // Injected
  ) {}
}

// Usage (manual DI)
const useCase = new MyUseCase(
  new Service1Impl(),
  new Service2Impl(),
  new PinoLogger()
);

// Or with DI container (Phase 2+)
const useCase = container.get(MyUseCase);
```

## Testing Use Cases

Use-cases are tested with mocks:

```typescript
import { MyUseCase } from '@/application/usecases';
import { MockService1, MockService2, MockLogger } from 'tests/mocks';

describe('MyUseCase', () => {
  it('should orchestrate services correctly', async () => {
    const service1 = new MockService1();
    const service2 = new MockService2();
    const logger = new MockLogger();
    
    const useCase = new MyUseCase(service1, service2, logger);
    const result = await useCase.execute(input);
    
    expect(result.isOk()).toBe(true);
  });
});
```

---

See [../../specs/architecture.md](../../specs/architecture.md) for architecture overview.
