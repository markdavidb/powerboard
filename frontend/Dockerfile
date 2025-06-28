# frontend/Dockerfile

FROM node:20 AS builder
WORKDIR /app

# 1) Accept all required VITE_ build args (Railway will inject them if defined as build args in the service)
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_SCOPE
ARG VITE_AUTH0_AUDIENCE
ARG VITE_USER_API
ARG VITE_PROJECT_API
ARG VITE_ANALYTICS_API
ARG VITE_NOTIFICATION_API
ARG VITE_AI_API

# 2) Dynamically create .env file with all required VITE_ variables
RUN echo "VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN" > .env \
 && echo "VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID" >> .env \
 && echo "VITE_AUTH0_SCOPE=$VITE_AUTH0_SCOPE" >> .env \
 && echo "VITE_AUTH0_AUDIENCE=$VITE_AUTH0_AUDIENCE" >> .env \
 && echo "VITE_USER_API=$VITE_USER_API" >> .env \
 && echo "VITE_PROJECT_API=$VITE_PROJECT_API" >> .env \
 && echo "VITE_ANALYTICS_API=$VITE_ANALYTICS_API" >> .env \
 && echo "VITE_NOTIFICATION_API=$VITE_NOTIFICATION_API" >> .env \
 && echo "VITE_AI_API=$VITE_AI_API" >> .env

# 3) Install dependencies
COPY package*.json ./
RUN npm install

# 4) Copy the rest of the frontend source code
COPY . .

# 5) Optional: show what will be used
RUN cat .env

# 6) Build the app for production
RUN npm run build

# 7) Stage 2: Nginx to serve static assets
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
