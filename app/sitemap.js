const SITE = 'https://joinhhg.com';
const pages = [
  ['', 1.0],
  ['/join-a-real-estate-team-twin-cities', 0.9],
  ['/become-a-real-estate-agent-minnesota', 0.9],
  ['/real-estate-agent-jobs-twin-cities', 0.9],
  ['/real-estate-coaching-training-twin-cities', 0.8],
  ['/real-estate-career-quiz', 0.8],
  ['/is-real-estate-a-good-career', 0.8],
  ['/part-time-real-estate-agent', 0.7],
  ['/how-do-real-estate-agents-get-paid', 0.8],
  ['/real-estate-commission-splits', 0.7],
  ['/how-to-find-a-real-estate-mentor', 0.6],
  ['/why-hhg', 0.8],
  ['/income-guarantee', 0.8],
  ['/agent-plus', 0.7],
  ['/value', 0.7],
  ['/how-it-works', 0.7],
  ['/our-team', 0.6],
  ['/faq', 0.6],
  ['/apply', 0.8],
  ['/terms', 0.3],
];

export default function sitemap() {
  const lastModified = new Date('2026-11-08');
  return pages.map(([path, priority]) => ({ url: SITE + path, lastModified, priority }));
}
