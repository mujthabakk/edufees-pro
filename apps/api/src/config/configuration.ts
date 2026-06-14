export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsOrigins: string[];
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  storage: {
    driver: 'local' | 's3';
    localDir: string;
    publicBaseUrl: string;
    aws: {
      region: string;
      bucket: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
  messaging: {
    driver: 'console';
  };
  payment: {
    driver: 'mock';
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  storage: {
    driver: (process.env.STORAGE_DRIVER as 'local' | 's3') ?? 'local',
    localDir: process.env.STORAGE_LOCAL_DIR ?? './storage',
    publicBaseUrl:
      process.env.STORAGE_PUBLIC_BASE_URL ?? 'http://localhost:4000/files',
    aws: {
      region: process.env.AWS_REGION ?? 'ap-south-1',
      bucket: process.env.AWS_S3_BUCKET ?? '',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    },
  },
  messaging: {
    driver: 'console',
  },
  payment: {
    driver: 'mock',
  },
});
