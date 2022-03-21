# This image is created with a multi-stage build:
# - build: produces the runnable server code
# - runtime: starts a database server and the server code

# Build stage
FROM debian:bullseye-20220228-slim AS build
WORKDIR /bastion-build

# Install Volta
ENV VOLTA_HOME=/root/.volta
ENV PATH=$VOLTA_HOME/bin:$PATH
RUN set -eux; \
	apt-get update && apt-get install -y curl; \
	curl https://get.volta.sh | bash -s -- --skip-setup

# Copy the whole monorepo
COPY . .

# Install dependencies and build the whole monorepo
ENV VITE_API_PORT=1314
ENV VITE_TENOR_KEY=O7AM9I8X5QC3
RUN yarn install --immutable
RUN yarn build

# Runtime stage
FROM debian:bullseye-20220228-slim AS runtime
WORKDIR /bastion-server-runtime

# Prevents "Fontconfig error: Cannot load default config file"
ENV FONTCONFIG_PATH=/etc/fonts
RUN mkdir -p $FONTCONFIG_PATH
RUN echo '<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig></fontconfig>' > $FONTCONFIG_PATH/fonts.conf

# Prepare PostreSQL
# Adapated from https://github.com/docker-library/postgres/blob/a1ea032a8b5872e291f5f3f7b8395b8e958aaefb/14/bullseye/Dockerfile
RUN set -ex; \
	if ! command -v gpg > /dev/null; then \
		apt-get update; \
		apt-get install -y --no-install-recommends \
			gnupg \
			dirmngr \
		; \
		rm -rf /var/lib/apt/lists/*; \
	fi
RUN set -eux; \
	groupadd -r postgres --gid=999; \
	useradd -r -g postgres --uid=999 --home-dir=/var/lib/very-secret-database --shell=/bin/bash postgres; \
	mkdir -p /var/lib/very-secret-database; \
	chown -R postgres:postgres /var/lib/very-secret-database
ENV GOSU_VERSION 1.14
RUN set -eux; \
	savedAptMark="$(apt-mark showmanual)"; \
	apt-get update; \
	apt-get install -y --no-install-recommends ca-certificates wget; \
	rm -rf /var/lib/apt/lists/*; \
	dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')"; \
	wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch"; \
	wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch.asc"; \
	export GNUPGHOME="$(mktemp -d)"; \
	gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4; \
	gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu; \
	gpgconf --kill all; \
	rm -rf "$GNUPGHOME" /usr/local/bin/gosu.asc; \
	apt-mark auto '.*' > /dev/null; \
	[ -z "$savedAptMark" ] || apt-mark manual $savedAptMark > /dev/null; \
	apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
	chmod +x /usr/local/bin/gosu; \
	gosu --version; \
	gosu nobody true
RUN set -eux; \
	if [ -f /etc/dpkg/dpkg.cfg.d/docker ]; then \
		grep -q '/usr/share/locale' /etc/dpkg/dpkg.cfg.d/docker; \
		sed -ri '/\/usr\/share\/locale/d' /etc/dpkg/dpkg.cfg.d/docker; \
		! grep -q '/usr/share/locale' /etc/dpkg/dpkg.cfg.d/docker; \
	fi; \
	apt-get update; apt-get install -y --no-install-recommends locales; rm -rf /var/lib/apt/lists/*; \
	localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8
ENV LANG en_US.utf8
RUN set -eux; \
	apt-get update; \
	apt-get install -y --no-install-recommends \
		libnss-wrapper \
		xz-utils \
	; \
	rm -rf /var/lib/apt/lists/*
RUN mkdir /docker-entrypoint-initdb.d
RUN set -ex; \
	key='B97B0AFCAA1A47F044F244A07FCC7D46ACCC4CF8'; \
	export GNUPGHOME="$(mktemp -d)"; \
	mkdir -p /usr/local/share/keyrings/; \
	gpg --batch --keyserver keyserver.ubuntu.com --recv-keys "$key"; \
	gpg --batch --export --armor "$key" > /usr/local/share/keyrings/postgres.gpg.asc; \
	command -v gpgconf > /dev/null && gpgconf --kill all; \
	rm -rf "$GNUPGHOME"
ENV PG_MAJOR 14
ENV PATH $PATH:/usr/lib/postgresql/$PG_MAJOR/bin
ENV PG_VERSION 14.2-1.pgdg110+1
RUN set -ex; \
	export PYTHONDONTWRITEBYTECODE=1; \
	dpkgArch="$(dpkg --print-architecture)"; \
	aptRepo="[ signed-by=/usr/local/share/keyrings/postgres.gpg.asc ] http://apt.postgresql.org/pub/repos/apt/ bullseye-pgdg main $PG_MAJOR"; \
	case "$dpkgArch" in \
		amd64 | arm64 | ppc64el) \
			echo "deb $aptRepo" > /etc/apt/sources.list.d/pgdg.list; \
			apt-get update; \
			;; \
		*) \
			echo "deb-src $aptRepo" > /etc/apt/sources.list.d/pgdg.list; \
			savedAptMark="$(apt-mark showmanual)"; \
			tempDir="$(mktemp -d)"; \
			cd "$tempDir"; \
			apt-get update; \
			apt-get install -y --no-install-recommends dpkg-dev; \
			echo "deb [ trusted=yes ] file://$tempDir ./" > /etc/apt/sources.list.d/temp.list; \
			_update_repo() { \
				dpkg-scanpackages . > Packages; \
				apt-get -o Acquire::GzipIndexes=false update; \
			}; \
			_update_repo; \
			nproc="$(nproc)"; \
			export DEB_BUILD_OPTIONS="nocheck parallel=$nproc"; \
			apt-get build-dep -y postgresql-common pgdg-keyring; \
			apt-get source --compile postgresql-common pgdg-keyring; \
			_update_repo; \
			apt-get build-dep -y "postgresql-$PG_MAJOR=$PG_VERSION"; \
			apt-get source --compile "postgresql-$PG_MAJOR=$PG_VERSION"; \
			apt-mark showmanual | xargs apt-mark auto > /dev/null; \
			apt-mark manual $savedAptMark; \
			ls -lAFh; \
			_update_repo; \
			grep '^Package: ' Packages; \
			cd /; \
			;; \
	esac; \
	apt-get install -y --no-install-recommends postgresql-common; \
	sed -ri 's/#(create_main_cluster) .*$/\1 = false/' /etc/postgresql-common/createcluster.conf; \
	apt-get install -y --no-install-recommends \
		"postgresql-$PG_MAJOR=$PG_VERSION" \
	; \
	rm -rf /var/lib/apt/lists/*; \
	if [ -n "$tempDir" ]; then \
		apt-get purge -y --auto-remove; \
		rm -rf "$tempDir" /etc/apt/sources.list.d/temp.list; \
	fi; \
	find /usr -name '*.pyc' -type f -exec bash -c 'for pyc; do dpkg -S "$pyc" &> /dev/null || rm -vf "$pyc"; done' -- '{}' +; \
	postgres --version
RUN set -eux; \
	dpkg-divert --add --rename --divert "/usr/share/postgresql/postgresql.conf.sample.dpkg" "/usr/share/postgresql/$PG_MAJOR/postgresql.conf.sample"; \
	cp -v /usr/share/postgresql/postgresql.conf.sample.dpkg /usr/share/postgresql/postgresql.conf.sample; \
	ln -sv ../postgresql.conf.sample "/usr/share/postgresql/$PG_MAJOR/"; \
	sed -ri "s!^#?(listen_addresses)\s*=\s*\S+.*!\1 = '*'!" /usr/share/postgresql/postgresql.conf.sample; \
	grep -F "listen_addresses = '*'" /usr/share/postgresql/postgresql.conf.sample
RUN mkdir -p /var/run/postgresql && chown -R postgres:postgres /var/run/postgresql && chmod 2777 /var/run/postgresql
ENV PGDATA /var/lib/very-secret-database/data
RUN mkdir -p "$PGDATA" && chown -R postgres:postgres "$PGDATA" && chmod 777 "$PGDATA"
VOLUME /var/lib/very-secret-database/data
RUN gosu postgres initdb

# Copy workspace files
COPY --from=build /bastion-build/.yarn/ ./.yarn/
COPY --from=build /bastion-build/package.json /bastion-build/.yarnrc.yml /bastion-build/run.js ./

# Copy Volta
ENV VOLTA_HOME=/root/.volta
ENV PATH=$VOLTA_HOME/bin:$PATH
COPY --from=build /root/.volta/ /root/.volta/

# Copy build artifacts
COPY --from=build /bastion-build/prisma/ ./prisma/
COPY --from=build /bastion-build/apps/backend/package.json ./apps/backend/
COPY --from=build /bastion-build/apps/backend/resources/ ./apps/backend/resources/
COPY --from=build /bastion-build/apps/backend/build/ ./apps/backend/build/
COPY --from=build /bastion-build/apps/frontend/package.json ./apps/frontend/
COPY --from=build /bastion-build/apps/frontend/build/ ./apps/frontend/build/

ENV BASTION_STORAGE=/bastion-storage/
COPY --from=build /bastion-build/storage/ /bastion-storage/
VOLUME /bastion-storage/

# Install dependencies
RUN yarn workspaces focus --production --all
RUN rm -rf .yarn/cache

# Start the application on port 1314
ENV DATABASE_URL="postgresql://postgres@localhost:5432/postgres?schema=public"
ENV VITE_API_PORT=1314
ENV VITE_TENOR_KEY=O7AM9I8X5QC3

# Apply migrations
RUN set -eux; \
	gosu postgres pg_ctl start --wait; \
	yarn prisma migrate deploy; \
	gosu postgres pg_ctl stop --wait; \
	rm -rf ./prisma/migrations/

EXPOSE 1314
STOPSIGNAL SIGINT

COPY ./docker-entrypoint.sh ./
ENTRYPOINT [ "bash", "./docker-entrypoint.sh" ]
