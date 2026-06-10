const DEFAULT_ALLOWED_ORIGINS = [
  'http://31.131.18.217:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

export function getAllowedCorsOrigins() {
  const envOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
    : [];

  return Array.from(
    new Set([...envOrigins, ...DEFAULT_ALLOWED_ORIGINS].filter(Boolean)),
  );
}
