FROM debian:bullseye-slim AS build

WORKDIR /app

ENV VOLTA_HOME=/root/.volta
ENV PATH=$VOLTA_HOME/bin:$PATH
RUN set -eux; \
	apt-get update && apt-get install -y curl; \
	curl https://get.volta.sh | bash -s -- --skip-setup; \
	volta install node && volta install corepack

COPY . .

ENV VITE_API_PORT=3000
RUN pnpm install
RUN pnpm build

# ------------------------

FROM debian:bullseye-slim AS runtime

WORKDIR /app/bastion-runtime

ENV VOLTA_HOME=/root/.volta
ENV PATH=$VOLTA_HOME/bin:$PATH
RUN set -eux; \
	apt-get update && apt-get install -y curl; \
	curl https://get.volta.sh | bash -s -- --skip-setup; \
	volta install node && volta install corepack

COPY --from=build /root/.pnpm-store/v3/ /root/.pnpm-store/v3/
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/run.js ./
COPY --from=build /app/prisma/ ./prisma/
COPY --from=build /app/storage/ ./storage/
COPY --from=build /app/apps/backend/package.json ./apps/backend/
COPY --from=build /app/apps/backend/resources/ ./apps/backend/resources/
COPY --from=build /app/apps/backend/dist/ ./apps/backend/dist/
COPY --from=build /app/apps/frontend/package.json ./apps/frontend/
COPY --from=build /app/apps/frontend/build/ ./apps/frontend/build/

ENV DATABASE_URL="file:../storage/dev.db"
ENV VITE_API_PORT=3000
RUN pnpm install --prod
RUN pnpm prisma db push && pnpm prisma db seed
RUN pnpm prune && pnpm store prune

EXPOSE 3000
CMD [ "node", "." ]
