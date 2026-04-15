# Internship - File Storage Service

NestJS-based file storage service with authentication and quota management.

## Tech Stack

- NestJS
- TypeScript
- Swagger (API docs at `/api`)
- Docker / Docker Compose

## Setup

### Local Development

```bash
cd app
npm install
npm run start:dev
```

Server runs at `http://localhost:3009`

### Docker

```bash
docker-compose up -d --build
```

Server runs at `http://localhost:3009`

## API Documentation

Swagger documentation available at `http://localhost:3009/api`

### Storage Structure

```
storage/
  files/
    {userId}/
      - user files
  users.json
    - user data
```

## Project Structure

```
app/
├── src/
│   ├── auth/           # Authentication module
│   ├── file/           # File management module
│   ├── storage/        # Storage service
│   ├── user/           # User module
│   └── main.ts         # Entry point
├── storage/            # File storage
├── Dockerfile
└── docker-compose.yml
```

## Error Responses

All errors return JSON:
```json
{
  "message": "Error description",
  "code": "ERROR_CODE"
}
```
