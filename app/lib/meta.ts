import type { MetaDescriptor } from "react-router";

/**
 * Merges parent route meta with child overrides.
 * Child entries override parent entries that share the same key
 * (title, name, or property attribute).
 */
export function mergeMeta(
  parentMeta: MetaDescriptor[],
  childMeta: MetaDescriptor[]
): MetaDescriptor[] {
  const merged = [...parentMeta];

  for (const child of childMeta) {
    const index = merged.findIndex((parent) => metaKey(parent) === metaKey(child));
    if (index >= 0) {
      merged[index] = child;
    } else {
      merged.push(child);
    }
  }

  return merged;
}

function metaKey(entry: MetaDescriptor): string | null {
  if ("title" in entry) return "title";
  if ("name" in entry) return `name:${entry.name}`;
  if ("property" in entry) return `property:${entry.property}`;
  return null;
}
