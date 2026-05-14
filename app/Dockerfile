FROM node:22 AS base

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

FROM base AS development
CMD ["npm", "run", "start:dev"]
