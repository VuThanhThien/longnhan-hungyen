FROM alpine:3.20

RUN apk add --no-cache \
    bash \
    curl \
    gzip \
    postgresql16-client \
    python3

# Pin supercronic release (cron runner for containers) — v0.2.36+ fixes reaper fork-exec bug
ARG SUPERCRONIC_VERSION=0.2.36
ARG TARGETARCH
RUN case "${TARGETARCH:-$(uname -m)}" in \
      amd64|x86_64) SUPERCRONIC_ARCH=amd64 ;; \
      arm64|aarch64) SUPERCRONIC_ARCH=arm64 ;; \
      *) echo "unsupported architecture: ${TARGETARCH:-$(uname -m)}" >&2; exit 1 ;; \
    esac \
    && curl -fsSL \
      "https://github.com/aptible/supercronic/releases/download/v${SUPERCRONIC_VERSION}/supercronic-linux-${SUPERCRONIC_ARCH}" \
      -o /usr/local/bin/supercronic \
    && chmod +x /usr/local/bin/supercronic

COPY backup.sh /backup.sh
COPY crontab /etc/crontab
RUN chmod +x /backup.sh

ENV BACKUP_DIR=/backups
VOLUME /backups

ENTRYPOINT ["/usr/local/bin/supercronic", "/etc/crontab"]
