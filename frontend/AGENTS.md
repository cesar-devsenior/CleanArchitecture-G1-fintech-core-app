# AGENTS.md - fintech-core-front

## Proyecto
Aplicación frontend React + TypeScript + Vite para Fintech Core App siguiendo Clean Architecture.

## Estructura y límites
- `src/domain/` → entidades, value objects, puertos/repositorios, errores. Sin dependencias externas (sin React, Axios, localStorage).
- `src/application/` → casos de uso puros. Solo depende de `domain`. Sin React, Axios, Router.
- `src/infrastructure/` → adaptadores HTTP, mappers DTO↔Entidad, Storage, DI. Implementa puertos de `domain`.
- `src/presentation/` → componentes, páginas, hooks, context, router. Invoca casos de uso; NO debe importar Axios/localStorage directamente.
- `src/config/` → configuración externa.

Regla de dependencia: `presentation → application → domain ← infrastructure`. 
Nunca importar desde `presentation` hacia `infrastructure` detalles HTTP/Storage.

## Estado
Separar: estado local (formularios/modales), estado global sesión (`AuthContext`), estado remoto (datos servidor). 
Estados asincrónicos obligatorios: `idle/loading/success/error/empty`. Bloquear doble envío. Tras mutación exitosa → refrescar datos confirmados.

## Contratos API
Fuente de verdad: `docs/frontend/backend-contract.md` + código backend. 
- Envelope: `{ status, data?, message?, code?, errors? }`
- Nunca inventar endpoints/DTOs/códigos HTTP. Si ambiguo → preguntar.
- Errores como `unknown` → normalizar. Evitar `any` sin justificación.
- Token encapsulado en `StorageAdapter`. No leer JWT/localStorage desde componentes.

## Validación
- `pnpm typecheck` (tsc --noEmit)
- `pnpm lint` (ESLint)
- `pnpm test` (Vitest)
- `pnpm build`

Antes de cambios significativos: revisar `backend-contract.md`, respetar límites, ejecutar validaciones.

## Notas
Frontend ya implementado (auth/accounts/transactions). Usar reglas `.cursor/rules/*` y comandos `.cursor/commands/*` como referencia.
