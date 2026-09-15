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
- Supplier master with name, phone, address, GSTIN, state and active/inactive status.
- Sales, purchases, expenses, labour and bills with server-side totals and audit events.
- Unified History and live Dashboard.
- Stock calculated from purchases minus sales plus explicit stock movements.
- Printable sales invoices and browser Save-as-PDF flow.
- Invoice sharing through native device sharing with clipboard fallback.
- GST foundation: business state, customer state, business default GST rate, GST-aware sales, and invoice CGST/SGST or IGST breakdown when state data is available.
- Accounting foundation: dashboard sales-before-GST, GST collected, purchases, and expenses/labour transaction snapshot.
- Reports: Today, 7 days, this month, and custom date-range summaries for sales, purchases, expenses, labour, GST collected and unpaid bills.
- Purchase GST/input tax capture: supplier state, purchase GST rate, CGST/SGST or IGST calculation, stored tax breakdown, and report aggregation.
- Weighted-average stock valuation and COGS calculation from purchase, sale and stock-movement history.
- Reports now show COGS, closing stock value, gross profit and operating profit.
- Sales are blocked when the requested quantity is greater than available stock.
- New opening/add-stock entries require an explicit cost per unit for reliable valuation.
- Stock removal is also blocked when the requested quantity is greater than available stock.
- Stock screen shows the currently available quantity before a stock correction is saved.
- Simple derived ledger foundation: sales, purchase, GST, COGS, expenses and labour are presented as debit/credit entries without requiring historical transactions to be re-entered.
- Ledger page is available to both Owner and Partner users.
- Customer receipts and supplier payments are recorded with payment method/date/reference and checked against outstanding balances.
- Bill settlement now creates a payment record and marks the bill paid without creating a duplicate expense.
- Ledger now includes customer receipts, supplier payments and bill settlements.
- Payments page is available to both Owner and Partner users.
- Customer and supplier account statements show transaction history, payments and running balances.
- Purchase documents have a printable purchase record with business/supplier details, item, GST breakdown and total.
- Purchase documents can be shared through native device sharing with clipboard fallback.
- Customer and supplier account statements support date-range filtering, browser Print/Save-as-PDF and native sharing with clipboard fallback.
- Purchases now select an active supplier master record and store its supplier ID while retaining supplier name/state snapshots for document history.
- Supplier payments now reference supplier IDs while retaining legacy supplier-name compatibility.
- Supplier account statements now reference supplier IDs while still including historical purchases/payments that only have supplier names.

## Current branch
`main`

## Current module
**Supplier Master** — implemented; ready for local verification.

## Supplier master design boundary
- Supplier identity is now a dedicated MongoDB `suppliers` record.
- Supplier records contain name, phone, address, GSTIN, state and active/inactive status.
- New purchases reference `supplierId` and also keep supplier name/state snapshots so old documents remain readable even if supplier details later change.
- New supplier payments reference `supplierId` and keep supplier name as a display snapshot.
- Supplier accounts prefer the supplier ID but include legacy records matched by supplier name so historical balances are not lost.
- Existing purchases and payments without supplier IDs remain valid; no destructive migration is required.
- Disabling a supplier prevents new purchases/payments from selecting it, but historical transactions remain available.
- Supplier names are kept simple and user-managed; this is not yet a full vendor onboarding/KYC system.

## Payment design boundary
- Customer receipts reduce Sales Receivable; they do not create another sale.
- Supplier payments reduce Purchase Payable; they do not create another purchase or expense.
- Bill payments reduce Bill Payable; the existing bill remains an obligation record and is not converted into an expense again.
- Customer and supplier balances are derived from existing sales/purchases minus recorded payments.
- Supplier identity now uses the supplier master for new transactions, with name-based fallback for legacy records.
- Payment amounts cannot exceed the currently calculated outstanding balance.
- Payment methods currently include Cash, Bank Transfer, UPI and Cheque, with optional reference and notes.
- This is a practical settlement foundation, not a complete banking, reconciliation or statutory accounting system.

## Account statement design boundary
- Statements are derived from the existing account API; no duplicate statement collection is created.
- Supplier statements prefer supplier ID and include legacy name-based history.
- Date filters are presentation filters over the existing chronological statement.
- Print uses the browser print flow and existing application styling, allowing Save as PDF on supported devices.
- Share sends a readable text statement through the native device share menu where available, with clipboard fallback.
- The statement balance remains the running balance from the underlying account history; filtered views show the last balance represented by the selected range.

## Document design boundary
- Sales and purchases use separate business document numbers: invoice numbers for sales and purchase numbers for purchases.
- Purchase documents are generated from the existing purchase record; no duplicate document collection is created.
- Print uses the browser print flow and the existing print-only document styling, allowing Save as PDF on supported devices.
- Share uses text details through the device's native share menu where available, with clipboard fallback.
- This is a practical business-document foundation, not a full PDF-generation or document-storage service.

## Ledger design boundary
- The ledger is derived from existing transaction data rather than duplicating every transaction into a second collection.
- Sales produce Sales Receivable → Sales and Output GST entries, plus COGS → Inventory using weighted-average stock valuation.
- Purchases produce Inventory → Purchase Payable and Input GST → Purchase Payable entries.
- Expenses and labour produce their expense account → Cash / Bank entries.
- Customer receipts produce Cash / Bank → Sales Receivable entries.
- Supplier payments produce Purchase Payable → Cash / Bank entries.
- Bill payments produce Bill Payable → Cash / Bank entries.
- This is a simple accounting foundation, not a full statutory double-entry accounting or GST filing system.

## GST design boundary
- GST rate is explicitly selected on each sale or purchase, starting from the business default rate.
- Server calculates tax; the browser only previews it.
- Same-state business/customer or business/supplier with GST rate > 0 produces CGST + SGST.
- Different or unavailable state information produces IGST when a GST rate is applied.
- Existing historical sales and purchases remain valid; records created before GST fields existed are treated as zero-tax for reporting compatibility.
- Reports show output GST minus captured purchase GST as an informational calculation only.
- This is a calculation/accounting foundation, not a claim that the application is a complete GST-compliance or filing system.

## Accounting design boundary
- Stock uses weighted-average cost: purchase subtotal increases stock value, sales consume stock at the current average cost, and closing stock is the remaining quantity multiplied by its current weighted-average cost.
- Older opening/adjustment movements without a stored unit cost use the product purchase price as a fallback, and Reports clearly warn when this affects valuation completeness.
- Gross profit is sales before GST minus COGS.
- Operating profit is gross profit minus expenses and labour.
- New added stock requires an explicit unit cost; stock removal consumes the current average cost.
- Sales and stock removals cannot reduce stock below zero.
- Reports still do not claim GST filing liability.
- Bills remain obligations until settled, and settlement is recorded separately from the original bill amount.

## Next module
Verify Supplier Master locally. Then move to **Dashboard improvements**: customer outstanding, supplier payable, stock value and simple cash/payment visibility.

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
