# frontend/Dockerfile

FROM node:20 AS builder
WORKDIR /app

# 1) Accept build‐time VITE_ vars
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_SCOPE
ARG VITE_AUTH0_AUDIENCE
ARG VITE_USER_API
ARG VITE_PROJECT_API
ARG VITE_ANALYTICS_API
ARG VITE_NOTIFICATION_API
ARG VITE_AI_API

# 2) Create .env dynamically
RUN printf "VITE_AUTH0_DOMAIN=%s\nVITE_AUTH0_CLIENT_ID=%s\nVITE_AUTH0_SCOPE=%s\nVITE_AUTH0_AUDIENCE=%s\nVITE_USER_API=%s\nVITE_PROJECT_API=%s\nVITE_ANALYTICS_API=%s\nVITE_NOTIFICATION_API=%s\nVITE_AI_API=%s\n" \
  "$VITE_AUTH0_DOMAIN" "$VITE_AUTH0_CLIENT_ID" "$VITE_AUTH0_SCOPE" "$VITE_AUTH0_AUDIENCE" \
  "$VITE_USER_API" "$VITE_PROJECT_API" "$VITE_ANALYTICS_API" "$VITE_NOTIFICATION_API" "$VITE_AI_API" \
  > .env

# 3) Install deps
COPY package*.json ./
RUN npm install

# 4) Copy source & build
COPY . .
RUN npm run build

# 5) Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
