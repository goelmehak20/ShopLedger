# ShopLedger

## Stack
- Node.js with Express 4 and body-parser; browser UI is plain HTML, CSS, and JavaScript.
- Application data is stored in `data/db.json` through synchronous file reads and writes in `lib/store.js`.

## Module map
- `routes/customers.js` — customer listing and Khata settlement endpoints.
- `routes/orders.js` — order list/detail/create and cancellation endpoints.
- `routes/products.js` — product listing and active coupon endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — coupon lookup, validation, normalization, and discount calculation.
- `lib/dates.js` — current date, date-key normalization, and fiscal-year helpers.
- `lib/inventory.js` — product lookup, sellable-stock check, stock deduction, release, and summary.
- `lib/invoice.js` — invoice figures and printable HTML rendering.
- `lib/ledger.js` — customer balances, Khata charges/reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtering.
- `lib/pricing.js` — subtotal, discount, GST, and order-total calculations.
- `lib/reports.js` — dashboard summary and GST reconciliation calculations.
- `lib/store.js` — JSON database read/write and audit log append.
- `lib/tax.js` — GST rate resolution and CGST/SGST split.

## Commands
- Start the app: `npm start` (runs `node server.js`).
- Run tests: `node --test` (the current `npm test` script is a placeholder that exits with an error).

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
Cannot sell the last sellable unit in stock, and cancelling an order never restores stock.
Allowed files: `lib/inventory.js`, and `lib/orders.js` (cancel only).
