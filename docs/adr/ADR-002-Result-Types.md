# ADR-002: Why neverthrow for Result Types

**Status:** Accepted  
**Date:** January 2026  
**Author:** OmnyReporter Team

## Context

The codebase needed a way to handle errors that:

1. Cannot be silently ignored
2. Are type-safe (no `any` types)
3. Compose well with async/await
4. Work without runtime exceptions

Traditional try/catch error handling in TypeScript has issues:

- Uncaught exceptions terminate processes
- Error types are `unknown` in catch blocks
- Doesn't force handling of error cases
- Hard to compose across multiple async operations

## Decision

We adopted **neverthrow** library implementing the **Result pattern**:

```typescript
type Result<T, E> = Ok<T> | Err<E>;
```

All functions that can fail return `Result<Success, Failure>` instead of throwing.

## Usage Examples

### Before (Exceptions)

```typescript
try {
	const diagnostics = await eslint.collect(config);
	const stats = await analytics.calculate(diagnostics);
	return stats;
} catch (error) {
	// Error type is 'unknown' - need to check it
	if (error instanceof ValidationError) {
		// ...
	}
}
```

### After (Result Types)

```typescript
const result = await eslint.collect(config).andThen((diags) => analytics.calculate(diags));

if (result.isOk()) {
	return result.value;
} else {
	// Error type is known: 'Error'
	logger.error('Failed', result.error);
}
```

## Benefits

### 1. Type Safety

```typescript
const result = await reporter.collect(config);
if (result.isOk()) {
	const diagnostics: readonly Diagnostic[] = result.value; // ✅ Type safe
	const length = diagnostics.length; // ✅ Autocomplete works
} else {
	const error: Error = result.error; // ✅ Always Error
	console.error(error.message);
}
```

### 2. Forced Error Handling

```typescript
// ❌ Wrong - TypeScript error
const diags = result.value;

// ✅ Correct - explicitly check for error
if (result.isOk()) {
	const diags = result.value;
}
```

### 3. Composable Operations

```typescript
const result = await collect(config).andThen(validate).andThen(analyze).andThen(format);

if (result.isOk()) {
	report(result.value);
}
```

### 4. No Silent Failures

```typescript
// Each step is handled
const step1 = await operation1();
if (step1.isErr()) return err(step1.error);

const step2 = await operation2();
if (step2.isErr()) return err(step2.error);

// Or use andThen for cleaner code
return operation1().andThen(operation2).andThen(operation3);
```

### 5. Works with Async/Await

```typescript
async function process(config: Config): Promise<Result<Report, Error>> {
	const collectResult = await useCase.collect(config);
	if (collectResult.isErr()) return collectResult;

	const generateResult = await useCase.generate(collectResult.value);
	return generateResult;
}
```

## Error Handling Patterns

### Pattern 1: Simple Check

```typescript
const result = await collect(config);
if (result.isErr()) {
	logger.error('Failed', result.error);
	return;
}
```

### Pattern 2: Transform Error

```typescript
const result = await collect(config).mapErr((error) => new ConfigurationError(error.message));
```

### Pattern 3: Provide Default

```typescript
const diagnostics = await collect(config).unwrapOr([]); // Return empty array on error
```

### Pattern 4: Chain Operations

```typescript
const report = await collect(config).andThen(validate).andThen(analyze);
```

## Consequences

### Positive

- ✅ **No thrown exceptions** - process never crashes unexpectedly
- ✅ **Type-safe errors** - error handling is explicit and typed
- ✅ **Composable** - chain operations with andThen/map
- ✅ **Testable** - easy to test error paths
- ✅ **Functional** - works well with pure functions

### Negative

- ❌ **More verbose** - explicit error checks instead of try/catch
- ❌ **Different from Node.js conventions** - most async code uses exceptions
- ❌ **Learning curve** - developers need to understand Result pattern

### Mitigation

- Clear documentation with examples
- Consistent patterns across codebase
- TypeScript enforces error handling
- Tests demonstrate usage

## When NOT to Use Result

Some operations can still throw exceptions:

- **Third-party library errors:** Wrap in Result using try/catch
- **Logic errors:** Should be assertions or return invalid Result
- **Timeouts:** Return Err instead of throwing

## Alternatives Considered

1. **Using Promise rejections** - Same issues as exceptions
2. **Custom error types** - Works but less composable
3. **Optional chaining** - Doesn't distinguish between errors

neverthrow won because it's:

- Most explicit about error handling
- Best for composition
- Widely used in functional TypeScript communities
- Minimal runtime overhead

## Related Decisions

- [ADR-001: Clean Architecture](./ADR-001-Clean-Architecture.md)
- [ADR-003: Why inversify for DI container](./ADR-003.md)

## References

- [neverthrow GitHub](https://github.com/supermacro/neverthrow)
- [Rust Result type](https://doc.rust-lang.org/std/result/)
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/posts/recipe-part2/)

---

**Status:** ✅ ACCEPTED

This decision prevents silent failures and makes error handling type-safe throughout the application.
