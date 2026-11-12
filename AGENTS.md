# Project rules

- Keep computer-sale revenue, cost and payment calculations in `src/lib/computerTotals.ts` so the sale form, cards and exports share the same accounting rules.
- Admin access is checked server-side via `has_role` (`useAdminAuth`); never gate admin UI with client PINs or storage flags — they are bypassable.
- Route the generated client import through the Vite alias to `secureClient.ts` so all requests keep tokens in tab-only storage (refresh within the grace window stays signed in, browser close signs out) without editing managed files; server-side admin sessions enforce verified owner identity, 10-minute idle and 30-minute absolute expiry.
