/**
 * Diagnostic Grouper
 * Groups diagnostics by source and file
 * @module application/services/DiagnosticGrouper
 */

import type { Diagnostic, DiagnosticSource } from '@core';

/**
 * Groups diagnostics for structured reporting
 * Single responsibility: organize diagnostics by source and file
 */
export class DiagnosticGrouper {
  /**
   * Group diagnostics by source and file
   * @param diagnostics All diagnostics
   * @returns Map of source to file map
   */
  public groupBySourceAndFile(
    diagnostics: readonly Diagnostic[]
  ): Map<DiagnosticSource, Map<string, Diagnostic[]>> {
    const grouped = new Map<DiagnosticSource, Map<string, Diagnostic[]>>();

    for (const diagnostic of diagnostics) {
      this.addDiagnosticToGroup(grouped, diagnostic);
    }

    return grouped;
  }

  /**
   * Add diagnostic to grouped structure
   * @param grouped Grouped map
   * @param diagnostic Diagnostic to add
   */
  private addDiagnosticToGroup(
    grouped: Map<DiagnosticSource, Map<string, Diagnostic[]>>,
    diagnostic: Diagnostic
  ): void {
    const fileMap = this.getOrCreateFileMap(grouped, diagnostic.source);
    const diagnosticList = this.getOrCreateDiagnosticList(fileMap, diagnostic.filePath);
    
    diagnosticList.push(diagnostic);
  }

  /**
   * Get or create file map for source
   * @param grouped Grouped map
   * @param source Diagnostic source
   * @returns File map
   */
  private getOrCreateFileMap(
    grouped: Map<DiagnosticSource, Map<string, Diagnostic[]>>,
    source: DiagnosticSource
  ): Map<string, Diagnostic[]> {
    let fileMap = grouped.get(source);
    
    if (fileMap === undefined) {
      fileMap = new Map<string, Diagnostic[]>();
      grouped.set(source, fileMap);
    }
    
    return fileMap;
  }

  /**
   * Get or create diagnostic list for file
   * @param fileMap File map
   * @param filePath File path
   * @returns Diagnostic list
   */
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
