import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  PutObjectInput,
  StorageService,
} from './storage.interface';

/**
 * AWS S3 (SDK v3) implementation. Private bucket + presigned URLs.
 * Selected when STORAGE_DRIVER=s3.
 */
@Injectable()
export class S3StorageService implements StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const region = this.config.get<string>('storage.aws.region') ?? 'ap-south-1';
    this.bucket = this.config.get<string>('storage.aws.bucket') ?? '';
    this.client = new S3Client({
      region,
      credentials: {
        accessKeyId: this.config.get<string>('storage.aws.accessKeyId') ?? '',
        secretAccessKey:
          this.config.get<string>('storage.aws.secretAccessKey') ?? '',
      },
    });
  }

  async put(input: PutObjectInput): Promise<{ key: string }> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      }),
    );
    return { key: input.key };
  }

  async getSignedUrl(key: string, expiresInSeconds = 900): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }

  async remove(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
