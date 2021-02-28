const generateSitemapXml = (): string => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const targetUrlList = [
    'https://lgtmeow.com/',
    'https://lgtmeow.com/terms/',
    'https://lgtmeow.com/privacy/',
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const targetUrl of targetUrlList) {
    xml += `
      <url>
        <loc>${targetUrl}</loc>
        <changefreq>weekly</changefreq>
      </url>
    `;
  }

  xml += `</urlset>`;

  return xml;
};

export default generateSitemapXml;
