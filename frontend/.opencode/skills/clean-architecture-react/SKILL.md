---
name: clean-architecture-react
description: Workflow para aplicar Clean Architecture en React (4 capas + estados UI + contratos backend)
---

# Skill: Clean Architecture React

## Pre-requisitos
Leer obligatoriamente:
- `docs/frontend/backend-contract.md`
- `docs/frontend/frontend-architecture.md`
- `docs/frontend/frontend-state.md`
- `docs/frontend/frontend-workflows.md`
- `docs/frontend/frontend-validation.md`

Confirmar: endpoint exacto, método HTTP, DTO request/response, códigos/errores.

## Flujo 1. Análisis
- Identificar feature/flujo
- Listar entidades/value-objects necesarios
- Definir puertos (interfaces) en `domain/repositories/`
- Detectar endpoints involucrados (no inventar)

## Flujo 2. Diseño por capas
- `domain/` → entity, value-object, errors, repository interfaces (puertos)
- `infrastructure/` → dto, mapper, repository implementation, api-client, storage, schemas Zod
- `application/` → use-cases (puros). Solo llama puertos
- `presentation/` → hooks adaptadores, components, pages, routes, context

## Flujo 3. Implementación (adentro → afuera)
1. domain
2. infrastructure (DTOs/mappers/impl)
3. application (use-case)
4. presentation (hook + UI)

## Flujo 4. Requisitos UI/Estados
- Estados: `idle/loading/success/error/empty`
- Bloquear doble envío
- Tras mutación exitosa → refrescar datos confirmados (no optimista)
- Validación alineada backend
- No exponer token/JWT/HTTP a componentes

## Flujo 5. Validación & Auditoría
Ejecutar:
```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Revisar arquitectura con `reviewer`. Corregir hallazgos mínimos.

## Reglas duras
- Sin Axios/localStorage en `presentation`
- Sin React en `domain/application`
- Sin inventar contratos API
- Sin `any` sin justificación
- Regla de dependencia unidireccional
