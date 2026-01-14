# ADR-003: Why inversify for Dependency Injection

**Status:** Accepted  
**Date:** January 2026  
**Author:** OmnyReporter Team  

## Context

With Clean Architecture and 120+ files, manually managing dependencies became complex:
1. Need to construct complex dependency graphs
2. Want to support multiple implementations (testing vs production)
3. Need a way to register and resolve dependencies at runtime
4. Circular dependency risks with manual construction

Options evaluated:
1. **Manual constructor injection** - Simple but scales poorly
2. **Service locator pattern** - Anti-pattern, hides dependencies
3. **inversify** - Professional-grade DI container for TypeScript
4. **typeorm/di** - Too coupled to ORM

## Decision

We chose **inversify** as the dependency injection container:

```typescript
import { Container, injectable, inject } from 'inversify';

@injectable()
class EslintReporter implements IDiagnosticSource {
  constructor(@inject('ILogger') private logger: ILogger) {}
}

const container = new Container();
container.bind('ILogger').to(PinoLogger).inSingletonScope();
container.bind(IDiagnosticSource).to(EslintReporter);

const reporter = container.get(IDiagnosticSource);
```

## Architecture

### Current (Phase 1-3): Manual Injection
```typescript
const logger = new PinoLogger();
const eslint = new EslintReporter(logger);
const typescript = new TypeScriptAdapter(logger);
const useCase = new CollectDiagnosticsUseCase([eslint, typescript], logger);
```

### Future (Phase 2+): With inversify
```typescript
const container = createContainer();
const useCase = container.get(CollectDiagnosticsUseCase);
// All dependencies automatically resolved
```

## Benefits

### 1. Automatic Dependency Resolution
```typescript
@injectable()
class MyService {
  constructor(
    @inject('ILogger') private logger: ILogger,
    @inject('IFileSystem') private fs: IFileSystem
  ) {}
}

// Container resolves all dependencies automatically
const service = container.get(MyService);
```

### 2. Lifecycle Management
```typescript
// Singleton - shared instance
container.bind(ILogger).to(PinoLogger).inSingletonScope();

// Transient - new instance each time
container.bind('RequestHandler').to(Handler).inTransientScope();

// Request scope - per request instance
container.bind('RequestData').to(RequestData).inRequestScope();
```

### 3. Multiple Implementations
```typescript
// Production
container.bind(ILogger).to(PinoLogger);

// Testing
container.bind(ILogger).to(MockLogger);

// Different database
container.bind(IFileSystem).to(NodeFileSystem); // prod
container.bind(IFileSystem).to(MockFileSystem); // tests
```

### 4. Configuration
```typescript
container.bind(IConfig).toConstantValue({
  logLevel: 'debug',
  maxRetries: 3,
});
```

## Usage Patterns

### Pattern 1: Basic DI
```typescript
const container = new Container();
container.bind(ILogger).to(PinoLogger).inSingletonScope();
container.bind(IDiagnosticSource).to(EslintReporter);

const reporter = container.get(IDiagnosticSource);
```

### Pattern 2: Testing with Mocks
```typescript
const testContainer = new Container();
testContainer.bind(ILogger).to(MockLogger);
testContainer.bind(IDiagnosticSource).to(MockDiagnosticSource);

const reporter = testContainer.get(IDiagnosticSource);
```

### Pattern 3: Factory Pattern
```typescript
container.bind(IDiagnosticSource).toFactory((context) => {
  const logger = context.container.get(ILogger);
  return new EslintReporter(logger);
});
```

### Pattern 4: Configuration-Based
```typescript
container.bind(IDiagnosticSource).to(EslintReporter).when(
  (request) => request.parentRequest?.target.name.toString() === 'EslintRequired'
);
```

## Implementation Plan

### Phase 2: Setup DI Container
1. Create `src/container.ts` with all bindings
2. Decorate classes with `@injectable()` and `@inject()`
3. Export factory functions for container creation

### Phase 3: Integrate CLI
1. Replace manual construction with container.get()
2. Create different containers for different environments
3. Implement environment-specific configurations

### Phase 4+: Optimize
1. Analyze dependency graph
2. Tune lifecycle management
3. Profile performance impact

## Consequences

### Positive
- ✅ **Scalable:** Easy to add new services without changing existing code
- ✅ **Testable:** Swap mock implementations for testing
- ✅ **Maintainable:** Clear dependency graph
- ✅ **Flexible:** Support multiple implementations
- ✅ **Professional:** Industry-standard solution

### Negative
- ❌ **Complexity:** Another framework to learn
- ❌ **Decorators:** Uses experimental TypeScript decorators
- ❌ **Runtime overhead:** Reflection is slower than direct construction
- ❌ **Bootstrap complexity:** Container setup code required

### Mitigation
- Phase-based rollout - don't rush
- Comprehensive documentation
- Examples for common patterns
- Clear naming conventions

## Performance Impact

inversify adds minimal runtime overhead:
- Container creation: ~5ms
- Service resolution: <1ms per call
- Memory: ~50KB for typical app

For CLI usage (one-time execution), impact is negligible.

## Comparison with Alternatives

| Feature | Manual DI | Service Locator | inversify | NestJS |
|---------|-----------|-----------------|-----------|--------|
| Type Safety | ✅ | ❌ | ✅ | ✅ |
| Lifecycle | ❌ | ❌ | ✅ | ✅ |
| Decorators | ❌ | ❌ | ✅ | ✅ |
| Learning Curve | Easy | Moderate | Moderate | Hard |
| Lightweight | ✅ | ✅ | ✅ | ❌ |

We chose inversify because it's:
1. Professional and well-maintained
2. Lightweight for CLI tool
3. Flexible for our use case
4. Industry standard in TypeScript

## Related Decisions

- [ADR-001: Clean Architecture](./ADR-001-Clean-Architecture.md)
- [ADR-002: Result Types with neverthrow](./ADR-002-Result-Types.md)

## References

- [inversify Documentation](https://github.com/inversify/inversify.js)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [Dependency Injection Principles](https://martinfowler.com/articles/injection.html)

---

**Status:** ✅ ACCEPTED (Implementation deferred to Phase 2)

inversify will make OmnyReporter highly extensible and testable as it scales.
