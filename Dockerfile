FROM golang:1.19-alpine AS builder
ENV CGO_ENABLED=0
WORKDIR /backend
COPY backend/go.* .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download
COPY backend/. .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -trimpath -ldflags="-s -w" -o bin/service

FROM --platform=$BUILDPLATFORM node:18.12-alpine3.16 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
RUN npm run build

FROM alpine
LABEL org.opencontainers.image.title="KWasm for Docker Desktop" \
    org.opencontainers.image.description="WebAssembly Containers for your Docker Desktop Kubernetes" \
    org.opencontainers.image.vendor="KWasm" \
    com.docker.desktop.extension.api.version="0.3.3" \
    com.docker.extension.screenshots="" \
    com.docker.extension.detailed-description="" \
    com.docker.extension.publisher-url="https://github.com/KWasm/kwasm-docker-extension" \
    com.docker.extension.additional-urls="[{\"title\":\"Issues\",\"url\":\"https://github.com/KWasm/kwasm-docker-extension/issues\"}]" \
    com.docker.extension.changelog="" \
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/KWasm/kwasm.github.io/main/docs/assets/logo.png" \
    com.docker.extension.categories="kubernetes,cloud-development"

COPY --link --from=0xe282b0/kwasm-node-installer-experimental /assets /assets
COPY --link --from=0xe282b0/kwasm-node-installer-experimental /script /script
COPY --link --from=builder /backend/bin/service /
COPY docker-compose.yaml .
COPY metadata.json .
COPY kwasm.svg .
COPY --link --from=client-builder /ui/build ui
CMD /service -socket /run/guest-services/kwasm.sock
