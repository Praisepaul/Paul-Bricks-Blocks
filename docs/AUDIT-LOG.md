# Audit Log

The audit log answers three questions for important business actions:

1. Who did it?
2. What happened?
3. When did it happen?

## Rules
- Audit events are append-only.
- Normal users cannot edit or delete audit events.
- Every create, update, and delete of important business records creates an audit event.
- Updates should retain enough information to understand what changed.
- Deletes are recorded even when the underlying record is soft-deleted.
- Audit timestamps are stored in UTC and displayed in the user's local time.

## Event shape
The eventual database model should contain at least:

- `id`
- `actor_user_id`
- `action`
- `entity_type`
- `entity_id`
- `occurred_at`
- `before_data` (nullable)
- `after_data` (nullable)
- `metadata` (nullable)

## Initial action names
- `SALE_CREATED`
- `SALE_UPDATED`
- `SALE_DELETED`
- `PURCHASE_CREATED`
- `PURCHASE_UPDATED`
- `PURCHASE_DELETED`
- `EXPENSE_CREATED`
- `EXPENSE_UPDATED`
- `EXPENSE_DELETED`
- `PAYMENT_CREATED`
- `PAYMENT_UPDATED`
- `PAYMENT_DELETED`
- `LABOUR_CREATED`
- `LABOUR_UPDATED`
- `LABOUR_DELETED`
- `BILL_CREATED`
- `BILL_UPDATED`
- `BILL_DELETED`
- `USER_CREATED`
- `USER_UPDATED`

The exact event catalog may grow as features are implemented.
