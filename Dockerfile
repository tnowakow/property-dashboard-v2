# Stage 1: Build the Vite React application
FROM node:20-alpine as builder

WORKDIR /app

COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Stage 2: Serve the application with Caddy
FROM caddy:2-alpine

WORKDIR /srv

# Copy the built Vite app from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Expose the port Caddy will listen on
EXPOSE 80

# Command to run Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]