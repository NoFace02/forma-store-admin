import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
// Secret/service-role keys must never be bundled. Accept modern public keys only.
export const configured = Boolean(url && /^https:\/\//.test(url) && !url.includes('your-project') && key?.startsWith('sb_publishable_'));
export const supabase = configured ? createClient(url, key) : null;
