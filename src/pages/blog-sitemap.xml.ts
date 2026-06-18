import {
  BLOG_CATEGORIES,
  SITE_URL,
  SUPPORTED_LOCALES,
} from "@/lib/blog/config";
import {
  getBlogIndexAlternates,
  getCategoryAlternates,
  getPostAlternates,
  getPostsByCategory,
  getPostsByLocale,
  getPostTranslations,
  getPublishedBlogPosts,
  paginateBlogPosts,
  type BlogPost,
} from "@/lib/blog/content";
import {
  buildBlogPagePath,
  buildCategoryPagePath,
  buildCategoryPath,
  toAbsoluteUrl,
  type AlternateLink,
} from "@/lib/blog/routes";

interface SitemapUrl {
  path: string;
  lastmod: Date;
  alternates: AlternateLink[];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function latestDate(posts: BlogPost[]): Date {
  return posts.reduce(
    (latest, post) => (post.updatedAt.getTime() > latest.getTime() ? post.updatedAt : latest),
    new Date("2026-01-01T00:00:00.000Z"),
  );
}

function renderSitemapUrl(item: SitemapUrl): string {
  const links = item.alternates
    .map(
      ({ locale, href }) =>
        `<xhtml:link rel="alternate" hreflang="${escapeXml(locale)}" href="${escapeXml(href)}" />`,
    )
    .join("");

  return [
    "<url>",
    `<loc>${escapeXml(toAbsoluteUrl(item.path, SITE_URL))}</loc>`,
    `<lastmod>${item.lastmod.toISOString()}</lastmod>`,
    links,
    "</url>",
  ].join("");
}

export async function GET() {
  const posts = await getPublishedBlogPosts();
  const urls: SitemapUrl[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    const localePosts = getPostsByLocale(posts, locale);
    if (localePosts.length === 0) continue;

    const totalPages = paginateBlogPosts(localePosts, 1).totalPages;
    urls.push({
      path: buildBlogPagePath(locale, 1),
      lastmod: latestDate(localePosts),
      alternates: await getBlogIndexAlternates(1),
    });

    for (let page = 2; page <= totalPages; page += 1) {
      urls.push({
        path: buildBlogPagePath(locale, page),
        lastmod: latestDate(localePosts),
        alternates: await getBlogIndexAlternates(page),
      });
    }
  }

  for (const category of Object.values(BLOG_CATEGORIES)) {
    for (const locale of SUPPORTED_LOCALES) {
      const categoryPosts = getPostsByCategory(posts, locale, category.id);
      if (categoryPosts.length === 0) continue;

      const totalPages = paginateBlogPosts(categoryPosts, 1).totalPages;
      urls.push({
        path: buildCategoryPath(locale, category.id),
        lastmod: latestDate(categoryPosts),
        alternates: await getCategoryAlternates(category.id, 1),
      });

      for (let page = 2; page <= totalPages; page += 1) {
        urls.push({
          path: buildCategoryPagePath(locale, category.id, page),
          lastmod: latestDate(categoryPosts),
          alternates: await getCategoryAlternates(category.id, page),
        });
      }
    }
  }

  const groups = new Set(posts.map((post) => post.group));
  for (const group of groups) {
    const translations = await getPostTranslations(group);
    const alternates = getPostAlternates(translations);

    for (const post of translations) {
      urls.push({
        path: post.path,
        lastmod: post.updatedAt,
        alternates,
      });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">` +
    urls.map(renderSitemapUrl).join("") +
    `</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
