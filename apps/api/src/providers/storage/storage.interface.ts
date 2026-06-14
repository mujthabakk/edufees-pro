export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');

export interface PutObjectInput {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
}

export interface StorageService {
  /** Stores an object and returns its canonical key. */
  put(input: PutObjectInput): Promise<{ key: string }>;
  /** Returns a time-limited URL to read a private object. */
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  /** Removes an object if it exists. */
  remove(key: string): Promise<void>;
}
