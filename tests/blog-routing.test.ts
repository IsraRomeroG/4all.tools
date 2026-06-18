import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBlogIndexPath,
  buildBlogPagePath,
  buildCategoryPath,
  buildPostPath,
  normalizePath,
} from "../src/lib/blog/routes.ts";
import { validateBlogRecords } from "../src/lib/blog/validation.ts";

test("blog URL helpers use slashless canonical routes", () => {
  assert.equal(normalizePath("/"), "/");
  assert.equal(normalizePath("/blog/"), "/blog");
  assert.equal(normalizePath("blog/page/2/"), "/blog/page/2");
  assert.equal(buildBlogIndexPath("en"), "/blog");
  assert.equal(buildBlogIndexPath("es"), "/es/blog");
  assert.equal(buildBlogIndexPath("pt"), "/pt/blog");
  assert.equal(buildBlogPagePath("en", 1), "/blog");
  assert.equal(buildBlogPagePath("en", 2), "/blog/page/2");
});

test("blog URL helpers localize category and article slugs", () => {
  assert.equal(buildCategoryPath("en", "calculators"), "/blog/calculators");
  assert.equal(buildCategoryPath("es", "calculators"), "/es/blog/calculadoras");
  assert.equal(buildCategoryPath("pt", "calculators"), "/pt/blog/calculadoras");
  assert.equal(
    buildPostPath("es", "calculators", "calcular-aumento-porcentual"),
    "/es/blog/calculadoras/calcular-aumento-porcentual",
  );
});

test("blog validation rejects invalid localized content records", () => {
  const errors = validateBlogRecords([
    {
      id: "percentage-increase/es",
      group: "percentage-increase",
      locale: "es",
      categoryId: "calculators",
      slug: "calcular-aumento-porcentual",
      status: "published",
    },
  ]);

  assert.match(errors.join("\n"), /requires a published English source/);
});

test("blog validation fails duplicate published routes but ignores draft routes", () => {
  const publishedDuplicateErrors = validateBlogRecords([
    {
      id: "one/en",
      group: "one",
      locale: "en",
      categoryId: "calculators",
      slug: "same-route",
      status: "published",
    },
    {
      id: "two/en",
      group: "two",
      locale: "en",
      categoryId: "calculators",
      slug: "same-route",
      status: "published",
    },
  ]);

  assert.match(publishedDuplicateErrors.join("\n"), /duplicates published blog route/);

  const draftDuplicateErrors = validateBlogRecords([
    {
      id: "one/en",
      group: "one",
      locale: "en",
      categoryId: "calculators",
      slug: "same-route",
      status: "published",
    },
    {
      id: "two/en",
      group: "two",
      locale: "en",
      categoryId: "calculators",
      slug: "same-route",
      status: "draft",
    },
  ]);

  assert.equal(draftDuplicateErrors.length, 0);
});

test("blog validation keeps translations in the same category", () => {
  const errors = validateBlogRecords([
    {
      id: "same-topic/en",
      group: "same-topic",
      locale: "en",
      categoryId: "calculators",
      slug: "same-topic",
      status: "published",
    },
    {
      id: "same-topic/es",
      group: "same-topic",
      locale: "es",
      categoryId: "seo",
      slug: "mismo-tema",
      status: "published",
    },
  ]);

  assert.match(errors.join("\n"), /does not match translation group category/);
});
