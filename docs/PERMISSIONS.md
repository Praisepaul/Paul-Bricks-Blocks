# Permissions

## Roles

### Owner — Dad
The owner has maximum application permissions.

- View business data
- Create records
- Edit records
- Delete records
- View audit history
- Manage users
- Manage business settings
- Generate and manage bills/invoices
- Upload proofs/documents
- Manage labour and stock

### Partner
The partner can operate the business but cannot delete records.

- View business data
- Create records
- Edit records
- **Cannot delete records**
- View audit history (read-only)
- Cannot manage users
- Cannot change protected business settings
- Generate and manage bills/invoices
- Upload proofs/documents
- Manage labour and stock

## Enforcement
Permissions must be enforced server-side/database-side. A hidden or disabled frontend button is not security.

For important financial records, deletion should normally be implemented as a soft-delete state so recovery and audit remain possible.

## Future roles
Do not add roles until a real business requirement exists. Keep the permission model small and understandable.
