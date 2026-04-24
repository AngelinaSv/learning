# File Storage Service

NestJS-based file storage service with PostgreSQL, JWT authentication, and role-based access control.

## Tech Stack

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL with TypeORM
- **Auth**: JWT with bcrypt password hashing
- **API Docs**: Swagger at `/api`
- **Frontend**: Vanilla JS SPA at `/`

## Quick Start

### 1. Copy Environment Variables

```bash
cp app/.env.example app/.env
```

### 2. Run with Docker

```bash
docker-compose up -d --build
```

Server runs at `http://localhost:3009`

### 3. Run Locally

```bash
cd app
npm install
npm run migration:run  # Run migrations
npm run start:dev
```

## Database

### Migrations

```bash
# Generate new migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run all pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Tables

| Table | Description |
|-------|-------------|
| `roles` | User roles (admin, user) |
| `permissions` | Role permissions |
| `role_permissions` | Role-Permission mapping |
| `users` | User accounts |
| `user_roles` | User-Role mapping |
| `sessions` | JWT refresh sessions |
| `files` | File metadata |

## API Endpoints

### Authentication (public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/sign-up` | Register new user |
| POST | `/auth/sign-in` | Login |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/sign-out` | Logout |

### Files (protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/file` | List user files |
| POST | `/file` | Upload file |
| POST | `/file/upload` | Upload file (multipart) |
| POST | `/file/assemble` | Assemble chunks |
| GET | `/file/:filename` | Download file |
| DELETE | `/file/:filename` | Delete file |
| DELETE | `/file/admin/:userId/:filename` | Admin: Delete any file |

### Users (protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user` | List users (admin only) |
| PATCH | `/user/:id` | Update user |
| DELETE | `/user/:id` | Delete user (admin only) |

## Roles & Permissions

- **user**: Basic access to own files
- **admin**: Full access + manage users

## Frontend

The frontend is a single-page app at `http://localhost:3009/`:

- Sign Up / Sign In
- Upload/Delete files
- View profile
- Admin panel (manage users)

## Environment Variables

```env
# Server
PORT=3009

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=app
DB_SYNCHRONIZE=false

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Storage
STORAGE_PATH=storage/files
```

## Project Structure

```
app/
├── src/
│   ├── auth/              # JWT auth, guards, strategies
│   ├── file/             # File upload/download
│   ├── storage/          # File system operations
│   ├── user/            # User CRUD
│   ├── access/          # Roles & permissions
│   ├── common/          # Config, guards, decorators
│   └── database/
│       └── migrations/   # DB migrations
├── public/              # Frontend SPA
├── storage/            # File storage
│   └── files/
│       └── {userId}/  # User folders
├── .env.example
├── docker-compose.yml
└── package.json
```