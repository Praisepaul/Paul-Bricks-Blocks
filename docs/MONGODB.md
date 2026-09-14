# MongoDB Development Notes

## Stack
- Frontend: React + TypeScript + Vite + PWA
- Backend: Node.js + Express + TypeScript
- Database: MongoDB
- Authentication: JWT issued by the Node API
- Password hashing: bcryptjs

## Collections
- `users` — owner and partner accounts
- `audit_events` — append-only history of important actions
- Future collections will cover customers, products, sales, sale line items, purchases, expenses, labour and bills.

## Local development
The API reads its configuration from `server/.env`.
Copy `server/.env.example` and provide a MongoDB connection string and a long JWT secret.

The web app reads `VITE_API_URL` from the root `.env`.

## Security rules
- MongoDB credentials never go into the React app.
- The browser talks only to the Node API.
- The API validates authentication and role permissions.
- Partner accounts do not receive delete permission.
- Important business records will use soft deletion and immutable audit events.

## Why this structure
This is intentionally a familiar MERN-style application: React talks to an Express API, and the API talks to MongoDB. It keeps the system understandable while leaving room for the business modules we need later.
