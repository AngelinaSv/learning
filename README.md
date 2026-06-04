## Project Overview

A RESTful backend service built with NestJS, PostgreSQL, and Prisma ORM.

The system includes:
- Authentication with JWT (access/refresh tokens)
- User and profile management
- Wallet system with transactions
- Roulette game logic
- Global WebSocket chat
- Lightweight chat moderation for advertising, referral links, spam invites, and obvious scam messages
- Swagger API documentation

The project is containerized using Docker and supports migration-based database schema management.

## Project Structure

```
app/
├── prisma/              # Database schema and migrations
├── src/
│   ├── common/          # Shared utilities, guards, decorators
│   ├── modules/
│   │   ├── admin/       # Admin operations (user management)
│   │   ├── addresses/   # User addresses CRUD
│   │   ├── auth/        # Authentication (sign-up, sign-in, sign-out)
│   │   ├── profiles/    # User profiles
│   │   ├── roulette/    # Roulette game logic
│   │   ├── sessions/    # Game session management
│   │   ├── users/       # User management
│   │   ├── wallet/      # Wallet, deposits, transactions
│   │   └── prisma/      # Prisma service
│   ├── app.module.ts
│   └── main.ts
└── package.json
```

## Setup

### Prerequisites
- Node.js 22+
- Docker & Docker Compose

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### Running with Docker

```bash
# Start all services (app + database)
docker compose up -d

# View logs
docker compose logs -f
```

### Database Migrations

```bash
# Run migrations (in container)
docker exec internship-app-1 npx prisma migrate dev

# Or create new migration
docker exec internship-app-1 npx prisma migrate dev --name migration_name
```

### Running Locally

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

## API Documentation

**Swagger UI:** http://localhost:3009/api

## WebSocket Chat

The chat module exposes a Socket.IO namespace for global casino-style chat.
Authenticated clients are joined to the global chat room when they connect.

### Chat Moderation

Chat includes a lightweight anti-spam moderation layer that blocks obvious advertising, referral links, spam invites, and scam-style messages before they are saved or broadcast.

This is intentionally simple and uses a local forbidden-pattern list with case-insensitive string matching. It is meant as a demo moderation layer; a production system would likely replace it with a dedicated moderation service.

Currently blocked examples include:
- `telegram`
- `t.me`
- `discord.gg`
- `whatsapp`
- `casinohack`
- `free money`

When a message is blocked, it is not broadcast to the room. Only the sender receives:

```text
chat:message:blocked
```

Payload:

```json
{
  "reason": "Message contains advertising or forbidden content",
  "sanitizedMessage": "Join my *** group"
}
```

Manual test examples:
- `Join my Telegram group` is blocked
- `visit t.me/example` is blocked
- `FREE MONEY here` is blocked
- Normal chat messages continue to use the existing `roomMessage` flow

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start production build |
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Compile TypeScript |
| `npm run prisma:migrate` | Run Prisma migrations |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:seed` | Seed database |

## TODOs

### High Priority

### Medium Priority

### Low Priority
- [ ] `admin.service.ts:28,35` - Add logs, history, notifications for admin operations
