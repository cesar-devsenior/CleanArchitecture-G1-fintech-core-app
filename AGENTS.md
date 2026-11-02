# Fintech Core Monorepo

## Structure

- `backend/`: Express, TypeScript, Prisma and PostgreSQL API.
- `frontend/`: React/Vite client served by Nginx.
- `docker-compose.yml`: local orchestration for PostgreSQL, backend and frontend.

## Validation

Backend:

```bash
cd backend
pnpm test --run
pnpm build
```

Frontend:

```bash
cd frontend
pnpm test --run
pnpm build
```

Infrastructure:

```bash
docker compose config
docker compose build
docker compose up -d
curl http://localhost:3001/health
```

## Rules

- Never commit `.env` files or secrets.
- Keep database migrations in `backend/prisma/migrations`.
- Run `prisma migrate deploy` only when the backend container starts.
- Validate authorization on the backend, not only in the frontend.
- Every financial behavior change must include relevant tests.
- Review `git diff` before committing.
