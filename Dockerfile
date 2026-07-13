FROM node:20-alpine AS build
RUN corepack enable && corepack prepare yarn@4.13.0 --activate
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable
COPY prisma ./prisma
RUN npx prisma generate --schema=prisma/schema.prisma
COPY . .
RUN yarn build

FROM node:20-alpine
RUN corepack enable && corepack prepare yarn@4.13.0 --activate
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
ENV NODE_ENV=production
RUN yarn install --immutable
COPY prisma ./prisma
RUN npx prisma generate --schema=prisma/schema.prisma
# Source needed at runtime by the scheduled `yarn db:update` cron service, which
# runs `tsx prisma/update.ts` importing from app/services/*. The web server serves
# from ./build and never loads these, so this is harmless (and unused) for it.
COPY tsconfig.json ./
COPY app ./app
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["yarn", "start"]
