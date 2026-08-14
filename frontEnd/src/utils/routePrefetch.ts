// Warm-up lazy-loaded route chunks so in-app navigation feels instant.
// Works hand-in-hand with React.lazy: once a chunk is fetched & parsed, the
// same dynamic import used in App.tsx resolves from the browser module cache
// in a microtask, so clicking a nav link renders the destination immediately
// instead of waiting on a network round-trip.

type Loader = () => Promise<unknown>;

const inFlight = new Map<Loader, Promise<unknown>>();

function run(loader: Loader): Promise<unknown> {
  let p = inFlight.get(loader);
  if (!p) {
    p = loader().catch(() => undefined);
    inFlight.set(loader, p);
  }
  return p;
}

function runAll(loaders: Loader[]): Promise<PromiseSettledResult<unknown>[]> {
  return Promise.allSettled(loaders.map(run));
}

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

// ── Devotions (Layout is the shell every devotions page needs) ──────────────
const DEVOTIONS_LAYOUT: Loader = () => import("../pages/Devotions/components/Layout");

const devotionsLoaders: Loader[] = [
  DEVOTIONS_LAYOUT,
  () => import("../pages/Devotions/pages/Dashboard"),
  () => import("../pages/Devotions/pages/Rosary"),
  () => import("../pages/Devotions/pages/Bible"),
  () => import("../pages/Devotions/pages/PrayerModule"),
  () => import("../pages/Devotions/pages/PrayerBook"),
  () => import("../pages/Devotions/pages/Prayer"),
  () => import("../pages/Devotions/pages/AllPrayers"),
  () => import("../pages/Devotions/pages/LiturgySection"),
  () => import("../pages/Devotions/pages/DailyLiturgy"),
  () => import("../pages/Devotions/pages/PrayersOfTheMass"),
  () => import("../pages/Devotions/pages/LiturgicalSeasons"),
  () => import("../pages/Devotions/pages/SacraLiturgiaPage"),
  () => import("../pages/Devotions/pages/Challenge"),
  () => import("../pages/Devotions/pages/NotificationPage"),
  () => import("../pages/Devotions/csaComparison/CsaComparison"),
  () => import("../pages/Devotions/individualStatus/IndividualProgress"),
];

const devotionsRouteLoaders: Record<string, Loader[]> = {
  "/devotions": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/pages/Dashboard")],
  "/devotions/all-prayers": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/pages/AllPrayers")],
  "/devotions/readings": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/pages/PrayerBook")],
  "/devotions/prayer-book": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/pages/PrayerBook")],
  "/devotions/prayer": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/pages/Prayer")],
  "/devotions/prayer-module": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/pages/PrayerModule")],
  "/devotions/rosary": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/pages/Rosary")],
  "/devotions/liturgy": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/pages/LiturgySection")],
  "/devotions/daily-liturgy": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/pages/DailyLiturgy")],
  "/devotions/prayers-of-the-mass": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/pages/PrayersOfTheMass")],
  "/devotions/liturgical-seasons": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/pages/LiturgicalSeasons")],
  "/devotions/sacra-liturgia-page": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/pages/SacraLiturgiaPage")],
  "/devotions/challenge": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/pages/Challenge")],
  "/devotions/comparison": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/csaComparison/CsaComparison")],
  "/devotions/progress": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/individualStatus/IndividualProgress")],
  "/devotions/bible": [DEVOTIONS_LAYOUT, () => import("../pages/Devotions/pages/Bible")],
};

// ── Core public routes ──────────────────────────────────────────────────────
const coreLoaders: Loader[] = [
  () => import("../pages/Jumuiya/JumuiyaLanding"),
  () => import("../pages/Jumuiya/JumuiyaDetail"),
  () => import("../pages/sacramental/Community"),
  () => import("../pages/sacramental/CommunityDetail"),
  () => import("../pages/officials/PublicView"),
  () => import("../pages/officials/OfficialProfile"),
  () => import("../pages/officials/PublicHistoryView"),
  () => import("../pages/projects/pages/Home"),
  () => import("../pages/projects/pages/Sacramentals"),
  () => import("../pages/projects/pages/Tshirts"),
  () => import("../pages/projects/pages/Chairs"),
  () => import("../pages/projects/pages/Instruments"),
  () => import("../pages/projects/pages/OtherProjects"),
  () => import("../pages/projects/pages/ProductDetails"),
  () => import("../pages/MyReceipts"),
  () => import("../pages/MyBookings"),
  () => import("../pages/OrderConfirmation"),
  () => import("../pages/HireStatus"),
  () => import("../pages/NotFound"),
];

const coreRouteLoaders: Record<string, Loader[]> = {
  "/jumuiya": [
    () => import("../pages/Jumuiya/JumuiyaLanding"),
    () => import("../pages/Jumuiya/JumuiyaDetail"),
  ],
  "/community": [
    () => import("../pages/sacramental/Community"),
    () => import("../pages/sacramental/CommunityDetail"),
  ],
  "/officials": [
    () => import("../pages/officials/PublicView"),
    () => import("../pages/officials/OfficialProfile"),
    () => import("../pages/officials/PublicHistoryView"),
  ],
  "/projects": [
    () => import("../pages/projects/pages/Home"),
    () => import("../pages/projects/pages/Sacramentals"),
    () => import("../pages/projects/pages/Tshirts"),
    () => import("../pages/projects/pages/Chairs"),
    () => import("../pages/projects/pages/Instruments"),
    () => import("../pages/projects/pages/OtherProjects"),
    () => import("../pages/projects/pages/ProductDetails"),
  ],
  "/my-receipts": [() => import("../pages/MyReceipts")],
  "/my-bookings": [() => import("../pages/MyBookings")],
  "/order-confirmation": [() => import("../pages/OrderConfirmation")],
  "/hire-status": [() => import("../pages/HireStatus")],
};

