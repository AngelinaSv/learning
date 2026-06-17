import { ConfigService } from '@nestjs/config';

export function getAllowedCorsOrigins(configService: ConfigService): string[] {
  const frontendUrl = configService.getOrThrow<string>('FRONTEND_URL');

  const envOrigins = frontendUrl.split(',').map((origin) => origin.trim());

  if (configService.get('NODE_ENV') === 'production') {
    return envOrigins;
  }

  return [
    ...envOrigins,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
}
