# Internship Casino Platform

## Project Overview

Full-stack casino-style learning project with a NestJS backend and React frontend.

The application includes authentication, wallets, roulette, video slots, realtime chat, admin user management, leaderboards, and a richer `fighting` module with heroes, profiles, duel requests, matchmaking, and websocket battles.

## Live Demo Links

- Frontend: <https://neonrealms.duckdns.org/>
- Swagger API docs: <https://neonrealms.duckdns.org/api>

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

- `auth`: email/password authentication, Google OAuth 2.0 login, JWT-based authorization.
- `users`: current user profile and admin user management.
- `wallet`: balance, deposits, withdrawals, transaction history.
- `roulette`: roulette sessions, spins, history, rating.
- `video-slot`: slot sessions, spins, history, RTP simulation for admins.
- `leaderboard`: profit-based user ranking.
- `chat`: realtime global chat with moderation.
- `fighting`: the most complete game module in the project.

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
- Deployed frontend: <https://neonrealms.duckdns.org/>
- Deployed Swagger: <https://neonrealms.duckdns.org/api>
