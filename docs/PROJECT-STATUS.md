# Project Status

## Current phase
**Phase 2 — Money: Sales foundation**

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

## Current branch
`main`

## Current module
**Sales** — ready for local verification.

## Sales scope in this first version
- Owners and partners can create sales.
- Only active customers and active products can be selected.
- Product selling price is prefilled but can be changed for a specific sale.
- Historical sales keep customer/product names, unit, quantity and final sale price.
- Invoice numbers are generated automatically as `INV-YYYYMMDD-XXXXXX`.
- Stock, payments, GST calculation, PDF/printing and invoice sharing are intentionally not included yet.

## Next module
After Sales is verified, build **Purchases**. That will give us the second side of the money flow and prepare the clean foundation for stock movements.

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
