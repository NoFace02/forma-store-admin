# Demo security

Demo records now live in Supabase, not a public fake API. Database RLS matches the requesting user's verified identity to each record's owner. Only the existing owner was seeded. Browser roles have SELECT only; anonymous access and all browser writes are revoked. Adding another login does not grant it demo records.

The frontend access check improves the UI; the database is the security boundary. Synthetic data is not bundled in the app. Product placeholder artwork is public and contains no record data.

Only public publishable keys belong in VITE variables. Never put secret/service-role keys in frontend files. The ignored .env.local connects this checkout to the configured project.

Before public deployment:

- Disable public signup and anonymous sign-ins in Supabase Auth settings.
- Enable leaked-password protection if available on your plan (the advisor currently reports it disabled), use a unique strong password, and enable MFA for your Supabase management account.
- Serve the production dist build over HTTPS, never expose the Vite development server.
- Netlify headers are prepared in public/_headers: an enforced CSP, anti-framing, nosniff, no-referrer, restricted browser capabilities, and HSTS. Verify these headers and the login/chart functionality on the deployed HTTPS site; they do not apply to the local Vite server.
- Verify the owner login and logout in the browser. Unit tests and database role checks do not replace an end-to-end login test.

Sessions use the Supabase browser SDK and browser storage. An XSS vulnerability could steal a session; do not add raw HTML rendering or untrusted scripts. API requests remain visible in developer tools, but copying a URL does not bypass database permissions.

The cache is isolated by signed-in user and cleared when its provider is discarded. Authorized users can always copy data they have already received.
