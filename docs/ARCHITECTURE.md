# Paul Bricks & Blocks — Architecture

## Purpose
A mobile-first, installable PWA for simple business management. The system is designed for a small bricks/blocks business and must remain easy for a non-technical owner to use.

## Current stack
- Frontend: React + TypeScript + Vite
- PWA: Vite PWA tooling
- Backend: Node.js + Express + TypeScript
- Database: MongoDB
- Authentication: WebAuthn/passkeys as the primary login method, with JWT sessions and email/password fallback
- Password hashing: bcryptjs
- Authorization: role-based access enforced by the Node API
- Document storage: MongoDB GridFS

## Application areas
1. Dashboard with quick actions
2. Customers
3. Suppliers
4. Products / brick types
5. Sales and invoices
6. Purchases and expenses
7. Stock
8. Labour
9. Bills and payments
10. Documents / attachments
11. History / audit
12. Users and business settings (owner only)

## Current data areas
- `users`: owner and partner accounts.
- `passkeys`: WebAuthn public credentials linked to users. Private passkey material never enters the application database.
- `webauthn_challenges`: short-lived one-time registration/authentication challenges with MongoDB TTL cleanup.
- `audit_events`: immutable activity records.
- `business_settings`: one business profile document identified by `_id: "business"`.
- `customers`: customer master records with contact details, optional GST number, active status and timestamps.
- `suppliers`: supplier master records with name, contact details, GSTIN, state and active status.
- `products`: product/brick-type master records with unit, selling price, purchase price and active status.
- `sales`: completed sales with generated invoice number, customer/product snapshots, quantity, sale price, total and creator.
- `purchases`: purchase records with generated purchase number, supplier ID/name/state snapshots, product snapshot, quantity, purchase price, total and creator.
- `expenses`: business expense records with generated expense number, category, optional description, amount, business date and creator.
- `labour`: worker payment records with generated labour number, worker name, optional work description, amount, business date and creator.
- `bills`: bill records with generated bill number, title, category, amount, bill date, optional due date, paid status/date, optional notes and creator.
- `payments`: customer receipts, supplier payments and bill settlements.
- `stock_movements`: manual opening-stock and stock-correction entries. Purchase and sale quantities are read directly from their transaction records when calculating current stock.
- `attachments.files` / `attachments.chunks`: MongoDB GridFS storage for business documents and images. File metadata links each attachment to an application record.

## Authentication and permissions
- Passkeys are the primary sign-in method. They use WebAuthn discoverable credentials with user verification required.
- Email/password remains available as a fallback so a user is not locked out when passkey access is unavailable.
- Any active owner or partner can register a passkey for their own account after signing in.
- Passkey authentication is usernameless: the authenticator identifies the registered credential, then the server maps that credential to the internal user account.
- Passkey challenges are short-lived and one-time; MongoDB TTL indexes remove expired challenge records automatically.
- The server verifies both the expected origin and relying-party ID. Local development uses `localhost`; production must set `PASSKEY_RP_ID` and `PASSKEY_ORIGIN` to the deployed HTTPS domain/origin.
- Owner: full business administration, including users and settings.
- Partner: day-to-day business operations such as customers, suppliers, products, sales, purchases, expenses, labour, bills, payments and stock.
- Backend authorization is authoritative; frontend visibility is only a usability feature.
- Documents use the same authenticated business boundary. Any active user can view attachments; deletion is limited to the owner or the user who uploaded the attachment.

## Quick actions / usability
The Home screen provides one-tap navigation to the most common tasks: new sale, purchase, customer, supplier, product, stock, expense, labour, bill and document attachment.
- Quick actions only change the active screen; existing forms remain the single source of truth for saving records.
- No duplicate quick-add API is introduced, which keeps business rules centralized in the existing modules.
- The goal is minimum typing and obvious actions rather than a complex workflow engine.

## Customers
Authenticated owners and partners can create, view, edit and enable/disable customers through `/api/customers`. Customer records are not physically deleted because future sales may reference them. Customer create/update actions are recorded in the audit log.

## Suppliers
Authenticated owners and partners can create, view, edit and enable/disable suppliers through `/api/suppliers`.
- Supplier identity is a dedicated MongoDB record with name, phone, address, GSTIN, state and active status.
- New purchases and supplier payments reference the supplier ID while retaining readable name/state snapshots.
- Historical purchases/payments without supplier IDs remain valid and are matched by supplier name where needed.
- Disabling a supplier prevents new purchases/payments from selecting it while preserving history.

## Products / brick types
Authenticated owners and partners can create, view, edit and enable/disable products through `/api/products`. Each product has a name, selling unit, selling price and purchase price. Prices are stored as non-negative numbers in INR. Stock quantity is deliberately not part of this master record; stock is derived from transactions plus explicit stock movements.

