# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Build arguments para Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_DISCORD_WEBHOOK_URL
ENV VITE_DISCORD_WEBHOOK_URL=$VITE_DISCORD_WEBHOOK_URL

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar build para nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração nginx (SPA + proxy do socket.io para o backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
