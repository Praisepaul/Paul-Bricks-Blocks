# Phase 1B — Authentication & Security Foundation

## Implemented
- Supabase JavaScript client with persistent browser sessions.
- Authentication service functions in `src/lib/auth/auth.ts`.
- Session/user state provider in `src/lib/auth/AuthProvider.tsx`.
- Owner/Partner role types in `src/types/auth.ts`.
- Shared permission helpers in `src/lib/auth/permissions.ts`.
- Sign-in, loading, inactive-account, and configuration screens in `src/app/App.tsx`.
- Supabase foundation tables for `profiles` and `audit_events`.
- Row-level security policies for profiles and audit events.
- Automatic profile creation when a Supabase Auth user is created.

## Security notes
- Only the Supabase anonymous/public client key belongs in the browser.
- Never commit a Supabase service-role key.
- Partner deletion is denied by the application permission model and must also be denied by backend policies for business tables.
- Audit events are intended to be append-only for application users.

## Local environment
The frontend expects these Vite variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Set them in the local environment without committing secret values.

## Next security work
Before business transactions are added, verify the migration in a real Supabase project and add the final transaction-level RLS policies as each business table is introduced.
