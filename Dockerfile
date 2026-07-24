FROM node:20-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat git
WORKDIR /app

ARG GHCR_TOKEN
ENV GHCR_TOKEN=$GHCR_TOKEN

COPY package.json ./
RUN node -e " \
  const fs = require('fs'); \
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); \
  if (pkg.dependencies) { \
    if (pkg.dependencies['@system/design-ui'] === '*') pkg.dependencies['@system/design-ui'] = 'git+https://${GHCR_TOKEN}@github.com/Platform-System/Platform.DesignSystemUI.git#main'; \
    if (pkg.dependencies['@system/api-client'] === '*') pkg.dependencies['@system/api-client'] = 'git+https://${GHCR_TOKEN}@github.com/Platform-System/Platform.ApiClient.git#main'; \
  } \
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2)); \
"
RUN git config --global url."https://${GHCR_TOKEN}@github.com/".insteadOf "https://github.com/" && \
    git config --global url."https://${GHCR_TOKEN}@github.com/".insteadOf "git+https://github.com/" && \
    git config --global url."https://${GHCR_TOKEN}@github.com/".insteadOf "ssh://git@github.com/" && \
    git config --global url."https://${GHCR_TOKEN}@github.com/".insteadOf "git@github.com:"
RUN --mount=type=cache,target=/root/.npm npm install --legacy-peer-deps

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build time
ARG PUBLIC_WEB_URL
ARG PUBLIC_API_URL
ARG PUBLIC_AUTH_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_KEYCLOAK_URL
ARG NEXT_PUBLIC_KEYCLOAK_REALM
ARG NEXT_PUBLIC_KEYCLOAK_CLIENT_ID

ENV PUBLIC_WEB_URL=$PUBLIC_WEB_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL
ENV PUBLIC_AUTH_URL=$PUBLIC_AUTH_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_KEYCLOAK_URL=$NEXT_PUBLIC_KEYCLOAK_URL
ENV NEXT_PUBLIC_KEYCLOAK_REALM=$NEXT_PUBLIC_KEYCLOAK_REALM
ENV NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=$NEXT_PUBLIC_KEYCLOAK_CLIENT_ID

RUN npm run build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
