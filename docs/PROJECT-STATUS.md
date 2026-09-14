# Project Status

## Current phase
**Phase 1B — MERN/MongoDB foundation**

## Completed
- React + TypeScript + Vite PWA scaffold.
- Owner/Partner permission model documented.
- Audit-log principles documented.
- Node.js + Express + TypeScript API foundation.
- MongoDB connection and indexes.
- JWT login/session foundation.
- bcrypt password hashing.
- One-time owner bootstrap endpoint for first local setup.
- MERN frontend-to-API authentication wiring.
- Owner user management and Partner accounts.
- Owner-only business settings for business name, phone, address, optional GST number and INR currency.
- Supabase foundation removed because it was not merged.

## Current branch
`main`

## Next phase
Build the first real business module: customers, products, sales, sale line items, payments and invoice-number foundation, with backend-enforced owner/partner permissions and audit events.

## Planned phases
1. Foundation: authentication, users, RBAC, database, business settings, dashboard, audit framework.
2. Money: sales, invoices, purchases, expenses, payments, customers/suppliers.
3. Documents: invoice/PDF, print, Android sharing, attachments.
4. Stock.
5. Labour.
6. Reports/dashboard improvements.
7. GST functionality.

## Important rule
This document is a living status record. Update it whenever a phase or major architectural decision changes.
