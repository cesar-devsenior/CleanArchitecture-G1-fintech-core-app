# AGENTS.md - fintech-core-app

## Proyecto
API REST Node/Express + TypeScript + Prisma + PostgreSQL siguiendo Clean Architecture (domain/use-cases/infrastructure/presentation).

## Estructura
- `src/domain/` → entidades, excepciones, interfaces (repositorios/servicios), puertos
- `src/use-cases/` → casos de uso + DTOs internos
- `src/infrastructure/` → Prisma, mappers, servicios (JWT/Bcrypt), repositorios
- `src/presentation/` → app, controllers, middlewares, DTOs Zod
- `src/generated/prisma/` → cliente generado

## Reglas
- Respeto estricto a capas. `presentation → use-cases → domain ← infrastructure`
- Validación con Zod en capa presentation (`validateRequest`)
- Auth JWT Bearer vía `AuthMiddleware`. Errores centralizados en `errorHandler`
- Envelope respuesta: `{ status: 'success'|'fail'|'error', data?, message?, code?, errors? }`
- Transacciones financieras: atomicidad delegada a repositorio/casos de uso. No optimismo.
- Nunca exponer secretos. Usar `.env` (ver `.env-example`)

## Comandos
- `pnpm start` (dev con tsx watch)
- `pnpm build` (tsc)
- `pnpm test` / `pnpm test:watch` / `pnpm test:coverage` (Vitest)
- `pnpm prestart` (prisma generate)

## Prisma
- `prisma/schema.prisma`, migraciones en `prisma/migrations/`
- Usar adapter pg si aplica

## Notas
Ya implementado: auth, accounts, transactions. Mantener alineado con `fintech-core-front/docs/frontend/backend-contract.md`.
