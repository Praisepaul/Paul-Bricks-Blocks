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

## Current branch
`main`

## Current module
**Bills / recurring expenses** — ready for local verification.

## Bills scope in this first version
- Owners and partners can create and view bills.
- Bill name, category, amount and bill date are required; due date and notes are optional.
- Bills are unpaid by default and can be marked paid with today's business date.
- Bill numbers are generated automatically as `BILL-YYYYMMDD-XXXXXX`.
- Bills are a simple obligation/recurring-cost register. Marking a bill paid does not yet create an expense/payment transaction, preventing accidental double-counting.

## Next module
After Bills is verified, build **History + dashboard totals**. Stock will then be designed from verified Sales + Purchases transactions rather than adding stock quantity to Products.

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
