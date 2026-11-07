export const SITE = 'https://joinhhg.com';

export const CITIES = [
  'Burnsville', 'Apple Valley', 'Eagan', 'Farmington', 'Inver Grove Heights', 'Lakeville',
  'Mendota Heights', 'Northfield', 'Rosemount', 'Saint Paul', 'South Saint Paul', 'West Saint Paul',
];

export const orgJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['RealEstateAgent', 'Organization'],
      '@id': SITE + '/#organization',
      name: 'Huerkamp Home Group',
      alternateName: 'HHG',
      url: SITE,
      logo: SITE + '/hhg-logo.png',
      image: SITE + '/og.jpg',
      description: 'Huerkamp Home Group is a Keller Williams Preferred Realty real estate team in Burnsville, Minnesota, recruiting agents across the Twin Cities.',
      foundingDate: '2002',
      parentOrganization: { '@type': 'Organization', name: 'Keller Williams Preferred Realty' },
      address: {
        '@type': 'PostalAddress',
        streetAddress: '14300 Nicollet Ct, Suite 208',
        addressLocality: 'Burnsville',
        addressRegion: 'MN',
        postalCode: '55306',
        addressCountry: 'US',
      },
      areaServed: CITIES.map((c) => ({ '@type': 'City', name: c + ', MN' })),
      sameAs: [
        'https://www.youtube.com/@LivingInMinneapolis',
        'https://www.facebook.com/HuerkampHomeGroup/',
        'https://www.instagram.com/twincities/',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': SITE + '/#website',
      url: SITE,
      name: 'Join Huerkamp Home Group',
      publisher: { '@id': SITE + '/#organization' },
      inLanguage: 'en-US',
    },
  ],
};

export function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: SITE + path,
    })),
  };
}

export function faqJsonLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
