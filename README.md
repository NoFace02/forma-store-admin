# Forma Store Admin

A read-only personal admin panel built with React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Recharts, and Supabase Auth.

## Run locally

Install Node.js 22.12+ or 24 and pnpm, then run:

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

On PowerShell use `Copy-Item .env.example .env.local`. Open the local URL printed by Vite. Without Supabase configuration, the login page displays setup instructions and disables sign-in.

## Configure your private account

1. Create a dedicated project at https://supabase.com/dashboard.
2. Copy its project URL and **public publishable key** from the project connection/API settings into `.env.local`. Never put a secret or service-role key in frontend environment variables.
3. In Authentication settings disable **Allow new users to sign up** and anonymous sign-ins. Database RLS now limits demo access to the seeded owner account; other authenticated accounts cannot read those records.
4. Under Authentication → Users, add your user with your email and password, marking it confirmed. Do not commit your password. There is no public signup or password reset UI; manage your account in the provider console.
5. Restart Vite after changing environment variables.

The browser uses Supabase's session management and automatic token refresh. Routes wait for session restoration and check workspace access. Demo data lives in forma_demo_records, with owner-only database RLS and SELECT-only browser grants. forma_demo_access provides the UI access check. No server credentials are needed. See SECURITY.md for remaining deployment and account-security steps. The configured project already contains the seeded demo tables; a different project needs its own schema and owner setup.

## Sample data

`/dashboard` reads 36 fictional customers, 24 products, and 72 sample carts from private Supabase records. `/customers` and `/products` provide local search and ten-row pagination. Queries are cached per signed-in identity for five minutes, retry once, and offer manual retry after failure. The current demo reader has a 1,000-record limit per resource; implement server pagination before growing beyond that.

Carts are treated as sample orders. Revenue is their discounted total. A deterministic cart-ID formula assigns expenses between 70–120% of revenue and dates across the current month and previous five months. Some dates may be later in the current month: these are fictional dates, not completed real transactions. Money is calculated in cents and displayed in USD. Cards, the six-month chart, its accessible monthly breakdown, and recent orders use the same calculations. Data stays stable within the calendar month; moving into another month shifts the simulated period.

## Checks

```sh
pnpm test
pnpm build
```

Tests cover stable sample data, expense bounds, chart/card reconciliation, year boundaries, search, pagination, empty results, malformed responses, HTTP errors, and request cancellation forwarding.

With your configured project, manually verify: incorrect credentials show an error; correct credentials open the dashboard; reload preserves the session; logout returns to login; opening a protected URL after logout redirects to login. Check mobile navigation, keyboard focus, password visibility, search/pagination, and retry behavior with the network offline.

Registration, password reset UI, and record editing remain outside this version. Netlify deployment is prepared: see NETLIFY.md. The build includes SPA routing and security headers; nothing has been published yet.
