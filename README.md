# Forma Store Admin

A responsive store dashboard built as a portfolio project, with a clean interface for exploring customers, products, and sample business performance.

[View the live website](https://forma2002.netlify.app)

## Features

- Dashboard with revenue, expenses, and profit summaries.
- Six-month financial chart and recent sample orders.
- Customer and product directories with search and pagination.
- Product details with illustrations, descriptions, prices, categories, and stock.
- Responsive layouts for desktop and mobile.
- Account sign-in and private, read-only demo data.

## Built with

React, TypeScript, Vite, Tailwind CSS, TanStack Query, Recharts, and Supabase. Hosted on Netlify with GitHub-based deployments.

## About the demo

All customers, products, orders, and financial figures are fictional. This project showcases frontend design, data visualization, and database-enforced access control—not a live store.

Every registered, non-anonymous account automatically receives workspace access and its own read-only sample data. Existing accounts have also been provisioned. Public registration is not available in the interface; accounts can be added through Supabase Authentication.

The database setup is recorded in `database/automatic-demo-access.sql` (already applied to the connected project). It creates a private sample-data template and provisions accounts through an `auth.users` insert trigger. Row-level security restricts each account to its own records. This setup script is intended to run once.

`database/product-content.sql` adds fictional product descriptions and six original SVG illustrations to existing records and the new-account template. Images are returned as data URLs, so they work without external image hosting. Edit artwork in `assets/products/` and descriptions in `scripts/generate-product-content.mjs`, then run `pnpm generate:products` and apply the generated SQL in Supabase SQL Editor. Tests check that the generated SQL matches its sources. Editing an SVG alone does not change existing database images.

## Local setup

1. Install Node.js 24 and pnpm, then run `pnpm install`.
2. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and public publishable key. Never put a secret or service-role key in a `VITE_*` variable.
3. In the connected Supabase project, add an account under Authentication → Users. The installed database trigger automatically grants it workspace access and fictional sample records.
4. Run `pnpm dev` and sign in using that account. Run `pnpm test` and `pnpm build` to verify changes.

The database scripts document changes to the existing configured project; they are not a complete bootstrap for a new empty database. `automatic-demo-access.sql` is a one-time script and assumes the original demo tables and owner records already exist. `product-content.sql` can be reapplied after editing product artwork or descriptions. Netlify requires the same two public `VITE_*` values in its build environment.
