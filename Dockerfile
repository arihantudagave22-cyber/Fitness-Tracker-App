FROM node:24-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/data/fitness.sqlite
WORKDIR /app

COPY backend ./backend
COPY --from=build /app/dist ./dist

VOLUME ["/data"]
EXPOSE 3001

CMD ["node", "backend/src/index.js"]
