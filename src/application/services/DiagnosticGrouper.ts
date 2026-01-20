import type { Diagnostic, DiagnosticIntegration } from '@core';

/**
 * Groups diagnostics for structured reporting
 * Single responsibility: organize diagnostics by source and file
 */
export class DiagnosticGrouper {
  public groupBySourceAndFile(
    diagnostics: readonly Diagnostic[]
  ): Map<DiagnosticIntegration, Map<string, Diagnostic[]>> {
    const grouped = new Map<DiagnosticIntegration, Map<string, Diagnostic[]>>();

    for (const diagnostic of diagnostics) {
      this.addDiagnosticToGroup(grouped, diagnostic);
    }

    return grouped;
  }

  private addDiagnosticToGroup(
    grouped: Map<DiagnosticIntegration, Map<string, Diagnostic[]>>,
    diagnostic: Diagnostic
  ): void {
    const fileMap = this.getOrCreateFileMap(grouped, diagnostic.source);
    const diagnosticList = this.getOrCreateDiagnosticList(fileMap, diagnostic.filePath);
    
    diagnosticList.push(diagnostic);
  }

  private getOrCreateFileMap(
    grouped: Map<DiagnosticIntegration, Map<string, Diagnostic[]>>,
    source: DiagnosticIntegration
  ): Map<string, Diagnostic[]> {
    let fileMap = grouped.get(source);
    
    if (fileMap === undefined) {
      fileMap = new Map<string, Diagnostic[]>();
      grouped.set(source, fileMap);
    }
    
    return fileMap;
  }

  private getOrCreateDiagnosticList(
    fileMap: Map<string, Diagnostic[]>,
    filePath: string
  ): Diagnostic[] {
    let diagnosticList = fileMap.get(filePath);
    
    if (diagnosticList === undefined) {
      diagnosticList = [];
      fileMap.set(filePath, diagnosticList);
    }
    
    return diagnosticList;
  }
}
