# Project Status

## Current phase
**Phase 3 — Documents + GST/accounting foundation**

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
- Owner-only business settings.
- Customers and products with MongoDB persistence and audit events.
- Sales, purchases, expenses, labour and bills with server-side totals and audit events.
- Unified History and live Dashboard.
- Stock calculated from purchases minus sales plus explicit stock movements.
- Printable sales invoices and browser Save-as-PDF flow.
- Invoice sharing through native device sharing with clipboard fallback.
- GST foundation: business state, customer state, business default GST rate, GST-aware sales, and invoice CGST/SGST or IGST breakdown when state data is available.
- Accounting foundation: dashboard sales-before-GST, GST collected, purchases, and expenses/labour transaction snapshot.

## Current branch
`main`

## Current module
**GST + accounting foundation** — ready for local verification.

## GST design boundary
- GST rate is explicitly selected on each sale, starting from the business default rate.
- Server calculates tax; the browser only previews it.
- Same-state business/customer with GST rate > 0 produces CGST + SGST.
- Different or unavailable state information produces IGST when a GST rate is applied.
- Existing historical sales remain valid; records created before GST fields existed are treated as zero-tax for reporting compatibility.
- This is a calculation/invoice foundation, not a claim that the application is a complete GST-compliance or filing system.

## Accounting design boundary
- The dashboard provides transaction-level accounting snapshots.
- It deliberately does **not** calculate accounting profit, COGS, receivables, payables, or GST filing liability yet.
- Stock valuation and formal books should be added before presenting a number as final profit.
- Bills remain obligations; marking a bill paid does not create an expense/payment transaction, preventing accidental double-counting.

## Next module
Verify GST calculations and invoice output locally. Then build a proper transaction/report period view before adding advanced GST filing features.

## Planned phases
1. Foundation: authentication, users, RBAC, database, business settings, customers, products, dashboard, audit framework.
2. Money: sales, invoices, purchases, expenses, labour, payments, customers/suppliers.
3. Documents: invoice/PDF, print, Android sharing, attachments.
4. Stock.
5. Labour improvements / worker management.
6. Reports/dashboard improvements.
7. GST functionality and accounting/reporting.

## Important rule
This document is a living status record. Update it whenever a phase or major architectural decision changes.
