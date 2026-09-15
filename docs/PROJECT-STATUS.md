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
- Bills: bill name + category + amount + bill date + optional due date/notes + generated bill number + unpaid/paid status + mark-paid action.
- Bill creation and payment-status audit events and MongoDB indexes.
- Unified History: recent sales, purchases, expenses, labour and bills with simple type filters.
- Live Dashboard totals: today's sales, purchases, expenses + labour, and pending bills.

## Current branch
`main`

## Current module
**History + dashboard totals** — ready for local verification.

## History scope
- Owners and partners can view a combined recent transaction timeline.
- History currently includes sales, purchases, expenses, labour and bills.
- Simple filters keep the screen easy to use on a phone.
- The backend remains authoritative and returns a maximum of 200 combined recent records.

## Dashboard scope
- Today's sales and purchases are calculated from transaction creation time.
- Today's expenses and labour use their business dates.
- Pending bills show both total amount and count.
- Dashboard values are loaded from the backend rather than hard-coded.

## Important accounting boundary
Sales and purchases currently remain money records without stock mutation. Bills remain obligations and marking a bill paid does not create an expense/payment transaction yet, preventing accidental double-counting. Stock will be designed from verified Sales + Purchases transactions.

## Next module
After History + dashboard totals are verified, design **Stock** around purchase and sale movements. Do not add stock quantity directly to the Product master.

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
