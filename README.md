# Internship Casino Platform

## Project Overview

Full-stack casino-style learning project with a NestJS backend and React frontend.

The application includes authentication, wallets, roulette, video slots, realtime chat, admin user management, leaderboards, and a richer `fighting` module with heroes, profiles, duel requests, matchmaking, and websocket battles.

## Live Demo Links

- Frontend: <http://31.131.18.217:3000>
- Swagger API docs: <http://31.131.18.217:3009/api>

## Project Scope

This project is primarily backend-focused.

The main goal was to design a production-inspired backend architecture with NestJS, PostgreSQL, Prisma, Redis, REST APIs, WebSockets, JWT authentication, Swagger documentation, and Docker-based deployment. The frontend is a lightweight client for demonstrating and testing the backend features.

## Tech Stack

Backend:

- NestJS
- Prisma
- PostgreSQL
- Redis
- Socket.IO
- Swagger/OpenAPI
- Docker

Frontend:

- React
- Vite
- TypeScript
- Tailwind CSS
- Socket.IO Client

## Main Features / Modules

- `auth`: user registration, login, logout, JWT auth.
- `users`: current user profile and admin user management.
- `wallet`: balance, deposits, withdrawals, transaction history.
- `roulette`: roulette sessions, spins, history, rating.
- `video-slot`: slot sessions, spins, history, RTP simulation for admins.
- `leaderboard`: profit-based user ranking.
- `chat`: realtime global chat with moderation.
- `fighting`: the most complete game module in the project.

### Fighting Module

The `fighting` module combines REST endpoints, Redis-backed temporary state, PostgreSQL profiles, and Socket.IO events.

Main parts:

- Fighting profiles are stored in PostgreSQL and are created automatically for users.
- Players can select one of the configured heroes: `Cyber Ninja`, `Neon Samurai`, or `Holo Mage`.
- Each hero has battle stats: `maxHealth`, `strike`, and `blockPower`.
- Player progress includes rating, rank, wins, losses, and draws.
- Ranks are calculated from rating: `BRONZE`, `SILVER`, `GOLD`, `PLATINUM`, `DIAMOND`.
- Duel requests are stored in Redis with TTL and can be public or targeted to a specific opponent.
- Battle rooms are stored in Redis while active and for a short time after finishing.
- Each round requires both players to submit an attack zone and defense zone: `head`, `body`, or `legs`.
- If the attack zone matches the defender's block zone, damage is reduced by block power.
- If a player does not move within the timeout, the backend creates an automatic random move.
- Battle results update fighting profile stats and rating.

Matchmaking is separate from duel requests. A player can enter a Redis-backed queue through WebSocket; if another valid player is already waiting, the backend immediately creates a battle room and emits match-found events to both users. If no opponent is available, the player stays in the queue until matched, cancelled, expired, or disconnected.

## API Overview

All REST endpoints use the global prefix `/api/v1`.

| Module | Main routes |
| --- | --- |
| Auth | `POST /auth/sign-up`, `POST /auth/sign-in`, `POST /auth/sign-out` |
| Users | `GET /users/me`, `PATCH /users/me`, `DELETE /users/me` |
| Admin | `GET /admin/users`, `PATCH /admin/users/:id`, `DELETE /admin/users/:id` |
| Wallet | `GET /wallet/balance`, `POST /wallet/deposit`, `POST /wallet/withdraw`, `GET /wallet/transactions/history` |
| Roulette | `POST /roulette/sessions`, `GET /roulette/sessions/current`, `POST /roulette/spin`, `GET /roulette/history`, `GET /roulette/rating` |
| Video Slots | `POST /video-slots/sessions`, `POST /video-slots/sessions/:id/spins`, `GET /video-slots/history`, `POST /admin/video-slots/simulate-rtp` |
| Leaderboard | `GET /leaderboard` |
| Chat | `GET /chat-system/status` |
| Fighting | `GET /fighting/profile/me`, `GET /fighting/heroes`, `PATCH /fighting/profile/me/hero`, `POST /fighting/duel-requests`, `GET /fighting/duel-requests`, `POST /fighting/duel-requests/:id/accept`, `GET /fighting/battles/:id` |

Full API documentation is available in Swagger.

## WebSockets

### Chat

Namespace: `/chat`

Main events:

- `joinRoom`
- `sendMessage`
- `chat:message:blocked`

The chat module supports realtime room messaging and blocks obvious advertising, referral links, spam invites, and scam-style messages before broadcasting.

### Fighting

Namespace: `/fighting`

Client events:

- `findFightingOpponent`: enter matchmaking.
- `cancelFightingMatchmaking`: leave matchmaking queue.
- `joinFightingBattle`: join a battle room.
- `leaveFightingBattle`: leave a battle room.
- `makeFightingMove`: submit attack and defense zones for the current round.

Server events:

- `fightingMatchmakingWaiting`
- `fightingMatchmakingCancelled`
- `fightingMatchFound`
- `fightingBattleState`
- `fightingPlayerMoved`
- `fightingRoundResult`
- `fightingBattleFinished`
- `fightingBattleError`

## How To Run Locally

Create local env files from the examples:

```powershell
copy app\.env.example app\.env.development
copy frontend\.env.example frontend\.env.local
```

Start the Docker development stack from the repository root:

```powershell
npm run docker:dev:up
```

Useful backend commands inside the app container:

```powershell
docker compose --env-file app/.env.development -f docker-compose.dev.yml exec app npm run prisma:deploy
docker compose --env-file app/.env.development -f docker-compose.dev.yml exec app npm run prisma:seed
```

For local frontend development:

```powershell
cd frontend
npm install
npm run dev
```

For local backend development without Docker, install dependencies in `app/`, provide PostgreSQL and Redis, set a host `DATABASE_URL`, then run:

```powershell
npm run prisma:generate
npm run start:dev
```

## Useful Links

- Local frontend: <http://localhost:3000>
- Local API: <http://localhost:3009/api/v1>
- Local Swagger: <http://localhost:3009/api>
- Deployed frontend: <http://31.131.18.217:3000>
- Deployed Swagger: <http://31.131.18.217:3009/api>
