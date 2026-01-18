/**
 * DiagnosticSeverity value object
 * Represents severity level of a diagnostic issue
 * @module core/types/DiagnosticSeverity
 */

/**
 * Valid severity levels
 */
const SEVERITY_LEVELS = ['error', 'warning', 'info', 'note'] as const;
type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

/**
 * Severity hierarchy for comparison
 */
const SEVERITY_HIERARCHY: Record<SeverityLevel, number> = {
  error: 3,
  warning: 2,
  info: 1,
  note: 0,
} as const;

/**
 * DiagnosticSeverity value object
 * Immutable representation of diagnostic severity level
 */
export class DiagnosticSeverity {
  private readonly _value: SeverityLevel;

  private constructor(value: SeverityLevel) {
    this._value = value;
  }

  /**
   * Create DiagnosticSeverity from string
   * @param value Severity level string
   * @returns DiagnosticSeverity instance
   * @throws Error if value is invalid
   */
  public static from(value: string): DiagnosticSeverity {
    if (!this.isValid(value)) {
      throw new Error(`Invalid severity level: ${value}. Must be one of: ${SEVERITY_LEVELS.join(', ')}`);
    }
    return new DiagnosticSeverity(value as SeverityLevel);
  }

  /**
   * Check if value is valid severity level
   * @param value Value to check
   * @returns True if valid
   */
  public static isValid(value: unknown): value is SeverityLevel {
    return typeof value === 'string' && (SEVERITY_LEVELS as readonly string[]).includes(value);
  }

  /**
   * Create ERROR severity
   */
  public static error(): DiagnosticSeverity {
    return new DiagnosticSeverity('error');
  }

  /**
   * Create WARNING severity
   */
  public static warning(): DiagnosticSeverity {
    return new DiagnosticSeverity('warning');
  }

  /**
   * Create INFO severity
   */
  public static info(): DiagnosticSeverity {
    return new DiagnosticSeverity('info');
  }

  /**
   * Create NOTE severity
   */
  public static note(): DiagnosticSeverity {
    return new DiagnosticSeverity('note');
  }

  /**
   * Get string value
   */
  public get value(): SeverityLevel {
    return this._value;
  }

  /**
   * Compare severity levels
   * @param other Other severity to compare
   * @returns Negative if this < other, 0 if equal, positive if this > other
   */
  public compareTo(other: DiagnosticSeverity): number {
    return SEVERITY_HIERARCHY[this._value] - SEVERITY_HIERARCHY[other._value];
  }

  /**
   * Check if this severity is more severe than other
   * @param other Other severity
   */
  public isMoreSevereThan(other: DiagnosticSeverity): boolean {
    return this.compareTo(other) > 0;
  }

  /**
   * Check if this severity equals other
   * @param other Other severity
   */
  public equals(other: DiagnosticSeverity): boolean {
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
