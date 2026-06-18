import {
  DEFAULT_LOCALE,
  isBlogCategoryId,
  isLocale,
  type BlogCategoryId,
  type Locale,
} from "./config.ts";
import { stripSlashes } from "./routes.ts";

export interface BlogRecordInput {
  id: string;
  group: string;
  locale: string;
  categoryId: string;
  slug: string;
  status?: string;
}

export interface ValidatedBlogRecord extends BlogRecordInput {
  locale: Locale;
  categoryId: BlogCategoryId;
}

export function getGroupFromEntryId(entryId: string): string {
  return stripSlashes(entryId).split("/")[0] ?? "";
}

export function isPublishedRecord(record: BlogRecordInput): boolean {
  return (record.status ?? "published") === "published";
}

export function validateBlogRecords(records: BlogRecordInput[]): string[] {
  const errors: string[] = [];
  const groupLocaleKeys = new Map<string, string>();
  const groupCategoryKeys = new Map<string, string>();
  const routeKeys = new Map<string, string>();
  const publishedEnglishGroups = new Set(
    records
      .filter((record) => record.locale === DEFAULT_LOCALE && isPublishedRecord(record))
      .map((record) => record.group),
  );

  for (const record of records) {
    const label = record.id || `${record.group}/${record.locale}`;

    if (!record.group) {
      errors.push(`${label}: translation group could not be derived from the topic folder.`);
    }

    if (!isLocale(record.locale)) {
      errors.push(`${label}: invalid locale "${record.locale}".`);
    }

    if (!isBlogCategoryId(record.categoryId)) {
      errors.push(`${label}: invalid categoryId "${record.categoryId}".`);
    }

    if (record.group && isBlogCategoryId(record.categoryId)) {
      const existingCategoryId = groupCategoryKeys.get(record.group);
      if (existingCategoryId && existingCategoryId !== record.categoryId) {
        errors.push(
          `${label}: categoryId "${record.categoryId}" does not match translation group category "${existingCategoryId}".`,
        );
      } else {
        groupCategoryKeys.set(record.group, record.categoryId);
      }
    }

    if (!record.slug || record.slug !== stripSlashes(record.slug) || record.slug.includes("/")) {
      errors.push(`${label}: slug must be one path segment without leading or trailing slashes.`);
    }

    const groupLocaleKey = `${record.group}:${record.locale}`;
    const duplicateGroupLocale = groupLocaleKeys.get(groupLocaleKey);
    if (duplicateGroupLocale) {
      errors.push(`${label}: duplicates translation ${groupLocaleKey} already used by ${duplicateGroupLocale}.`);
    } else {
      groupLocaleKeys.set(groupLocaleKey, label);
    }

    if (isLocale(record.locale) && isBlogCategoryId(record.categoryId) && isPublishedRecord(record)) {
      const routeKey = `${record.locale}:${record.categoryId}:${record.slug}`;
      const duplicateRoute = routeKeys.get(routeKey);
      if (duplicateRoute) {
        errors.push(`${label}: duplicates published blog route ${routeKey} already used by ${duplicateRoute}.`);
      } else {
        routeKeys.set(routeKey, label);
      }

      if (record.locale !== DEFAULT_LOCALE && !publishedEnglishGroups.has(record.group)) {
        errors.push(`${label}: published ${record.locale} translation requires a published English source.`);
      }
    }
  }

  return errors;
}

export function assertValidBlogRecords(records: BlogRecordInput[]): void {
  const errors = validateBlogRecords(records);

  if (errors.length > 0) {
    throw new Error(`Invalid blog content:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  }
}
