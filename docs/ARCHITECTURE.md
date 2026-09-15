# Paul Bricks & Blocks — Architecture

## Purpose
A mobile-first, installable PWA for simple business management. The system is designed for a small bricks/blocks business and must remain easy for a non-technical owner to use.

## Current stack
- Frontend: React + TypeScript + Vite
- PWA: Vite PWA tooling
- Backend: Node.js + Express + TypeScript
- Database: MongoDB
- Authentication: JWT issued by the Node API
- Password hashing: bcryptjs
- Authorization: role-based access enforced by the Node API

## Application areas
1. Dashboard
2. Customers
3. Products / brick types
4. Sales and invoices
5. Purchases and expenses
6. Stock
7. Labour
8. Bills and recurring expenses
9. History / audit
10. Users and business settings (owner only)

## Current data areas
- `users`: owner and partner accounts.
- `audit_events`: immutable activity records.
- `business_settings`: one business profile document identified by `_id: "business"`.
- `customers`: customer master records with contact details, optional GST number, active status and timestamps.
- `products`: product/brick-type master records with unit, selling price, purchase price and active status.
- `sales`: completed sales with generated invoice number, customer/product snapshots, quantity, sale price, total and creator.
- `purchases`: purchase records with generated purchase number, supplier name, product snapshot, quantity, purchase price, total and creator.
- `expenses`: business expense records with generated expense number, category, optional description, amount, business date and creator.
- `labour`: worker payment records with generated labour number, worker name, optional work description, amount, business date and creator.

## Authentication and permissions
- Owner: full business administration, including users and settings.
- Partner: day-to-day business operations such as customers, products, sales, purchases, expenses and labour.
- Backend authorization is authoritative; frontend visibility is only a usability feature.

## Customers
Authenticated owners and partners can create, view, edit and enable/disable customers through `/api/customers`. Customer records are not physically deleted because future sales may reference them. Customer create/update actions are recorded in the audit log.

## Products / brick types
Authenticated owners and partners can create, view, edit and enable/disable products through `/api/products`. Each product has a name, selling unit, selling price and purchase price. Prices are stored as non-negative numbers in INR. Stock quantity is deliberately not part of this master record yet; stock will be introduced with purchase/sales transactions.

## Sales
Authenticated owners and partners can create and view sales through `/api/sales`.
- A sale requires an active customer, active product, positive quantity and non-negative unit price.
- The product's current selling price is used to prefill the frontend, but the final sale price is stored on the sale so later price changes do not rewrite old sales.
- The server generates a unique invoice number in the form `INV-YYYYMMDD-XXXXXX`.
- Customer name, product name and unit are snapshotted into the sale for stable historical display.
- Total is calculated on the server and rounded to two decimal places.
- Sales are currently informational money records; stock deduction, tax, payments and PDF invoices will be added in later phases.
- Sale creation is recorded in `audit_events`.

## Purchases
Authenticated owners and partners can create and view purchases through `/api/purchases`.
- A purchase requires a supplier name, active product, positive quantity and non-negative unit price.
- The product's current purchase price is used to prefill the frontend, while the final purchase price is stored on the purchase for historical accuracy.
- The server generates a unique purchase number in the form `PUR-YYYYMMDD-XXXXXX`.
- Product name and unit are snapshotted into the purchase.
- Total is calculated on the server and rounded to two decimal places.
- Purchases currently record the money transaction only; stock increases will be introduced through a dedicated stock movement design.
- Purchase creation is recorded in `audit_events`.
- Supplier is currently stored as a required text snapshot. A dedicated supplier master can be added later when supplier management becomes useful.

## Expenses
Authenticated owners and partners can create and view expenses through `/api/expenses`.
- An expense requires a category, positive amount and business date in `YYYY-MM-DD` format.
- Description is optional and is intended for a short note such as the reason for the expense.
- The frontend offers simple starter categories: Electricity, Transport, Diesel, Repairs, Office, Rent and Other. The backend keeps category as text so the list can evolve without a migration.
- The server generates a unique expense number in the form `EXP-YYYYMMDD-XXXXXX`.
- The business date is stored separately from `createdAt`, so an expense can be recorded later for the day it actually happened.
- Amount is rounded to two decimal places on the server.
- Expenses currently record the money transaction only; reports, payments, attachments and GST treatment will be added later.
- Expense creation is recorded in `audit_events`.

## Labour
Authenticated owners and partners can create and view labour payments through `/api/labour`.
- A labour payment requires a worker name, positive amount and business date in `YYYY-MM-DD` format.
- Work description is optional and is intended for a short note such as loading bricks, moulding blocks or delivery work.
- The server generates a unique labour number in the form `LAB-YYYYMMDD-XXXXXX`.
- The business date is stored separately from `createdAt`, so a payment can be recorded later for the day the work happened.
- Amount is rounded to two decimal places on the server.
- Labour currently records the payment only; worker master records, attendance, daily-rate calculations, advances and reports will be added only when they are useful.
- Labour creation is recorded in `audit_events`.

## Design principles
- Mobile first.
- Large, obvious actions.
- Plain language.
- Minimum typing.
- Financial records are never silently destroyed.
- Important records use soft deletion where appropriate.
- Audit events are immutable.
- Keep financial calculations on the backend authoritative.
- GST-ready data structures without prematurely implementing every GST rule.

## Project structure
```text
src/
  app/          Application shell and business screens
  components/   Shared UI components
  lib/          Frontend API helpers and shared infrastructure
  types/        Shared TypeScript types
server/
  src/          Express API, MongoDB connection, auth, middleware and routes
public/         PWA/static assets
docs/           Living architecture and business documentation
```

## Change discipline
Before changing code, inspect the latest `main` and relevant feature code. Preserve existing filenames and public function names unless there is a documented reason to change them. Update the living documentation whenever architecture, permissions, business rules, or data structures change.
