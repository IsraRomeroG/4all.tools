import rss from "@astrojs/rss";
import { DEFAULT_LOCALE, SITE_URL } from "@/lib/blog/config";
import { getPostsByLocale, getPublishedBlogPosts } from "@/lib/blog/content";

export async function GET(context: { site?: URL }) {
  const posts = getPostsByLocale(await getPublishedBlogPosts(), DEFAULT_LOCALE);

  return rss({
    title: "4all.tools Blog",
    description: "Practical guides for useful online tools.",
    site: context.site ?? new URL(SITE_URL),
    trailingSlash: false,
    customData: `<language>${DEFAULT_LOCALE}</language>`,
    items: posts.map((post) => ({
      title: post.title,
      link: post.path,
      pubDate: post.publishedAt,
      description: post.description,
      categories: [post.category.labels[post.locale], ...post.tags],
    })),
  });
}
