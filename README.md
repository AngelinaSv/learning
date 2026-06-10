# Internship Casino Platform

NestJS API with Prisma, PostgreSQL, Redis, Swagger, REST endpoints, and WebSocket-based game/chat modules.

## Project Scope

This project was designed primarily as a backend-focused learning project.

The main goal was to design and implement a production-inspired backend architecture using NestJS, PostgreSQL, Redis, Docker, REST APIs, and WebSockets.

The frontend application serves as a lightweight demonstration client for interacting with backend functionality such as authentication, wallets, roulette, video slots, fighting, and chat modules.

## Tech Stack

### Backend Stack

- NestJS
- Prisma
- PostgreSQL 16
- Redis 7
- Swagger/OpenAPI
- Socket.IO
- Docker

### Frontend Stack

- React
- Vite
- TypeScript
- TailwindCSS

## Project Structure

```text
app/
├── prisma/              # Prisma schema, migrations, and seeds
├── src/
│   ├── common/          # Shared guards, decorators, DTOs, websocket helpers
│   ├── core/
│   │   ├── redis/      # Redis provider
│   │   ├── prisma/     # Prisma service
│   ├── modules/
│   │   ├── addresses/   # Address CRUD
│   │   ├── auth/        # Sign-up, sign-in, sign-out, JWT auth
│   │   ├── chat/        # Socket.IO chat and moderation
│   │   ├── fighting/    # Fighting profiles, matchmaking, duels, battles
│   │   ├── profiles/    # User profile service
│   │   ├── leaderboard/ # Profit-based player leaderboard
│   │   ├── roulette/    # Roulette sessions, spins, history, rating
│   │   ├── sessions/    # Session module
│   │   ├── users/       # User and admin user APIs
│   │   ├── video-slot/  # Video slot sessions, spins, RTP simulation
│   │   └── wallet/      # Wallets, balance operations, transactions
│   ├── app.module.ts
│   └── main.ts
├── Dockerfile
└── package.json
```

## Development With Docker

The local development stack is defined in `docker-compose.dev.yml` and uses `app/.env.development`.

Services:

- `app`: NestJS app in watch mode on `http://localhost:3009`
- `postgres`: PostgreSQL exposed on `localhost:5433`, container host `postgres:5432`
- `redis`: Redis exposed on `localhost:6379`, container host `redis:6379`

The `app` service bind-mounts `./app` into the container so code changes are picked up without rebuilding. Container `node_modules` are kept in a named Docker volume so the bind mount does not overwrite installed dependencies.

### Required Environment

Create or update `app/.env.development`:

```env
NODE_ENV=development
PORT=3009

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=app

DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=app

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app

ACCESS_TOKEN_SECRET=development_access_token_secret
REFRESH_TOKEN_SECRET=development_refresh_token_secret
TOKEN_EXPIRES_IN=3600s

CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true
```

`DATABASE_URL` uses `postgres:5432` because Prisma runs inside the Docker network when using the app container.

### Start Development Stack

From the repository root:

```powershell
npm run docker:dev:up
```

Equivalent raw Docker command:

```powershell
docker compose --env-file app/.env.development -f docker-compose.dev.yml up --build
```

The API will be available at:

- API base URL: `http://localhost:3009/api/v1`
- Swagger docs: `http://localhost:3009/api`

### Stop Containers

```powershell
npm run docker:dev:down
```

### View Logs

```powershell
npm run docker:dev:logs
```

### Rebuild Dev Image

```powershell
npm run docker:dev:build
```

## Prisma Commands In Docker

Run Prisma commands inside the `app` container so Prisma receives the Docker development environment variables from `app/.env.development`.

Apply migrations:

```powershell
docker compose --env-file app/.env.development -f docker-compose.dev.yml exec app npm run prisma:deploy
```

Generate Prisma client:

```powershell
docker compose --env-file app/.env.development -f docker-compose.dev.yml exec app npm run prisma:generate
```

Seed database:

```powershell
docker compose --env-file app/.env.development -f docker-compose.dev.yml exec app npm run prisma:seed
```

If you run Prisma from host PowerShell, `env_file` does not apply to that host process. You would need a host-specific `DATABASE_URL`, usually using `localhost:5433` instead of `postgres:5432`.

