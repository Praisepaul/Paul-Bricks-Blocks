# Paul Bricks & Blocks — Architecture

## Purpose
A mobile-first, installable PWA for simple business management. The system is designed for a small bricks/blocks business and must remain easy for a non-technical owner to use.

## Initial stack direction
- Frontend: React + TypeScript + Vite
- PWA: Vite PWA tooling
- Backend: managed Postgres/Auth/Storage platform (provider to be finalized before implementation)
- Authentication: email/password or another simple secure sign-in flow
- Authorization: role-based access enforced by the backend

## Application areas
1. Dashboard
2. Sales and invoices
3. Purchases and expenses
4. Stock
5. Labour
6. Bills and recurring expenses
7. History / audit
8. Users and business settings (owner only)

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
  app/          Application shell, routing, providers
  components/   Shared UI components
  features/     Business features grouped by domain
  lib/          Infrastructure and shared helpers
  types/        Shared TypeScript types
public/         PWA/static assets
docs/           Living architecture and business documentation
```

## Change discipline
Before changing code, inspect the latest `main` and relevant feature branch code. Preserve existing filenames and public function names unless there is a documented reason to change them. Update the living documentation whenever architecture, permissions, business rules, or data structures change.
