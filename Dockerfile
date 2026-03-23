FROM node:22-alpine

# Створюємо робочу директорію
WORKDIR /usr/src/app

# Встановлюємо глобальні пакети для навчання
RUN npm install -g @nestjs/cli prisma

# Відкриваємо порти для додатку (3000) та WebSocket (3001)
EXPOSE 3000
EXPOSE 3001

# Копіюємо package.json та встановлюємо залежності
COPY app/package*.json ./
RUN npm install

# Копіюємо prisma schema та генеруємо клієнт
COPY app/prisma ./prisma
RUN npx prisma generate

# Копіюємо решту додатку
COPY app/ ./

# Команда за замовчуванням (утримує контейнер активним)
CMD ["tail", "-f", "/dev/null"]
