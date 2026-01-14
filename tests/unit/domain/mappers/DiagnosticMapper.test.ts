/**
 * Tests for DiagnosticMapper
 * @module tests/unit/domain/mappers/DiagnosticMapper
 */

import { describe, it, expect } from 'vitest';
import { DiagnosticMapper } from '../../../../src/domain/mappers/index.js';
import { createTestDiagnostics } from '../../../mocks/index.js';

describe('DiagnosticMapper', () => {
  describe('toDomain', () => {
    it('should convert raw diagnostic to domain model', () => {
      const rawDiag = createTestDiagnostics(1)[0];
      const mapped = DiagnosticMapper.toDomain(rawDiag);

      expect(mapped.id).toBe(rawDiag.id);
      expect(mapped.source).toBe(rawDiag.source);
      expect(mapped.filePath).toBe(rawDiag.filePath);
      expect(mapped.message).toBe(rawDiag.message);
    });

    it('should preserve all optional fields', () => {
      const rawDiag = {
        ...createTestDiagnostics(1)[0],
        detail: 'Additional details',
        fix: { description: 'Fix it', replacement: 'fixed' },
        endLine: 5,
        endColumn: 10,
      };

      const mapped = DiagnosticMapper.toDomain(rawDiag);

      expect(mapped.detail).toBe('Additional details');
      expect(mapped.fix?.description).toBe('Fix it');
      expect(mapped.endLine).toBe(5);
    });
  });

  describe('toPersistence', () => {
    it('should convert domain diagnostic to JSON-serializable format', () => {
      const diagnostic = createTestDiagnostics(1)[0];
      const json = DiagnosticMapper.toPersistence(diagnostic);

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('source');
      expect(json).toHaveProperty('filePath');
      expect(json).toHaveProperty('severity');
    });

    it('should serialize timestamp to ISO string', () => {
      const diagnostic = createTestDiagnostics(1)[0];
      const json = DiagnosticMapper.toPersistence(diagnostic);

      expect(typeof json.timestamp).toBe('string');
      expect(new Date(json.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('fromPersistence', () => {
    it('should reconstruct diagnostic from persisted JSON', () => {
      const original = createTestDiagnostics(1)[0];
      const json = DiagnosticMapper.toPersistence(original);
      const reconstructed = DiagnosticMapper.fromPersistence(json);

      expect(reconstructed.id).toBe(original.id);
      expect(reconstructed.source).toBe(original.source);
      expect(reconstructed.filePath).toBe(original.filePath);
      expect(reconstructed.timestamp.getTime()).toBe(original.timestamp.getTime());
    });
  });
});
