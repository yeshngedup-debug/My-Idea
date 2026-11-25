# Production image for the Next.js app. Postgres, Auth, Object Storage and
# Realtime are managed by Neon — there is no local backend stack to start.
# See scripts/local-up.ps1 and `neon deploy` / `neon env pull`.
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* values are inlined at build time, so they must be build args.
# Server-only secrets (DATABASE_URL, NEON_AUTH_*, AWS_*, NEON_REALTIME_SECRET)
# are injected at runtime by `neon deploy` / `neon env pull`.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_NEON_REALTIME_URL
ARG NEXT_PUBLIC_MESURER_ENABLED
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_NEON_REALTIME_URL=$NEXT_PUBLIC_NEON_REALTIME_URL \
    NEXT_PUBLIC_MESURER_ENABLED=$NEXT_PUBLIC_MESURER_ENABLED \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
