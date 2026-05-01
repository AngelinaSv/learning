# Project Readme

Simple, lightweight overview of the project structure and a running TODO list for future work.

## Project Structure
- app/
  - prisma/schema.prisma
  - prisma/migrations/  (database migrations)
  - src/  (NestJS application source code)
- app/src/modules/  (feature modules: auth, users, address, admin, etc.)
- app/src/common/  (shared utilities, guards, interfaces, types)
- app/src/generated/  ( Prisma client and generated types )
- README.md  (this file)

## Routes (examples)
- POST /auth/sign-up  (register)
- POST /auth/sign-in  (login)
- POST /auth/sign-out (logout)
- GET /user
- GET /user/:id
- POST /address
- GET /address
- GET /address/:id
- PATCH /address/:id
- DELETE /address/:id
- GET /admin/users  (list all users)
- GET /admin/users/:id  (get one user)
- PATCH /admin/users/:id/ban  (ban user)
- PATCH /admin/users/:id/unban  (unban user)

Note: Admin routes require an admin JWT and proper role.

## Data Models (high level)
- User: username, email, password, role, isBanned, isDeleted, createdAt, profile, address
- Profile: rating, balance, level
- Address: firstName, lastName, phoneNumber, address, city, country, postalCode, userId
- GameSession and related models exist for gameplay, but are out of scope for the basic flows here.

## How to run (quick)
- Ensure PostgreSQL is available and Prisma is configured
- npm install
- npm run prisma:dev to apply migrations and generate client
- npm run start:dev

## TODOs (high level)
- TODO: add real session persistence (instead of mock sessions)
- TODO: replace any hardcoded test data with seed/migrations for production
- TODO: add input validation on DTOs (class-validator)
- TODO: improve error handling and standardized API responses
- TODO: implement additional admin role features
- TODO: add API documentation (Swagger) and example clients

## Notes
- This is a lightweight scaffold. 
