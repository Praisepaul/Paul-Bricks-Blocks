# Business Rules

## Money
- Store monetary values using fixed-precision database numeric values, never JavaScript floating-point arithmetic as the source of truth.
- Every financial record has a clear date and status.
- Totals are derived from stored line items and rates and should be reproducible.

## Sales
A sale can contain one or more brick/block items. Each line records product, quantity, unit rate, and line total. Customer information is optional only where the business process permits it.

Every finalized sale receives a stable invoice/bill number.

## Purchases and expenses
Purchases and operating expenses are separate business concepts even when they both reduce cash. Proof documents can be attached.

## Documents
Documents may include photographs, screenshots, PDFs, receipts, or generated invoices. Storage permissions must follow the same business ownership and role rules as the record they belong to.

## Deletion
The partner cannot delete. The owner can delete, but important financial/business records should use soft deletion so history and recovery remain possible.

## GST readiness
The data model should leave room for GSTIN, HSN/SAC, tax rate, CGST, SGST, IGST, and invoice tax totals. GST calculations and compliance behavior will be implemented only after the applicable rules are verified for the relevant business situation.
