type RouteLoader = () => Promise<unknown>;

// Maps a route path to the dynamic import of that route's chunk.
// Keep in sync with the lazy() imports in App.tsx for the header nav links.
const chunkLoaders: Record<string, RouteLoader> = {
  "/community": () => import("../pages/sacramental/Community"),
  "/jumuiya": () => import("../pages/Jumuiya/JumuiyaLanding"),
  "/officials": () => import("../pages/officials/PublicView"),
  "/projects": () => import("../pages/projects/pages/Home"),
  "/devotions": () => import("../pages/Devotions/components/Layout"),
  "/activities": () => import("../pages/Landing/components/page/ActivitiesPage"),
};

const prefetched = new Set<string>();

/**
 * Warm up the code chunk for a route so the first navigation is instant.
 * Safe to call repeatedly / on every hover; each chunk is fetched at most once.
 */
export function prefetchRoute(path: string): void {
  const key = (path.split("#")[0].split("?")[0]).replace(/\/+$/, "") || "/";
  if (prefetched.has(key)) return;
  const loader = chunkLoaders[key];
  if (!loader) return;
  prefetched.add(key);
  loader().catch(() => prefetched.delete(key));
}
