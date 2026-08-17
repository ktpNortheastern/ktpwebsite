import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getCollection<T extends Record<string, unknown>>(
  collection: string
): (T & { slug: string })[] {
  const dir = path.join(CONTENT_DIR, collection);
  if (!fs.existsSync(dir)) return [];

  const entries = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data } = matter(raw);
      return { ...(data as T), slug: file.replace(/\.md$/, "") };
    });

  entries.sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : Infinity;
    const orderB = typeof b.order === "number" ? b.order : Infinity;
    return orderA - orderB;
  });

  return entries;
}
