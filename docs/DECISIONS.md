# Architecture Decisions

## ADR-001 — Mobile-first PWA
**Decision:** Build the application as an installable Progressive Web App.

**Reason:** The owner primarily needs a simple Android-friendly application without requiring a Play Store release.

## ADR-002 — React + TypeScript + Vite
**Decision:** Use React, TypeScript, and Vite for the frontend.

**Reason:** This keeps the JavaScript ecosystem requested by the project while giving us strong typing and a straightforward development workflow.

## ADR-003 — Backend-enforced RBAC
**Decision:** Authorization must be enforced by the backend/database, not only by frontend controls.

**Reason:** The application is multi-user and financial records must not depend on UI trust.

## ADR-004 — Soft deletion for important records
**Decision:** Prefer soft deletion for important financial/business records.

**Reason:** The owner needs recovery and the audit history must remain meaningful.

## ADR-005 — Keep GST-ready, not GST-heavy
**Decision:** Design the data model for future GST support without implementing every GST rule in the foundation phase.

**Reason:** Requirements and applicable rules should be verified when GST functionality is actually implemented.

## ADR-006 — Managed backend
**Decision:** Prefer a managed backend providing authentication, relational database, row-level authorization, and file storage.

**Reason:** This is a small multi-user business application and should avoid unnecessary server operations and maintenance. The exact provider will be finalized before backend implementation.
