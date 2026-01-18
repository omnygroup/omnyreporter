/**
 * DiagnosticSource value object
 * Represents the tool that generated a diagnostic
 * @module core/types/DiagnosticSource
 */

/**
 * Valid diagnostic sources
 */
const SOURCE_TOOLS = ['eslint', 'typescript', 'vitest'] as const;
type SourceTool = (typeof SOURCE_TOOLS)[number];

/**
 * DiagnosticSource value object
 * Immutable representation of diagnostic source tool
 */
export class DiagnosticSource {
  private readonly _value: SourceTool;

  private constructor(value: SourceTool) {
    this._value = value;
  }

  /**
   * Create DiagnosticSource from string
   * @param value Source tool name
   * @returns DiagnosticSource instance
   * @throws Error if value is invalid
   */
  public static from(value: string): DiagnosticSource {
    if (!this.isValid(value)) {
      throw new Error(`Invalid diagnostic source: ${value}. Must be one of: ${SOURCE_TOOLS.join(', ')}`);
    }
    return new DiagnosticSource(value as SourceTool);
  }

  /**
   * Check if value is valid source tool
   * @param value Value to check
   * @returns True if valid
   */
  public static isValid(value: unknown): value is SourceTool {
    return typeof value === 'string' && (SOURCE_TOOLS as readonly string[]).includes(value);
  }

  /**
   * Create ESLINT source
   */
  public static eslint(): DiagnosticSource {
    return new DiagnosticSource('eslint');
  }

  /**
   * Create TYPESCRIPT source
   */
  public static typescript(): DiagnosticSource {
    return new DiagnosticSource('typescript');
  }

  /**
   * Create VITEST source
   */
  public static vitest(): DiagnosticSource {
    return new DiagnosticSource('vitest');
  }

  /**
   * Get all valid source tools
   */
  public static all(): readonly SourceTool[] {
    return SOURCE_TOOLS;
  }

  /**
   * Get string value
   */
  public get value(): SourceTool {
    return this._value;
  }

  /**
   * Check if this source equals other
   * @param other Other source
   */
  public equals(other: DiagnosticSource): boolean {
    return this._value === other._value;
  }

  /**
   * String representation
   */
  public toString(): string {
    return this._value;
  }

  /**
   * JSON representation
   */
  public toJSON(): string {
    return this._value;
  }
}
