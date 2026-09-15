# Project Status

## Current phase
**Phase 2 — Money: Sales + Purchases + Expenses foundation**

## Completed
- React + TypeScript + Vite PWA scaffold.
- Owner/Partner permission model.
- Audit-log foundation.
- Node.js + Express + TypeScript API foundation.
- MongoDB connection and indexes.
- JWT login/session foundation.
- bcrypt password hashing.
- One-time owner bootstrap endpoint for first local setup.
- MERN frontend-to-API authentication wiring.
- Owner user management and Partner accounts.
- Owner-only business settings for business name, phone, address, optional GST number and INR currency.
- Customers: list, add, edit, enable/disable, MongoDB persistence and audit events.
- Products / Brick Types: list, add, edit, enable/disable, MongoDB persistence and audit events.
- Sales: customer + product + quantity + price + server-calculated total + generated invoice number + recent sales list.
- Sales creation audit events and MongoDB indexes.
- Purchases: supplier + product + quantity + purchase price + server-calculated total + generated purchase number + recent purchases list.
- Purchase creation audit events and MongoDB indexes.
- Expenses: category + optional description + amount + business date + server-calculated amount + generated expense number + recent expenses list.
- Expense creation audit events and MongoDB indexes.

## Current branch
`main`

## Current module
**Expenses** — ready for local verification.

## Expense scope in this first version
- Owners and partners can create expenses.
- Category and amount are required; description is optional.
- Expense date is stored separately from the system creation timestamp.
- Starter categories are Electricity, Transport, Diesel, Repairs, Office, Rent and Other.
- Expense numbers are generated automatically as `EXP-YYYYMMDD-XXXXXX`.
- Expenses are money records only; reports, payments, attachments and GST treatment are intentionally not included yet.

## Next module
After Expenses is verified, move to **Labour**, then return to the money/history/dashboard improvements as needed. Stock will be designed from verified Sales + Purchases transactions rather than adding stock quantity to Products.

## Planned phases
1. Foundation: authentication, users, RBAC, database, business settings, customers, products, dashboard, audit framework.
2. Money: sales, invoices, purchases, expenses, payments, customers/suppliers.
3. Documents: invoice/PDF, print, Android sharing, attachments.
4. Stock.
5. Labour.
6. Reports/dashboard improvements.
7. GST functionality.

## Important rule
This document is a living status record. Update it whenever a phase or major architectural decision changes.