## API Features

All REST routes use the global prefix `/api/v1`.

| Module | Feature Area | Main Routes |
| --- | --- | --- |
| Auth | Registration, login, logout, JWT auth | `POST /auth/sign-up`, `POST /auth/sign-in`, `POST /auth/sign-out` |
| Users | Current user profile management | `GET /users/me`, `PATCH /users/me`, `DELETE /users/me` |
| Admin | Admin user management and game tools | `GET /admin/users`, `GET /admin/users/:id`, `PATCH /admin/users/:id`, `DELETE /admin/users/:id`, `POST /admin/video-slots/simulate-rtp` |
| Addresses | User address CRUD | `POST /addresses`, `GET /addresses`, `GET /addresses/:id`, `PATCH /addresses/:id`, `DELETE /addresses/:id` |
| Wallets | Wallet balance, deposits, withdrawals | `GET /wallet/balance`, `POST /wallet/deposit`, `POST /wallet/withdraw` |
| Transactions | Wallet transaction history | `GET /wallet/transactions/history` |
| Roulette | Roulette sessions, spins, history, rating | `POST /roulette/sessions`, `GET /roulette/sessions/current`, `DELETE /roulette/sessions/:id`, `POST /roulette/spin`, `GET /roulette/history`, `GET /roulette/rating` |
| Video Slots | Video slot sessions, spins, history | `POST /video-slots/sessions`, `GET /video-slots/sessions/current`, `POST /video-slots/sessions/:id/spins`, `DELETE /video-slots/sessions/:id`, `GET /video-slots/history` |
| Fighting | Fighting profiles, heroes, duel requests, battles | `GET /fighting/profile/me`, `GET /fighting/heroes`, `PATCH /fighting/profile/me/hero`, `POST /fighting/duel-requests`, `GET /fighting/duel-requests`, `POST /fighting/duel-requests/:id/accept`, `GET /fighting/battles/:id` |
| Chat | Chat gateway health/status | `GET /chat-system/status` |

Swagger groups endpoints with tags such as `Auth`, `Users`, `Wallets`, `Transactions`, `Roulette`, `Video Slots`, `Fighting`, `Chat`, and `Admin`.

## WebSocket Chat

The chat module exposes Socket.IO chat functionality and uses Redis-backed infrastructure for real-time features.

### Chat Moderation

Chat includes a lightweight moderation layer that blocks obvious advertising, referral links, spam invites, and scam-style messages before they are saved or broadcast.

When a message is blocked, it is not broadcast to the room. Only the sender receives:

```text
chat:message:blocked
```

Example blocked payload:

```json
{
  "reason": "Message contains advertising or forbidden content",
  "sanitizedMessage": "Join my *** group"
}
```

Examples that should be blocked include messages containing values such as `telegram`, `t.me`, `discord.gg`, `whatsapp`, `casinohack`, and `free money`.

## Scripts

Root Docker scripts:

| Command | Description |
| --- | --- |
| `npm run docker:dev:up` | Start the development Docker stack |
| `npm run docker:dev:down` | Stop the development Docker stack |
| `npm run docker:dev:logs` | Follow app, Postgres, and Redis logs |
| `npm run docker:dev:build` | Build the development app image |
| `npm run docker:prod:up` | Start the production Docker stack |
| `npm run docker:prod:down` | Stop the production Docker stack |
| `npm run docker:prod:logs` | Follow production logs |

App scripts from `app/package.json`:

| Command | Description |
| --- | --- |
| `npm run start:dev` | Start NestJS in watch mode |
| `npm run build` | Compile the NestJS app |
| `npm run prisma:deploy` | Apply Prisma migrations |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:seed` | Seed the database |
| `npm run lint` | Run ESLint with fixes |
| `npm run test` | Run unit tests |

## Common URLs

- API: `http://localhost:3009/api/v1`
- Swagger: `http://localhost:3009/api`
- Chat status: `http://localhost:3009/api/v1/chat-system/status`
- PostgreSQL from host: `localhost:5433`
- Redis from host: `localhost:6379`

## Production Compose

Production Docker configuration is kept separate from the development stack. Use `docker-compose.prod.yml` or the existing production scripts when running production containers.