## Sales
Authenticated owners and partners can create and view sales through `/api/sales`.
- A sale requires an active customer, active product, positive quantity and non-negative unit price.
- The product's current selling price is used to prefill the frontend, but the final sale price is stored on the sale so later price changes do not rewrite old sales.
- The server generates a unique invoice number in the form `INV-YYYYMMDD-XXXXXX`.
- Customer name, product name and unit are snapshotted into the sale for stable historical display.
- Total is calculated on the server and rounded to two decimal places.
- Sales quantities are used by Stock as stock-out quantities.
- Sale creation is recorded in `audit_events`.

## Purchases
Authenticated owners and partners can create and view purchases through `/api/purchases`.
- A purchase requires an active supplier when a supplier ID is supplied, active product, positive quantity and non-negative unit price.
- The product's current purchase price is used to prefill the frontend, while the final purchase price is stored on the purchase for historical accuracy.
- The server generates a unique purchase number in the form `PUR-YYYYMMDD-XXXXXX`.
- Product name and unit are snapshotted into the purchase.
- Total is calculated on the server and rounded to two decimal places.
- Purchases record the money transaction, and their quantities are used by Stock as stock-in quantities.
- Purchase creation is recorded in `audit_events`.
- Legacy purchases may remain name-based for compatibility.

## Stock
Authenticated owners and partners can view current stock through `/api/stock` and record opening stock or corrections through `/api/stock/adjustments`.
- Stock is intentionally not stored as a mutable quantity on the Product master.
- Current quantity is calculated as **all purchase quantity - all sale quantity + all manual stock movement quantity** for each product.
- Manual stock movements are signed quantities: adding stock stores a positive quantity and removing stock stores a negative quantity.
- Opening stock can only add quantity; corrections can add or remove quantity.
- Added stock stores an explicit unit cost so weighted-average valuation remains meaningful.
- Sales and stock removals cannot reduce stock below zero.
- The stock screen shows available quantity before a correction is saved.

## Documents / attachments
Authenticated owners and partners can manage business documents through `/api/attachments` and the Documents screen.
- Supported record types are `customer`, `supplier`, `product`, `sale`, `purchase`, `expense` and `bill`.
- Uploads use a simple JSON/base64 request from the browser and are stored in a MongoDB GridFS bucket named `attachments`.
- GridFS metadata stores `entityType`, `entityId` and `uploadedByUserId` so the file remains linked to the exact business record.
- Files are limited to 5 MB each to keep the simple upload path reliable.
- The UI accepts common images, PDFs and office/text documents.
- Authenticated users can open documents. Owners or the uploader can delete them.
- Attachment create/delete operations are recorded in `audit_events`.
- The Documents page is intentionally centralized instead of duplicating upload controls across every transaction screen.
- This is document storage, not OCR, e-invoicing, automatic document classification or a full document-management suite.

## Expenses
Authenticated owners and partners can create and view expenses through `/api/expenses`.
- An expense requires a category, positive amount and business date in `YYYY-MM-DD` format.
- Description is optional and is intended for a short note such as the reason for the expense.
- The frontend offers simple starter categories: Electricity, Transport, Diesel, Repairs, Office, Rent and Other. The backend keeps category as text so the list can evolve without a migration.
- The server generates a unique expense number in the form `EXP-YYYYMMDD-XXXXXX`.
- The business date is stored separately from `createdAt`.
- Amount is rounded to two decimal places on the server.
- Expense creation is recorded in `audit_events`.

## Labour
Authenticated owners and partners can create and view labour payments through `/api/labour`.
- A labour payment requires a worker name, positive amount and business date in `YYYY-MM-DD` format.
- Work description is optional.
- The server generates a unique labour number in the form `LAB-YYYYMMDD-XXXXXX`.
- The business date is stored separately from `createdAt`.
- Amount is rounded to two decimal places on the server.
- Labour creation is recorded in `audit_events`.

## Bills / recurring expenses
Authenticated owners and partners can create and view bills through `/api/bills`, and mark an unpaid bill as paid.
- A bill requires a name, category, positive amount and bill date in `YYYY-MM-DD` format.
- Due date and notes are optional; due date cannot be before the bill date.
- The server generates a unique bill number in the form `BILL-YYYYMMDD-XXXXXX`.
- Bills default to unpaid and can be marked paid with a business paid date.
- Marking a bill paid records a payment settlement rather than creating a duplicate expense.

## Design principles
- Mobile first.
- Large, obvious actions.
- Plain language.
- Minimum typing.
- Financial records are never silently destroyed.
- Important records use soft deletion where appropriate.
- Audit events are immutable.
- Financial calculations stay authoritative on the backend.
- Passkeys should feel like the normal login; passwords are the fallback.
- Keep document storage centralized and reusable.
- Defer advanced features that do not make daily data entry easier.

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
