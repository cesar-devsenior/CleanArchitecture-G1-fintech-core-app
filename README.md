# Fintech Core — proyecto académico

Aplicación full stack trabajada y desarrollada individualmente como proyecto académico. La construí en mi computadora siguiendo las lecciones del curso y dediqué tiempo adicional, después de clase, a comprender cómo funciona, estudiar su arquitectura e investigar las tecnologías utilizadas.

Este repositorio parte de [CleanArchitecture-G1-fintech-core-app](https://github.com/cesar-devsenior/CleanArchitecture-G1-fintech-core-app), material base del curso. La relación de fork y la atribución al proyecto original se conservan para dejar claro el origen del código y el contexto de aprendizaje.

> **Estado:** proyecto académico de demostración para ejecución local. No se presenta como un sistema bancario auditado ni listo para producción.

## Tecnologías

- **Backend:** Node.js, Express, TypeScript y Prisma.
- **Frontend:** React y Vite, servido por Nginx.
- **Base de datos:** PostgreSQL.
- **Contenedores:** Docker y Docker Compose.

## Estructura

- `backend/`: API REST.
- `frontend/`: aplicación web.
- `docker-compose.yml`: servicios locales de PostgreSQL, backend y frontend.

## Requisitos

- Docker y Docker Compose.
- Git para clonar el repositorio.

## Ejecución local

1. Clone este repositorio y entre a su carpeta.
2. Copie el archivo de ejemplo de variables:

   ```bash
   cp .env.example .env
   ```

3. Revise y configure los valores de `.env` para su equipo. No publique secretos reales.
4. Valide la configuración y levante los servicios:

   ```bash
   docker compose config
   docker compose up -d --build
   docker compose ps
   ```

URLs locales configuradas:

- Frontend: http://localhost:8081
- Backend: http://localhost:3001
- Health check: http://localhost:3001/health
- PostgreSQL: localhost:5434

Para revisar registros:

```bash
docker compose logs -f backend
docker compose logs -f postgres-db
```

Para detener los servicios:

```bash
docker compose down
```

Para borrar también los datos del volumen local de PostgreSQL:

```bash
docker compose down -v
```

## Pruebas y compilación

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

## Alcance

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

El objetivo del proyecto fue aprender y comprender el funcionamiento de una aplicación full stack, su arquitectura y el uso de Docker Compose para ejecutarla localmente. Antes de usar cualquier configuración fuera de un entorno local, se deben revisar seguridad, secretos, migraciones, permisos, monitoreo y pruebas.
