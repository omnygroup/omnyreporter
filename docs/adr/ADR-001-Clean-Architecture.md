# ADR-001: Why Clean Architecture

**Status:** Accepted  
**Date:** January 2026  
**Author:** OmnyReporter Team  

## Context

OmnyReporter needed a scalable architecture that could:
1. Support multiple diagnostic sources (ESLint, TypeScript, Vitest, etc.)
2. Be testable without external dependencies
3. Allow easy addition of new reporters
4. Maintain consistency across the codebase

The original v1 architecture was monolithic with tight coupling between CLI, business logic, and external tools.

## Decision

We adopted **Clean Architecture** with 7 distinct layers:

```
VIEW (CLI) → APPLICATION → REPORTERS → DOMAIN → INFRASTRUCTURE → CORE → BUILD
```

Each layer has clear boundaries and dependencies only point inward (toward CORE).

## Layers Explained

### 1. CORE (Foundation)
- **Types:** All TypeScript interfaces and types
- **Contracts:** 8 core interfaces (ILogger, IFileSystem, IDiagnosticSource, etc.)
- **Abstractions:** Base classes with Template Method pattern
- **Errors:** Typed error classes
- **Zero external dependencies** - all other layers depend on this

### 2. INFRASTRUCTURE (Implementations)
- Implements CORE contracts using external libraries
- Examples: PinoLogger, NodeFileSystem, ConsoleFormatter
- Can be swapped without affecting other layers

### 3. DOMAIN (Business Logic)
- Pure business logic independent of frameworks
- Examples: DiagnosticAnalytics, ConfigValidator, DiagnosticAggregator
- Uses contracts from CORE, not aware of HTTP/UI/DB

### 4. APPLICATION (Orchestration)
- Use-cases that coordinate DOMAIN + INFRASTRUCTURE
- Examples: CollectDiagnosticsUseCase, GenerateReportUseCase
- No direct knowledge of UI or external tools

### 5. REPORTERS (Adapters)
- Adapts external tools to core contracts
- Each reporter is isolated (ESLint, TypeScript, Vitest)
- Implements IDiagnosticSource interface

### 6. APPLICATION (CLI)
- User-facing command-line interface
- Minimal logic - delegates to use-cases
- Uses yargs for argument parsing

### 7. VIEW (Presentation)
- Formatting for different output types
- Implements IFormatter interface
- Examples: JsonFormatter, TableFormatter, ConsoleFormatter

## Consequences

### Positive
- ✅ **Testability:** Easy to mock dependencies via interfaces
- ✅ **Scalability:** New reporters can be added without touching existing code
- ✅ **Maintainability:** Clear separation of concerns
- ✅ **Type Safety:** Strict TypeScript with 100% type coverage
- ✅ **Flexibility:** Swap implementations (e.g., different logger) without code changes
- ✅ **Independence:** Domain logic has zero external dependencies

### Negative
- ❌ **More files:** 120+ files vs monolithic structure
- ❌ **Initial overhead:** More boilerplate for simple features
- ❌ **Learning curve:** Developers need to understand layering

### Mitigation
- Clear documentation and examples
- Comprehensive test coverage (70-80%)
- CI/CD checks for architecture violations
- Code reviews focusing on layer boundaries

## Related Decisions

- [ADR-002: Why neverthrow for Result types](./ADR-002.md)
- [ADR-003: Why inversify for DI container](./ADR-003.md)

## References

- Clean Architecture by Robert C. Martin
- TypeScript strict mode guidelines
- SOLID principles

---

**Status:** ✅ ACCEPTED

This architecture decision enables OmnyReporter to scale from a CLI tool to a production-grade platform.
