import "server-only";

import { mediaPublicUrl } from "@/lib/media/public-url";

/** Resolves a stored object key or an already-public path. */
export function resolveEventAssetUrl(key: string | null): string | null {
  if (!key) {
    return null;
  }
  if (
    key.startsWith("/") ||
    key.startsWith("http://") ||
    key.startsWith("https://")
  ) {
    return key;
  }
  return mediaPublicUrl(key);
}

/** Static seed paths stay in `public/`; uploaded objects can be deleted. */
export function isDeletableObjectKey(key: string): boolean {
  return (
    !key.startsWith("/") &&
    !key.startsWith("http://") &&
    !key.startsWith("https://")
  );
}
