FROM node:22-alpine AS dependencies

WORKDIR /app

COPY . .

RUN npm install -g pnpm && pnpm install

RUN pnpm run build

EXPOSE 4001

ENV NODE_ENV=production

CMD ["npm", "run", "start:prod"]