import type { Diagnostic } from './Diagnostic.js';
import type { DiagnosticSeverity } from './DiagnosticSeverity.js';
import type { DiagnosticIntegration } from './DiagnosticIntegration.js';

/** Factory function to create a Diagnostic */
export function createDiagnostic(
  source: DiagnosticIntegration,
  filePath: string,
  line: number,
  column: number,
  severity: DiagnosticSeverity,
  code: string,
  message: string,
  options?: Partial<Omit<Diagnostic, 'id' | 'source' | 'filePath' | 'line' | 'column' | 'severity' | 'code' | 'message' | 'timestamp'>>
): Diagnostic {
  const id = `${source}:${filePath}:${String(line)}:${String(column)}:${code}`;

  return {
    id,
    source,
    filePath,
    line,
    column,
    severity,
    code,
    message,
    timestamp: new Date(),
    ...options,
  };
}
