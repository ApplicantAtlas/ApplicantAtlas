# Stage 1: Building the app
FROM node:14 as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the built app
FROM node:14-alpine

WORKDIR /app
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Install 'serve' to serve static files
RUN npm install -g serve

EXPOSE 3000

# Command to serve the static files from the 'build' directory
CMD ["serve", "-s", "dist", "-p", "3000"]
