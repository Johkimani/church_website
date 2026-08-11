import { logActivity } from "../services/activityLogService.js";

// Public / noise / sensitive flows that must never be recorded.
const SKIP_PREFIXES = [
  "/authentication", "/files", "/payments", "/stkpush", "/hire",
  "/questions", "/assistant", "/member/", "/readings", "/bible",
  "/published", "/gallery/teaser", "/sse", "/setup/admin",
];

const ACTION_VERB = {
  POST: "Created",
  PUT: "Updated",
  PATCH: "Updated",
  DELETE: "Deleted",
};

const ENTITY_LABELS = {
  officials: "official",
  members: "member",
  jumuiya: "jumuiya",
  suggestions: "suggestion",
  activities: "activity",
  weekly_activities: "weekly activity",
  semester_activities: "semester activity",
  bookings: "activity booking",
  attendance: "attendance tally",
  "jumuiya-attendance": "attendance register",
  "jumuiya-members": "jumuiya member",
  "jumuiya-officials": "jumuiya official",
  "group-officials": "group official",
  role: "role assignment",
  settings: "setting",
  gallery: "gallery item",
  projects: "project",
  products: "product",
  orders: "order",
  "hire-requests": "hire request",
  notifications: "notification",
  "category-cards": "category card",
  testimonials: "testimonial",
  "community-view": "community record",
  "admin/activities": "activity",
  announcements: "announcement",
  "slider-items": "slider item",
  "publish-stats": "published statistics",
  "roles": "role",
};

// Higher-value jumuiya/attendance operations deserve precise labels.
const SPECIAL_ACTIONS = [
  { match: /\/jumuiya-members\/csa\/finalize\//, label: "Finalized distribution", type: "member distribution" },
  { match: /\/jumuiya-members\/csa\/distribute$/, label: "Ran member distribution", type: "member distribution" },
  { match: /\/jumuiya-members\/csa\/submit-for-approval/, label: "Submitted distribution for approval", type: "member distribution" },
  { match: /\/jumuiya-members\/csa\/approvals\/.*\/batch-review/, label: "Batch-reviewed allocations", type: "member allocation" },
  { match: /\/jumuiya-members\/csa\/approvals\/.*\/review/, label: "Reviewed allocation", type: "member allocation" },
  { match: /\/jumuiya-members\/csa\/validate-members/, label: "Validated members", type: "member import" },
  { match: /\/jumuiya-members\/.*\/import-records\/.+/, label: "Updated import record", type: "import record" },
  { match: /\/jumuiya-members\/csa\/import-members/, label: "Imported members", type: "member import" },
  { match: /\/jumuiya-members\/.*\/flag$/, label: "Flagged member", type: "jumuiya member" },
  { match: /\/jumuiya-members\/.*\/unflag$/, label: "Unflagged member", type: "jumuiya member" },
  { match: /\/jumuiya-members\/.*\/csa-allocations/, label: "Managed allocations", type: "member allocation" },
  { match: /\/attendance\//, label: "Updated attendance", type: "attendance tally" },
  { match: /\/publish-stats/, label: "Published statistics", type: "statistics" },
  { match: /\/admin\/activities\/bookings\/\d+\/payment$/, label: "Recorded cash payment", type: "activity payment" },
  { match: /\/admin\/activities\/bookings\/\d+\/cancel$/, label: "Cancelled booking", type: "activity booking" },
  { match: /\/admin\/activities\/bookings/, label: "Created booking for member", type: "activity booking" },
];

const isIdSegment = (seg) => /^\d+$/.test(seg) || /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(seg);

const describe = (req, method) => {
  const path = (req.originalUrl || req.path || "")
    .replace(/^\/api(\/v1)?/, "")
    .replace(/\/$/, "")
    .split("?")[0];

  for (const spec of SPECIAL_ACTIONS) {
    if (spec.match.test(path)) {
      return { action: spec.label, entityType: spec.type, entityId: req._activityEntityId ?? null };
    }
  }

  const segments = path.split("/").filter(Boolean);
  const first = segments[0] || "record";
  const entityLabel = ENTITY_LABELS[first] || first.replace(/[-_]/g, " ");
  const lastSeg = segments[segments.length - 1];
  const entityId =
    req._activityEntityId ??
    (lastSeg && lastSeg !== first && isIdSegment(lastSeg) ? lastSeg : null);

  return {
    action: `${ACTION_VERB[method] || "Modified"} ${entityLabel}`,
    entityType: entityLabel,
    entityId,
  };
};

/**
 * Audit middleware for the /api/v1 router. Sits before the concrete routers and
 * records every authenticated mutation once it has responded. req.user may be
 * populated by a later route/auth middleware — by the time 'finish' fires it is
 * present, which is why the write happens on res 'finish'.
 */
const activityLogger = (req, res, next) => {
  const method = (req.method || "").toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return next();

  // Capture the created record id so creates read as "Created <entity> #<id>".
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    try {
      if (body && typeof body === "object" && !req._activityEntityId) {
        const candidate = body.id ?? body.record?.id ?? body.recordId;
        if (candidate != null) req._activityEntityId = String(candidate);
      }
    } catch { /* ignore */ }
    return originalJson(body);
  };

  res.on("finish", () => {
    try {
      if (res.statusCode >= 400) return;
      if (!req.user) return;
      const path = req.originalUrl || req.path || "";
      if (SKIP_PREFIXES.some((prefix) => path.startsWith(prefix))) return;

      const { action, entityType, entityId } = describe(req, method);
      logActivity({
        actor: { ...req.user, ip: req.ip },
        action,
        entityType,
        entityId,
        details: {},
      });
    } catch { /* audit must never break the request */ }
  });

  next();
};

export default activityLogger;
