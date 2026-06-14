import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { promises as fs } from 'fs';
import { dirname, join, resolve } from 'path';
import {
  PutObjectInput,
  StorageService,
} from './storage.interface';

/**
 * Local-disk implementation of StorageService for development.
 * Produces signed-style URLs (HMAC + expiry) that mirror the S3 contract so
 * swapping to the real S3 driver requires no caller changes.
 */
@Injectable()
export class LocalStorageService implements StorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly baseDir: string;
  private readonly publicBaseUrl: string;
  private readonly signingSecret: string;

  constructor(private readonly config: ConfigService) {
    this.baseDir = resolve(
      this.config.get<string>('storage.localDir') ?? './storage',
    );
    this.publicBaseUrl =
      this.config.get<string>('storage.publicBaseUrl') ??
      'http://localhost:4000/files';
    this.signingSecret =
      this.config.get<string>('jwt.accessSecret') ?? 'local-storage-secret';
  }

  async put(input: PutObjectInput): Promise<{ key: string }> {
    const fullPath = join(this.baseDir, input.key);
    await fs.mkdir(dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, input.body);
    this.logger.debug(`Stored object ${input.key}`);
    return { key: input.key };
  }

  async getSignedUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const signature = createHmac('sha256', this.signingSecret)
      .update(`${key}:${expires}`)
      .digest('hex');
    const encodedKey = encodeURIComponent(key);
    return `${this.publicBaseUrl}/${encodedKey}?expires=${expires}&signature=${signature}`;
  }

  async remove(key: string): Promise<void> {
    try {
      await fs.unlink(join(this.baseDir, key));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }
    }
  }
}
