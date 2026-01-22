# Contributing to OmnyReporter

Thank you for your interest in contributing! This guide explains development setup and contribution process.

## Setup

```bash
npm install              # Install dependencies
npm run build           # Compile TypeScript
npm test               # Run test suite
npm run lint           # Check code style
```

## Code Style

### Requirements

- **ESLint:** Must pass with 0 warnings (`npm run lint`)
- **TypeScript:** Strict mode enabled (`npm run build`)
- **Tests:** All must pass (`npm test`)
- **Coverage:** Must meet 70% threshold

### Standards

- No `any` types (use `unknown` with type guards)
- All public APIs documented with JSDoc
- @example tags for complex methods
- Result<T, E> types for error handling
- Constructor injection for dependencies

Example:

```typescript
/**
 * Process diagnostics
 * @param diagnostics Items to process
 * @returns Result with processed data
 * @example
 * const result = await process(diagnostics);
 * if (result.isOk()) console.log(result.value);
 */
async process(diagnostics: readonly Diagnostic[]): Promise<Result<Report, Error>> {
  // Implementation
}
```

## Architecture Rules

✅ **DO:**

- Inject dependencies via constructor
- Return Result types for errors
- Implement contracts from core/
- Test with mocks
- Document all public APIs

❌ **DON'T:**

- Throw exceptions in business logic
- Use `any` types
- Create hard dependencies
- Modify tests/
- Skip documentation

## Testing

### Run Tests

```bash
npm test                  # All tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:coverage    # With coverage report
npm run test:watch       # Watch mode
```

### Write Tests

```typescript
import { describe, it, expect } from 'vitest';
import { MyClass } from '@/domain/feature';
import { MockLogger } from 'tests/mocks';

describe('MyClass', () => {
	it('should do something', async () => {
		const logger = new MockLogger();
		const instance = new MyClass(logger);

		const result = await instance.execute(input);

		expect(result.isOk()).toBe(true);
	});
});
```

## Pull Request Process

1. Create feature branch: `git checkout -b feature/name`
2. Make changes following code style
3. Add tests for new functionality
4. Verify all checks pass:
    ```bash
    npm run lint          # ✅ 0 warnings
    npm run build         # ✅ 0 errors
    npm test             # ✅ All pass
    npm run test:coverage # ✅ 70%+ coverage
    ```
5. Commit with clear messages
6. Push and create PR with description

## Documentation

### Module READMEs

Each module needs README.md explaining:

- What it does
- What it contains
- How to use it
- Extension points

See [src/core/README.md](src/core/README.md) for example.

### JSDoc Requirements

All public APIs need JSDoc:

- @param descriptions
- @returns type description
- @throws for possible errors
- @example code samples

## Adding Features

### New Reporter

1. Create `src/reporters/mytool/` directory
2. Extend `BaseDiagnosticSource`
3. Implement `collect()` method
4. Add integration tests in `tests/integration/reporters/`
5. Update `src/core/types/diagnostic.ts` if new source

### New Use Case

1. Create in `src/application/usecases/`
2. Inject all dependencies
3. Return `Result<T, E>`
4. Add tests in `tests/integration/usecases/`
5. Export from `src/application/usecases/index.ts`

### New Domain Logic

1. Create in `src/domain/feature/`
2. Use only core contracts
3. Add unit tests
4. Don't import from infrastructure

## Questions?

- Check [MIGRATION.md](MIGRATION.md) for v1→v2
- Read [specs/architecture.md](specs/architecture.md) for architecture
- Review [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md) for examples
- Check module READMEs in [src/](src/)

---

**Made with ❤️ by OmnyReporter Team**
