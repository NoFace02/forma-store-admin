import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
describe('Netlify preparation', () => {
  it('builds tests and production files rather than running a dev server', () => {
    const config = read('netlify.toml');
    expect(config).toContain('command = "pnpm test && pnpm build"');
    expect(config).toContain('publish = "dist"');
    expect(config).toContain('--frozen-lockfile');
  });
  it('uses a non-forced SPA fallback so real assets are not overridden', () => {
    expect(read('public/_redirects').split('\n').filter(line => line && !line.startsWith('#'))).toEqual(['/* /index.html 200']);
  });
  it('restricts scripts and external connections and blocks framing', () => {
    const headers = read('public/_headers');
    expect(headers).toContain("script-src 'self';");
    expect(headers).not.toContain("'unsafe-eval'");
    expect(headers).toContain("connect-src 'self' https://cnrkvqhcdvxgociutfkf.supabase.co;");
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).toContain('X-Content-Type-Options: nosniff');
    expect(headers).toContain('Strict-Transport-Security: max-age=31536000');
  });
});
