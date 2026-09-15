# Project Status

## Current phase
**Phase 3 — Documents + business usability**

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
- Stock: current stock calculated from all purchases minus all sales plus manual opening/correction movements.
- Stock: opening stock and simple add/remove correction workflow with audit events.
- Printable sales invoices using business settings, customer details and sale information.
- Invoice sharing: native device share when supported, with clipboard fallback for easy WhatsApp/manual sharing.

## Current branch
`main`

## Current module
**Invoice sharing** — ready for local verification.

## Invoice scope
- Each recent sale has a **Print invoice** action.
- Each recent sale has a **Share invoice** action.
- Invoice uses the existing generated invoice number.
- Invoice shows business name, address, phone and GST number when configured.
- Invoice shows current customer contact/address/GST details when available.
- Invoice shows product, quantity, unit price and total.
- Browser print is used deliberately for v1; the user can choose “Save as PDF” from the normal print dialog without adding a heavy PDF dependency yet.
- Share uses the browser/device Web Share API when available.
- When native sharing is unavailable, invoice details are copied to the clipboard for easy pasting into WhatsApp or another app.
- Authenticated partners can read business settings because those settings are needed for invoice output; only owners can change them.

## Important accounting boundary
Sales and purchases remain the source transactions for money and quantity. Stock is derived from their quantities plus explicit stock movements. Bills remain obligations and marking a bill paid does not create an expense/payment transaction, preventing accidental double-counting.

## Next module
Verify invoice sharing locally, then continue with practical document usability before adding advanced GST or accounting complexity.

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
