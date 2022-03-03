const generateSitemapXml = (): string => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  xml += `
    <url>
      <loc>https://lgtmeow.com/</loc>
      <changefreq>weekly</changefreq>
    </url>
    <url>
      <loc>https://lgtmeow.com/upload/</loc>
      <changefreq>weekly</changefreq>
    </url>
    <url>
      <loc>https://lgtmeow.com/terms/</loc>
      <changefreq>monthly</changefreq>
    </url>
    <url>
      <loc>https://lgtmeow.com/privacy/</loc>
      <changefreq>monthly</changefreq>
    </url>
  </urlset>`;

  return xml;
};

export default generateSitemapXml;
