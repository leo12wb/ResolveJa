# Stage 1 — Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2 — Export dist via volume compartilhado com Nginx
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/dist ./dist
VOLUME /app/dist
CMD ["sh", "-c", "cp -r /app/dist/. /shared-dist/ && echo 'Frontend dist copiado.'"]
