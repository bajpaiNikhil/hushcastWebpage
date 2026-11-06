import { site } from '../content/copy';
const paths = ['/', '/privacy/', '/terms/', '/support/'];
export const GET = () => new Response(
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  paths.map((p) => `  <url><loc>${new URL(p, site.url).href}</loc></url>`).join('\n') + `\n</urlset>\n`,
  { headers: { 'Content-Type': 'application/xml' } });
