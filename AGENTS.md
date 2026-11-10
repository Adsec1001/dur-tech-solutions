# Project rules

- Keep computer-sale revenue, cost and payment calculations in `src/lib/computerTotals.ts` so the sale form, cards and exports share the same accounting rules.
- Admin access is checked server-side via `has_role` (`useAdminAuth`); never gate admin UI with client PINs or storage flags — they are bypassable.
