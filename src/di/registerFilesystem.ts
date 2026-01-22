/**
 * Filesystem services registration
 * @module di/registerFilesystem
 */

import { DirectoryService } from '../infrastructure/filesystem/DirectoryService.js';
import { FileWriter } from '../infrastructure/filesystem/FileWriter.js';
import { JsonWriter } from '../infrastructure/filesystem/JsonWriter.js';
import { NodeFileSystem } from '../infrastructure/filesystem/NodeFileSystem.js';
import { StreamWriter } from '../infrastructure/filesystem/StreamWriter.js';
import { StructuredReportWriter } from '../infrastructure/filesystem/StructuredReportWriter.js';

import { TOKENS } from './tokens.js';

import type { IFileSystem } from '../core/index.js';
import type { Container } from 'inversify';

export function registerFilesystem(container: Container): void {
	// Bind base path constant
	container.bind<string>(TOKENS.BASE_PATH).toConstantValue(process.cwd());

	// Core filesystem
	container.bind<IFileSystem>(TOKENS.FILE_SYSTEM).to(NodeFileSystem).inSingletonScope();

	// Filesystem services
	container.bind(TOKENS.DIRECTORY_SERVICE).to(DirectoryService).inSingletonScope();
	container.bind(TOKENS.JSON_WRITER).to(JsonWriter).inTransientScope();
	container.bind(TOKENS.STREAM_WRITER).to(StreamWriter).inTransientScope();
	container.bind(TOKENS.FILE_WRITER).to(FileWriter).inTransientScope();
	container.bind(TOKENS.STRUCTURED_REPORT_WRITER).to(StructuredReportWriter).inTransientScope();
}
