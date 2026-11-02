# ==========================================================
# ETAPA 1: Builder (Compilación y generación de artefactos)
# ==========================================================
FROM node:24-alpine AS builder

# Habilitar pnpm
RUN npm i -g pnpm@12.6.0

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}


# Compilar TypeScript a JavaScript (/dist)
RUN pnpm build

# ==========================================================
# ETAPA 2: Runner (Entorno de Ejecución Mínimo en Producción)
# ==========================================================
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el build estático
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Nginx sirve los archivos estáticos compilados.
CMD ["nginx", "-g", "daemon off;"]
