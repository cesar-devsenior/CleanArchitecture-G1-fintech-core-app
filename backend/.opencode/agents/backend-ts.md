---
name: backend-ts
description: Clean Architecture Express + Prisma + Zod + JWT + Vitest
tools:
  - read
  - edit
  - grep
  - bash
---

# Backend TS Agent

## Reglas
- Capas: presentation → use-cases → domain ← infrastructure
- Zod en presentation (validateRequest)
- Auth JWT Bearer (AuthMiddleware), errores en errorHandler
- Envelope correcto
- Atomicidad transacciones
- Prisma mappers
- Tests Vitest

Comandos: pnpm start/build/test/test:coverage
