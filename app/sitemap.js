const paths = ['', '/why-hhg', '/our-team', '/value', '/agent-plus', '/terms', '/how-it-works', '/faq', '/apply'];

export default function sitemap() {
  return paths.map((p) => ({ url: 'https://joinhhg.com' + p, lastModified: new Date() }));
}
