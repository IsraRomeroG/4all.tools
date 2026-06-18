import rss from "@astrojs/rss";
import { NON_DEFAULT_LOCALES, SITE_URL, type Locale } from "@/lib/blog/config";
import { getPostsByLocale, getPublishedBlogPosts } from "@/lib/blog/content";

export async function getStaticPaths() {
  const allPosts = await getPublishedBlogPosts();

  return NON_DEFAULT_LOCALES.filter((locale) => getPostsByLocale(allPosts, locale).length > 0).map((locale) => ({
    params: { locale },
    props: { locale },
  }));
}

export async function GET(context: { params: { locale?: string }; props?: { locale: Locale }; site?: URL }) {
  const locale = context.props?.locale ?? (context.params.locale as Locale);
  const posts = getPostsByLocale(await getPublishedBlogPosts(), locale);

  return rss({
    title: `4all.tools Blog (${locale})`,
    description: "Practical guides for useful online tools.",
    site: context.site ?? new URL(SITE_URL),
    trailingSlash: false,
    customData: `<language>${locale}</language>`,
    items: posts.map((post) => ({
      title: post.title,
      link: post.path,
      pubDate: post.publishedAt,
      description: post.description,
      categories: [post.category.labels[post.locale], ...post.tags],
    })),
  });
}
