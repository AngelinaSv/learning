import { randomUUID } from 'crypto';

export default () => ({
  port: parseInt(process.env.PORT || '3009', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'app',
    synchronize: process.env.DB_SYNCHRONIZE !== 'false',
  },
  jwt: {
    secret: process.env.JWT_SECRET || randomUUID().toString(),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  storage: {
    path: process.env.STORAGE_PATH || 'storage/files',
  },
});
