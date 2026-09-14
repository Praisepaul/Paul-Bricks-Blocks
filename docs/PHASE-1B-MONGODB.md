# Phase 1B — MongoDB + MERN Foundation

This replaces the unmerged Supabase authentication foundation with a simple MERN-style backend.

## Implemented
- React PWA remains the frontend.
- Node.js + Express + TypeScript API added under `server/`.
- MongoDB connection and indexes added.
- JWT authentication added.
- bcrypt password hashing added.
- Owner and partner roles preserved.
- Partner has view/create/edit permissions; owner also has delete and management permissions.
- Audit events are stored in MongoDB.
- First owner account can be created once through the protected-by-empty-database bootstrap route.

## API foundation
- `GET /api/health`
- `POST /api/auth/bootstrap-owner` — first setup only
- `POST /api/auth/login`
- `GET /api/auth/me`

## Local setup
1. Install MongoDB locally or use a MongoDB Atlas database.
2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` and `JWT_SECRET`.
3. Copy the root `.env.example` to `.env` and keep `VITE_API_URL=http://localhost:4000/api` for local development.
4. From `server/`, run `npm install` and `npm run dev`.
5. From the project root, run `npm install` and `npm run dev`.

No Python backend is used.
