# Supabase setup for Birdhouse

## 1. Apply the migration

In the [Supabase SQL Editor](https://supabase.com/dashboard), paste and run
these files in order:

`supabase/migrations/20260713000000_init.sql`

`supabase/migrations/20260720000000_recent_moments_fifo.sql`

Or with the CLI (if installed and linked):

```bash
supabase db push
```

This creates:

- `species` + `observations` tables
- indexes
- RLS: public **read**, service-role **write** (service role bypasses RLS)
- `bird-images` storage bucket (public read)
- Realtime publication on `observations`
- atomic five-item FIFO for recognized-bird images

## 2. Frontend env

Copy `.env.example` → `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Redeploy / restart `npm run dev` so `next.config` picks up the image host.

## 3. Inference service env (Railway)

Use the **service role** key (server-side only):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

See `inference-service/.env.example`.
