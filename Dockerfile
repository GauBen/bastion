# This image is created with a multi-stage build:
# - build: produces the runnable server code
# - runtime: starts a database server and the server code

# Build stage
FROM debian:bullseye-slim AS build
WORKDIR /bastion-build

# Copy the whole monorepo
COPY . .

# Install Volta
ENV VOLTA_HOME=/root/.volta
ENV PATH=$VOLTA_HOME/bin:$PATH
RUN set -eux; \
	apt-get update && apt-get install -y curl; \
	curl https://get.volta.sh | bash -s -- --skip-setup; \
	volta install node && volta install corepack

# Install dependencies and build the whole monorepo
ENV VITE_API_PORT=3000
RUN pnpm install
RUN pnpm build

# Runtime stage
FROM debian:bullseye-slim AS runtime
WORKDIR /bastion-server-runtime

# Copy workspace files
COPY --from=build /bastion-build/package.json /bastion-build/pnpm-lock.yaml /bastion-build/pnpm-workspace.yaml /bastion-build/run.js ./

# Copy Volta
ENV VOLTA_HOME=/root/.volta
ENV PATH=$VOLTA_HOME/bin:$PATH
COPY --from=build /root/.volta/ /root/.volta/

# Not copying pnpm's store produces a smaller image
# COPY --from=build /root/.pnpm-store/v3/ /root/.pnpm-store/v3/

# Copy build artifacts
COPY --from=build /bastion-build/prisma/ ./prisma/
COPY --from=build /bastion-build/storage/ ./storage/
COPY --from=build /bastion-build/apps/backend/package.json ./apps/backend/
COPY --from=build /bastion-build/apps/backend/resources/ ./apps/backend/resources/
COPY --from=build /bastion-build/apps/backend/build/ ./apps/backend/build/
COPY --from=build /bastion-build/apps/frontend/package.json ./apps/frontend/
COPY --from=build /bastion-build/apps/frontend/build/ ./apps/frontend/build/

# Install dependencies and prune pnpm's store
RUN pnpm install --prod
RUN pnpm prune && pnpm store prune

# Prepare the SQLite database
ENV DATABASE_URL="file:../storage/dev.db"
ENV VITE_API_PORT=3000
RUN pnpm prisma db push && pnpm prisma db seed

# Start the application on port 3000
EXPOSE 3000
CMD [ "node", "." ]
