import { site } from '../content/copy';
export const GET = () => new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site.url).href}\n`);
