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
- `customers`: customer records with contact details, optional GST number, active status and timestamps.

## Customers
Customers are available to authenticated owners and partners through `/api/customers`.
- Anyone signed in can view customers.
- Owners and partners can create and edit customers.
- Customers are soft-disabled with `isActive: false` rather than deleted.
- Customer create/update actions are recorded in the audit log.
- The frontend keeps the workflow simple: add, edit, enable/disable, and view.

## Business settings
The owner can maintain the business name, phone number, address, optional GST number, and currency. Currency is currently fixed to INR so future financial modules have a clear default. Settings are served by `/api/settings` and protected by the existing authentication and owner authorization rules.

## Design principles
- Mobile first.
- Large, obvious actions.
- Plain language.
- Minimum typing.
- Financial records are never silently destroyed.
- Important records use soft deletion where appropriate.
- Audit events are immutable.
- Backend authorization is authoritative; frontend visibility is only a usability feature.
- GST-ready data structures without prematurely implementing every GST rule.

## Project structure
```text
src/
  app/          Application shell and screens
  components/   Shared UI components
  lib/          Frontend API helpers and shared infrastructure
  types/        Shared TypeScript types
server/
  src/          Express API, MongoDB connection, auth, middleware and routes
public/         PWA/static assets
docs/           Living architecture and business documentation
```

## Change discipline
Before changing code, inspect the latest `main` and relevant feature branch code. Preserve existing filenames and public function names unless there is a documented reason to change them. Update the living documentation whenever architecture, permissions, business rules, or data structures change.
