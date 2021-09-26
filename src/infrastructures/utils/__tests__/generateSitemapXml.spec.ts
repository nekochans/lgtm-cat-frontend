import generateSitemapXml from '../generateSitemapXml';

describe('generateSitemapXml.ts Functions TestCases', () => {
  it('should return the sitemap.xml', () => {
    const result = generateSitemapXml();
    const expected = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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

    expect(result).toStrictEqual(expected);
  });
});
