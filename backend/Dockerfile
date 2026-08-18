# ── Build stage ──────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ── Runtime stage ─────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S ielts && adduser -S ielts -G ielts

# Create temp upload directory
RUN mkdir -p /app/tmp/uploads && chown -R ielts:ielts /app

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=ielts:ielts . .

USER ielts

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
