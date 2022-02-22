FROM node:latest
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install
RUN pnpm build
RUN pnpm prisma db push && pnpm prisma db seed
EXPOSE 3000
ENTRYPOINT [ "node", "run.js" ]