// ── Admin ───────────────────────────────────────────────────────────────────
const adminShellLoaders: Loader[] = [
  () => import("../pages/Admin/UniversalAdmin"),
  () => import("../pages/Admin/pages/AdminDashboard"),
];

const adminCommonLoaders: Loader[] = [
  ...adminShellLoaders,
  () => import("../pages/Admin/pages/AnnouncementsAdmin"),
  () => import("../pages/Admin/pages/DonationMonitor"),
  () => import("../pages/Admin/pages/WeeklyActivitiesAdmin"),
  () => import("../pages/Admin/pages/SemesterActivitiesAdmin"),
  () => import("../pages/Admin/pages/AdminSuggestions"),
  () => import("../pages/Admin/pages/SuggestionBin"),
  () => import("../pages/Admin/pages/GalleryManager"),
  () => import("../pages/Admin/pages/JumuiyaMembersAdmin"),
  () => import("../pages/Admin/pages/AttendanceTallyAdmin"),
  () => import("../pages/Admin/pages/CsaSecretaryDashboard"),
  () => import("../pages/Admin/pages/Settings"),
  () => import("../pages/Admin/pages/ProjectsManager"),
  () => import("../pages/Admin/pages/CommunityManager"),
];

const adminRouteLoaders: Record<string, Loader[]> = {
  "/admin": adminShellLoaders,
  "/admin/weekly-activities": [...adminShellLoaders, () => import("../pages/Admin/pages/WeeklyActivitiesAdmin")],
  "/admin/semester-activities": [...adminShellLoaders, () => import("../pages/Admin/pages/SemesterActivitiesAdmin")],
  "/admin/announcements": [...adminShellLoaders, () => import("../pages/Admin/pages/AnnouncementsAdmin")],
  "/admin/officials": [...adminShellLoaders, () => import("../pages/officials/AdminPanel")],
  "/admin/devotions": [...adminShellLoaders, () => import("../pages/Devotions/Adminpage/App")],
  "/admin/donations": [...adminShellLoaders, () => import("../pages/Admin/pages/DonationMonitor")],
  "/admin/community-management": [...adminShellLoaders, () => import("../pages/Admin/pages/CommunityManager")],
  "/admin/suggestions": [...adminShellLoaders, () => import("../pages/Admin/pages/AdminSuggestions")],
  "/admin/suggestion-bin": [...adminShellLoaders, () => import("../pages/Admin/pages/SuggestionBin")],
  "/admin/gallery": [...adminShellLoaders, () => import("../pages/Admin/pages/GalleryManager")],
  "/admin/projects": [...adminShellLoaders, () => import("../pages/Admin/pages/ProjectsManager")],
  "/admin/jumuiya-members": [...adminShellLoaders, () => import("../pages/Admin/pages/JumuiyaMembersAdmin")],
  "/admin/attendance-tally": [...adminShellLoaders, () => import("../pages/Admin/pages/AttendanceTallyAdmin")],
  "/admin/registered-members": [...adminShellLoaders, () => import("../pages/Admin/pages/CsaSecretaryDashboard")],
  "/admin/secretary-dashboard": [...adminShellLoaders, () => import("../pages/Admin/pages/SecretaryDashboard")],
  "/admin/activity-log": [...adminShellLoaders, () => import("../pages/Admin/pages/ActivityLog")],
  "/admin/bookings": [...adminShellLoaders, () => import("../pages/Admin/pages/AdminBookings")],
  "/admin/settings": [...adminShellLoaders, () => import("../pages/Admin/pages/Settings")],
  "/admin/developers": [...adminShellLoaders, () => import("../pages/Admin/pages/DeveloperTeamManager")],
};

const routeLoaders: Record<string, Loader[]> = {
  ...devotionsRouteLoaders,
  ...coreRouteLoaders,
  ...adminRouteLoaders,
};

const sortedRouteKeys = Object.keys(routeLoaders).sort((a, b) => b.length - a.length);

/** Prefetch the exact chunk(s) a route needs. Safe to call on hover/focus. */
export function prefetchByPath(path: string): void {
  if (inFlight.size > 30) return; // don't pile up speculative fetches
  const exact = routeLoaders[path];
  if (exact) {
    runAll(exact);
    return;
  }
  const prefix = sortedRouteKeys.find((key) => key !== "/" && path.startsWith(key));
  if (prefix) runAll(routeLoaders[prefix]);
}

/** Prefetch every devotions chunk (Layout + all pages). */
export function prefetchDevotions(): void {
  runAll(devotionsLoaders);
}

/**
 * Warm the whole site in priority waves during idle time.
 * Wave 1 = Devotions (the heaviest / most-used), Wave 2 = core public routes,
 * Wave 3 = admin. Each wave yields between batches to stay polite to the
 * network and CPU while the page is being used.
 */
export async function prefetchAll(): Promise<void> {
  await runAll(devotionsLoaders);
  await tick();
  await runAll(coreLoaders);
  await tick();
  await runAll(adminCommonLoaders);
}
