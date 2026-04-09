FROM node:22-alpine

WORKDIR /usr/src/app

EXPOSE 3009

COPY app/package*.json ./
RUN npm install

COPY app/ ./

CMD ["tail", "-f", "/dev/null"]
