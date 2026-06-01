# LaunchCart MVP

Next.js frontend + Express backend for LaunchCart.

## Local development

1. Copy env template:

```bash
cp .env.example .env
```

2. Fill Supabase values in `.env`.

3. Run with Docker:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend health: http://localhost:4000/health

## Deploy

### Backend on Render

This repo includes `render.yaml` for a Docker web service using `backend/` as `rootDir`.

Set Render environment variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
- `CORS_ORIGIN` = your Vercel frontend URL, e.g. `https://launchcart.vercel.app`

Health check path: `/health`.

### Frontend on Vercel

Set Vercel environment variable:

- `NEXT_PUBLIC_API_BASE_URL` = your Render backend URL, e.g. `https://launchcart-backend.onrender.com`

Vercel config is in `vercel.json`.
# Trigger CI
