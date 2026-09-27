# ==========================================================
# ETAPA 1: Builder (Compilación y generación de artefactos)
# ==========================================================
FROM node:24-alpine AS builder

# Habilitar pnpm
RUN npm i -g pnpm@12.6.0

WORKDIR /app

# Copiar manifiestos de dependencias y la política de builds de pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Instalar dependencias permitidas por la configuración del workspace
RUN pnpm install --frozen-lockfile

# Copiar el código fuente
COPY . .

# Generar el cliente de Prisma (Crucial antes de compilar)
RUN pnpm exec prisma generate

# Compilar TypeScript a JavaScript (/dist)
RUN pnpm build


# ==========================================================
# ETAPA 2: Runner (Entorno de Ejecución Mínimo en Producción)
# ==========================================================
FROM node:24-alpine AS runner

# Habilitar pnpm
RUN npm i -g pnpm@12.6.0

WORKDIR /app

ENV NODE_ENV=production

# Copiar manifiestos de dependencias y la política de builds de pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Instalar SOLO dependencias de producción permitidas por el workspace
RUN pnpm install --prod --frozen-lockfile

# Copiar el cliente de Prisma generado y el build
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# SCRIPT DE ARRANQUE RESILIENTE:
# 1. Aplica migraciones pendientes sobre la base de datos (seguro para tablas vacías o incrementales)
# 2. Inicializa el proceso principal de Node.js
CMD ["sh", "-c", "pnpm dlx prisma@7.9.1 migrate deploy && node ./dist/server.js"]
