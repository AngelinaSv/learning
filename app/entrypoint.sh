set -e

npx prisma migrate deploy
node dist/prisma/seed.js

exec node dist/src/main.js
