/**
 * Path service contract
 * @module core/contracts/IPathService
 */

export interface IPathService {
	normalize(path: string): string;
	join(...segments: string[]): string;
	dirname(path: string): string;
	basename(path: string, ext?: string): string;
	extname(path: string): string;
	isAbsolute(path: string): boolean;
	relative(from: string, to: string): string;
	resolve(...segments: string[]): string;
}
