# Deploy the demo to Netlify

The site is prepared but has not been published.

## Option A: upload the existing production build

Sign into Netlify and use its manual deploy/folder upload option. Upload only the entire dist folder from this project, not src, node_modules, or the project root. The current local build already includes this demo's public connection settings, routing, and security headers.

Do not upload .env.local. Public connection settings are intentionally included in the JavaScript build; the database permissions protect records, not secrecy of the public key.

## Option B: deploy from a Git repository

This checkout is not currently a Git repository. Put the source in your own repository first, keeping .env.local ignored, then import that repository into Netlify.

Netlify reads netlify.toml: Node 24, pnpm 12.4.1, frozen lockfile installation, tests followed by production build, and dist as the publish folder.

Before building, add these environment variables in Netlify with build scope:

- VITE_SUPABASE_URL: the demo project's HTTPS URL.
- VITE_SUPABASE_PUBLISHABLE_KEY: its public sb_publishable_ key.

Use the values from your local .env.local. Never add a secret/service-role key. Changing build variables requires a new build. Without these settings, the app disables login.

## After deploying

- Open the HTTPS Netlify URL on your phone.
- Test correct and incorrect passwords, dashboard refresh, customers/products, logout, and opening a protected route after logout.
- Check that /dashboard reload works and that JavaScript, CSS, and product artwork load normally.
- Inspect browser console/network for CSP violations. The policy allows scripts only from this site and API connections only to the configured demo project. Inline styles are allowed for React/chart layout, not inline scripts. Changing the backend project requires updating public/_headers.
- Check actual response headers on the deployed URL. Local Vite does not apply Netlify's _headers or _redirects rules.
- Complete the account-security checklist in SECURITY.md before sharing.

The login page and static files will be publicly reachable. Private records remain protected by database authorization. noindex headers discourage search indexing but do not restrict access.

Do not turn on Netlify's optional injected analytics/toolbar scripts without reviewing the CSP. They are not allowlisted.
