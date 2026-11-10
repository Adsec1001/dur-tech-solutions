# Project rules

- Keep computer-sale revenue, cost and payment calculations in `src/lib/computerTotals.ts` so the sale form, cards and exports share the same accounting rules.
- Gate admin routes with server-validated auth and protected user_roles; RLS, storage policies and price functions enforce the same role so browser state cannot grant access.
- Public job tracking uses an exact-code RPC exposing only customer-facing fields and aggregate queue counts; never read private job tables from public views.
- Store delivery dates as calendar dates and calculate waiting days in deliveryTracking; collection stops the counter without changing job completion status.
