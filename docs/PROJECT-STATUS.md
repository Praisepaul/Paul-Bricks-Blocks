# Project Status

## Current phase
**Phase 2 — Money + Labour foundation**

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
- Labour: worker + optional work description + amount + business date + generated labour number + recent labour payments list.
- Labour creation audit events and MongoDB indexes.

## Current branch
`main`

## Current module
**Labour** — ready for local verification.

## Labour scope in this first version
- Owners and partners can create labour payment records.
- Worker name and amount are required; work description is optional.
- Labour date is stored separately from the system creation timestamp.
- Labour numbers are generated automatically as `LAB-YYYYMMDD-XXXXXX`.
- Labour records are payment records only; attendance, worker master records, advances, daily-rate calculations and reports are intentionally not included yet.

## Next module
After Labour is verified, improve **Bills / recurring expenses** and then build **History + dashboard totals**. Stock will be designed from verified Sales + Purchases transactions rather than adding stock quantity to Products.

## Planned phases
1. Foundation: authentication, users, RBAC, database, business settings, customers, products, dashboard, audit framework.
2. Money: sales, invoices, purchases, expenses, labour, payments, customers/suppliers.
3. Documents: invoice/PDF, print, Android sharing, attachments.
4. Stock.
5. Labour improvements / worker management.
6. Reports/dashboard improvements.
7. GST functionality.

## Important rule
This document is a living status record. Update it whenever a phase or major architectural decision changes.
