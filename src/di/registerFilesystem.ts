/**
 * Filesystem services registration
 * @module di/registerFilesystem
 */

import type { Container } from 'inversify';

import { TOKENS } from './tokens.js';
import { NodeFileSystem } from '../infrastructure/filesystem/NodeFileSystem.js';
import { DirectoryService } from '../infrastructure/filesystem/DirectoryService.js';
import { JsonWriter } from '../infrastructure/filesystem/JsonWriter.js';
import { StreamWriter } from '../infrastructure/filesystem/StreamWriter.js';
import { FileWriter } from '../infrastructure/filesystem/FileWriter.js';
import { StructuredReportWriter } from '../infrastructure/filesystem/StructuredReportWriter.js';
import type { IFileSystem } from '../core/index.js';

export function registerFilesystem(container: Container): void {
  container.bind<IFileSystem>(TOKENS.FILE_SYSTEM).to(NodeFileSystem).inSingletonScope();

  container
    .bind(TOKENS.DIRECTORY_SERVICE)
    .toDynamicValue(() => new DirectoryService(container.get(TOKENS.FILE_SYSTEM)))
    .inSingletonScope();

  container
    .bind(TOKENS.JSON_WRITER)
    .toDynamicValue(() => new JsonWriter(container.get(TOKENS.FILE_SYSTEM), process.cwd()))
    .inTransientScope();

  container
    .bind(TOKENS.STREAM_WRITER)
    .toDynamicValue(() => new StreamWriter(container.get(TOKENS.FILE_SYSTEM), process.cwd()))
    .inTransientScope();

  container
    .bind(TOKENS.FILE_WRITER)
    .toDynamicValue(() => new FileWriter(process.cwd()))
    .inTransientScope();

  container
    .bind(TOKENS.STRUCTURED_REPORT_WRITER)
    .toDynamicValue(() =>
      new StructuredReportWriter(
        container.get(TOKENS.FILE_SYSTEM),
        container.get(TOKENS.PATH_SERVICE),
        container.get(TOKENS.DIRECTORY_SERVICE),
        container.get(TOKENS.LOGGER)
      )
    )
    .inTransientScope();
}
