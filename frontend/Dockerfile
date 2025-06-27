# frontend/Dockerfile

FROM node:20 AS builder
WORKDIR /app

# 1) Copy only the production env into .env so Vite will load it
COPY .env.production .env

# 2) Copy package files & install deps
COPY package*.json ./
RUN npm install

# 3) Copy the rest of your source
COPY . .

# 4) (Optional) debug that .env was copied
RUN echo "Using VITE_AUTH0_DOMAIN=$(grep VITE_AUTH0_DOMAIN .env)" \
 && echo "Using VITE_AUTH0_CLIENT_ID=$(grep VITE_AUTH0_CLIENT_ID .env)"

# 5) Run the production build
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
