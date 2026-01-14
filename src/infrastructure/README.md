# Infrastructure Module

The **infrastructure** module implements the contracts defined in the core module using external libraries and concrete implementations.

## Contents

### `filesystem/` - File Operations
Implements `IFileSystem` contract using `fs-extra`:

- `NodeFileSystem` - Main file system interface
- `DirectoryService` - Directory operations
- `JsonWriter` - JSON file writing
- `StreamWriter` - Stream-based writing

### `logging/` - Logging
Implements `ILogger` contract using Pino:

- `PinoLogger` - Structured logging with Pino

### `formatting/` - Output Formatting
Implements `IFormatter` contract for different output formats:

- `ConsoleFormatter` - CLI output with colors/tables (chalk, ora, cli-table3)
- `JsonFormatter` - JSON output
- `TableFormatter` - ASCII table output

### `paths/` - Path Operations
Implements `IPathService` contract:

- `UpathService` - Cross-platform path handling using upath

### `security/` - Security & Validation
Security-related implementations:

- `RedactSanitizer` - Implements `ISanitizer` for sensitive data redaction
- `PathValidator` - Path security validation

## Key Principles

1. **Contract Implementation** - Implements interfaces from core
2. **External Library Wrapping** - Isolates external dependencies
3. **Dependency Injection** - All services injected, not hard-coded
4. **Single Responsibility** - One service per concern

## Usage Examples

### File System
```typescript
import { NodeFileSystem } from '@/infrastructure/filesystem';

const fs = new NodeFileSystem();

// Read file
const content = await fs.readFile('/path/to/file.ts');

// Write with parent directory creation
await fs.writeFile('/path/to/new/file.json', JSON.stringify(data));

// Write JSON
await fs.writeJson('/config.json', { key: 'value' });

// Ensure directory exists
await fs.ensureDir('/path/to/create');
```

### Logging
```typescript
import { PinoLogger } from '@/infrastructure/logging';

const logger = new PinoLogger();

logger.info('Starting analysis', { patterns: ['src/**'] });
logger.warn('Missing configuration', { field: 'timeout' });
logger.error('Collection failed', error, { source: 'eslint' });

// Create child logger with context
const childLogger = logger.child({ requestId: 'req-123' });
childLogger.info('Processing request');
```

### Formatting
```typescript
import { JsonFormatter, ConsoleFormatter } from '@/infrastructure/formatting';

// JSON output
const jsonFormatter = new JsonFormatter();
const json = jsonFormatter.format(diagnostics);

// Console output with colors
const consoleFormatter = new ConsoleFormatter();
const pretty = consoleFormatter.format(diagnostics);
```

### Path Operations
```typescript
import { UpathService } from '@/infrastructure/paths';

const pathService = new UpathService();

// Cross-platform normalization
const normalized = pathService.normalize('/path/to\\file.ts');

// Relative paths
const relative = pathService.relative('/root', '/root/src/file.ts');

// Joining paths
const joined = pathService.join('/src', 'domain', 'file.ts');
```

## Architecture

Infrastructure sits between Domain and External World:

```
┌──────────────────┐
│ APPLICATION      │
├──────────────────┤
│ DOMAIN           │ (needs ILogger, IFileSystem, etc.)
├──────────────────┤
│ INFRASTRUCTURE   │ ← You are here (implements contracts)
├──────────────────┤
│ CORE (contracts) │
└──────────────────┘
       ↓
  [External Libraries]
  fs-extra, pino, chalk, ora, cli-table3, upath
```

## External Dependencies

| Library | Purpose | Used In |
|---------|---------|----------|
| `fs-extra` | Enhanced file system | filesystem |
| `pino` | Structured logging | logging |
| `chalk` | Terminal colors | formatting |
| `ora` | Spinners/loaders | formatting |
| `cli-table3` | ASCII tables | formatting |
| `upath` | Cross-platform paths | paths |
| `@pinojs/redact` | Sensitive data redaction | security |

## Testing

Infrastructure should be tested with:
1. Mock implementations from `tests/mocks/`
2. Integration tests with real file system
3. Error case testing

```bash
# Run infrastructure tests
npm run test:unit -- tests/unit/infrastructure
```

## Swappable Implementations

One of the main benefits of the infrastructure layer is that implementations can be swapped:

### Example: Different Logger
```typescript
// Production
const logger: ILogger = new PinoLogger();

// Testing
const logger: ILogger = new MockLogger();

// Both implement the same interface
```

### Example: Different File System
```typescript
// Production (Node.js)
const fs: IFileSystem = new NodeFileSystem();

// Testing (In-memory)
const fs: IFileSystem = new MockFileSystem();

// Development (Virtual FS)
const fs: IFileSystem = new VirtualFileSystem();
```

## Adding New Infrastructure

To add a new implementation:

1. **Define contract in Core** - Create interface in `src/core/contracts/`
2. **Implement in Infrastructure** - Create service in appropriate directory
3. **Export from index** - Add to barrel exports
4. **Create tests** - Mock and integration tests
5. **Update documentation** - Add to README

Example: Adding a new storage type:

```typescript
// src/core/contracts/IStorageService.ts
export interface IStorageService {
  save(path: string, data: unknown): Promise<void>;
  load(path: string): Promise<unknown>;
}

// src/infrastructure/storage/S3Storage.ts
export class S3Storage implements IStorageService {
  // AWS SDK implementation
}

// src/infrastructure/storage/index.ts
export { S3Storage } from './S3Storage.js';
```

## Configuration

Infrastructure services may need configuration:

```typescript
interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  pretty?: boolean;
}

const logger = new PinoLogger(config);
```

## Performance Considerations

- **Logging:** Pino is fast, use child loggers for context
- **File System:** fs-extra is optimized, batch operations when possible
- **Formatting:** Cache formatters if used repeatedly

---

See [../../specs/architecture.md](../../specs/architecture.md) for architecture overview.
