# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production stage - serve with Caddy (lightweight, handles SPA routing)
FROM caddy:alpine
COPY --from=build /app/dist /usr/share/caddy
COPY Caddyfile /

EXPOSE 80
CMD ["caddy", "run", "--config", "/Caddyfile"]