# Clean Architecture Fintech Core

Sistema full stack con Clean Architecture, PostgreSQL, Docker Compose y despliegue preparado para producción.

## Estructura

- `backend/`: API REST con Node.js, Express, TypeScript y Prisma.
- `frontend/`: aplicación React/Vite servida por Nginx.
- `docker-compose.yml`: PostgreSQL 18, backend y frontend.

## Ejecución local con Docker

Requisitos: Docker y Docker Compose.

```bash
cp .env.example .env
# Ajusta los secretos de .env para tu entorno
docker compose config
docker compose up -d --build
docker compose ps
```

URLs locales:

- Frontend: http://localhost:8081
- Backend: http://localhost:3001
- Health check: http://localhost:3001/health
- PostgreSQL: localhost:5434

Logs:

```bash
docker compose logs -f backend
docker compose logs -f postgres-db
```

Para detener los servicios sin borrar los datos:

```bash
docker compose down
```

Para borrar también el volumen local de PostgreSQL:

```bash
docker compose down -v
```

## Validación sin Docker

Backend:

```bash
cd backend
pnpm install
pnpm test --run
pnpm build
```

Frontend:

```bash
cd frontend
pnpm install
pnpm test --run
pnpm build
```

## Despliegue

El backend ejecuta `prisma migrate deploy` al iniciar el contenedor. La base de datos de producción debe estar disponible antes de iniciar el backend y los secretos deben configurarse en el proveedor de despliegue, nunca en el repositorio.

Antes de publicar:

1. Configurar `DATABASE_URL` y `JWT_SECRET` en producción.
2. Construir y probar las imágenes.
3. Verificar `/health`.
4. Confirmar que el frontend usa la URL pública del backend.
5. Revisar logs, permisos y migraciones.

## Estado del entregable

- Clean Architecture en backend y frontend.
- Pruebas automatizadas.
- Dockerfiles multi-etapa.
- PostgreSQL con volumen persistente.
- Healthchecks en Compose.
- Nginx configurado para React Router.

## Checklist de entrega académica

### Repositorio

- [ ] Publicar este repositorio con acceso al instructor.
- [ ] Confirmar que `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf` y `docker-compose.yml` estén visibles en GitHub.
- [ ] Confirmar que no se publique ningún archivo `.env` ni secreto.

### Producción

- [ ] Crear PostgreSQL administrado en el proveedor cloud.
- [ ] Configurar `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT` y `CLIENT_ORIGIN` en el backend.
- [ ] Confirmar en los logs del backend que `prisma migrate deploy` no deja migraciones pendientes.
- [ ] Publicar el backend y verificar `/health`.
- [ ] Construir el frontend con `VITE_API_URL` apuntando a la URL pública del backend.
- [ ] Probar registro, inicio de sesión y transacciones desde la URL pública del frontend.

### Evidencia para la plataforma académica

- [ ] Enlace al repositorio de GitHub.
- [ ] URL pública del frontend.
- [ ] URL pública del backend o endpoint `/health`.
- [ ] Video de 5 minutos con registro, login y transacciones financieras.
