import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export class VitestExecutor {
  constructor(options = {}) {
    this._defaultTimeout = options.timeout || 10 * 60 * 1000;
    this._tempOutputFile = options.tempOutputFile || 'test-results-temp.json';

    // Run in the caller's working directory
    this._projectRoot = process.cwd();
  }

  async execute() {
    const outputFilePath = path.join(this._projectRoot, this._tempOutputFile);

    this._cleanupTempFile(outputFilePath);

    console.log('🧪 Running Vitest tests with JSON reporter...\n');

    const startTime = Date.now();

    try {
      const result = await this._spawnVitest(outputFilePath);

      const duration = Date.now() - startTime;
      console.log(`\n⏱️  Test execution completed in ${duration}ms`);

      return result;
    } catch (error) {
      this._cleanupTempFile(outputFilePath);
      throw error;
    }
  }

  _spawnVitest(outputFilePath) {
    return new Promise((resolve, reject) => {
      const args = [
        'run',
        '--reporter=json',
        `--outputFile=${this._tempOutputFile}`,
        '--reporter=default',
      ];

      const vitestProcess = spawn('npx', ['vitest', ...args], {
        cwd: this._projectRoot,
        shell: true,
        env: { ...process.env, CI: 'true' },
      });

      let stdout = '';
      let stderr = '';
      let timeoutHandle = null;

      if (this._defaultTimeout > 0) {
        timeoutHandle = setTimeout(() => {
          console.warn(`\n⏱️  Warning: Test execution exceeded ${this._defaultTimeout / 1000}s timeout`);
          vitestProcess.kill('SIGTERM');
          setTimeout(() => {
            if (!vitestProcess.killed) {
              vitestProcess.kill('SIGKILL');
            }
          }, 5000);
        }, this._defaultTimeout);
      }

      vitestProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output);
      });

      vitestProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        process.stderr.write(output);
      });

      vitestProcess.on('error', (error) => {
        if (timeoutHandle) {
          clearTimeout(timeoutHandle);
        }

        if (error.code === 'ENOENT') {
          reject(new Error('❌ Vitest not found. Please install it: npm install --save-dev vitest'));
        } else {
          reject(new Error(`❌ Failed to execute Vitest: ${error.message}`));
        }
      });

      vitestProcess.on('close', (exitCode) => {
        if (timeoutHandle) clearTimeout(timeoutHandle);

        if (!fs.existsSync(outputFilePath)) {
          reject(new Error(`❌ Vitest did not create output file at ${outputFilePath}. Check stderr for errors.`));
          return;
        }

        try {
          fs.readFileSync(outputFilePath, 'utf8');
        } catch (readError) {
          reject(new Error(`❌ Failed to read output file: ${readError.message}`));
          return;
        }

        resolve({ outputFilePath, exitCode: exitCode || 0, stdout, stderr });
      });
    });
  }

  _cleanupTempFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn(`⚠️  Warning: Could not clean up temp file: ${error.message}`);
    }
  }

  cleanup() {
    const outputFilePath = path.join(this._projectRoot, this._tempOutputFile);
    this._cleanupTempFile(outputFilePath);
  }
}
