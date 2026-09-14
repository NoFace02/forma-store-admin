# Forma Store Admin

A responsive store dashboard built as a portfolio project, with a clean interface for exploring customers, products, and sample business performance.

[View the live website](https://forma2002.netlify.app)

## Features

- Dashboard with revenue, expenses, and profit summaries.
- Six-month financial chart and recent sample orders.
- Customer and product directories with search and pagination.
- Responsive layouts for desktop and mobile.
- Account sign-in and private, read-only demo data.

## Built with

React, TypeScript, Vite, Tailwind CSS, TanStack Query, Recharts, and Supabase. Hosted on Netlify with GitHub-based deployments.

## About the demo

All customers, products, orders, and financial figures are fictional. This project showcases frontend design, data visualization, and database-enforced access control—not a live store.

Every registered, non-anonymous account automatically receives workspace access and its own read-only sample data. Existing accounts have also been provisioned. Public registration is not available in the interface; accounts can be added through Supabase Authentication.

The database setup is recorded in `database/automatic-demo-access.sql` (already applied to the connected project). It creates a private sample-data template and provisions accounts through an `auth.users` insert trigger. Row-level security restricts each account to its own records. This setup script is intended to run once.
