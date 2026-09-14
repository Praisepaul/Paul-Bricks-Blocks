# Supabase setup

The Supabase project will provide authentication, PostgreSQL persistence, row-level security, and file storage.

Before local development, create a Supabase project and provide the frontend with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` through local environment configuration.

Database migrations are kept under `supabase/migrations/` and should be applied in order.

Never commit service-role keys or other privileged credentials.
