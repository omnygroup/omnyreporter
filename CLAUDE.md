# Claude Code Instructions

## Project Overview
OmnyReporter - CLI tool for aggregating and reporting diagnostics from ESLint, TypeScript, and Vitest.

- **Language**: TypeScript (ES Modules)
- **Build**: Vite
- **Testing**: Vitest
- **DI**: Inversify
- **Error handling**: neverthrow (Result type)

## Autonomous Operations (ALLOWED without asking)

### Safe to run automatically:
- `npm run build` - build the project
- `npm run test` - run all tests
- `npm run test:unit` - run unit tests
- `npm run test:watch` - run tests in watch mode
- `npm run lint` - check code style
- `npm run lint:fix` - auto-fix lint issues
- `npm run report:*` - run reporters
- `git status`, `git diff`, `git log` - read-only git commands
- Reading any files in the project
- Editing files in `src/`, `tests/`, `docs/`, `plans/`

### File operations:
- Create/edit test files in `tests/`
- Create/edit source files in `src/`
- Update configuration files (`tsconfig.json`, `vite.config.ts`, etc.)

## Restricted Operations (ASK before executing)

### Always ask before:
- `git push`, `git commit` - any write git operations
- `npm install`, `npm uninstall` - modifying dependencies
- Deleting files
- Creating files outside `src/`, `tests/`, `docs/`
- Running commands with `sudo`
- Accessing files outside this project directory
- Any network requests to external APIs
- Modifying `.env` files or files with secrets

## Code Style

- Use `neverthrow` Result type for error handling (no throwing exceptions)
- Use Inversify for dependency injection
- Prefer functional style over OOP where appropriate
- Use Zod for validation
- Keep files small and focused
- Write unit tests for new functionality

## Project Structure

```
src/
  reporters/     # Output formatters (console, markdown, etc.)
  services/      # Business logic
  cli/           # CLI commands
  types/         # TypeScript types
  utils/         # Helper functions
tests/
  unit/          # Unit tests
  integration/   # Integration tests
docs/            # Documentation
plans/           # Implementation plans
```

## Testing Workflow

Before completing any code changes:
1. Run `npm run build` to ensure compilation succeeds
2. Run `npm run test` to verify all tests pass
3. Run `npm run lint` to check code style

## Common Tasks

### Adding a new reporter
1. Create file in `src/reporters/`
2. Implement reporter interface
3. Register in DI container
4. Add tests in `tests/unit/reporters/`

### Adding a new CLI command
1. Create command in `src/cli/`
2. Register in main CLI entry point
3. Add integration tests

## Notes for Claude

- This project uses strict TypeScript - ensure all types are correct
- Prefer editing existing files over creating new ones
- Run tests after any code changes
- Use TodoWrite tool for multi-step tasks
- When unsure about architecture, check existing patterns in `src/`
