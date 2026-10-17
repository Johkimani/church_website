import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "../../../api/axiosInstance";
import { timeAgo } from "../../../utils";
import {
  LogIn,
  LogOut,
  KeyRound,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Search,
  X,
  RefreshCw,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Phone,
  MessageCircle,
  Filter,
  Share2,
} from "lucide-react";

interface SignInStats {
  total_logins: number;
  distinct_members: number;
  failed_unknown: number;
  failed_wrong_password: number;
  lockouts: number;
  logouts: number;
  password_changes: number;
  total_members: number;
  members_signed_in: number;
  never_signed_in: number;
}

interface Struggling {
  member_id: string;
  name: string;
  failed: number;
  lockouts: number;
  last_event_at: string | null;
  last_login: string | null;
  is_member: boolean;
  email: string | null;
  phone: string | null;
  jumuiya_name: string | null;
  locked: boolean;
  never_signed_in: boolean;
  needs_help: boolean;
}

interface MemberRow {
  member_id: string;
  name: string;
  jumuiya_name: string | null;
  logins: number;
  failed: number;
  lockouts: number;
  first_login: string | null;
  last_login: string | null;
  last_logout: string | null;
  password_changed_at: string | null;
  last_seen_at: string | null;
  email: string | null;
  phone: string | null;
  locked: boolean;
  setup_complete: boolean;
  approx_session_seconds: number | null;
}

interface JumuiyaOption {
  jumuiya_id: string;
  jumuiya_name: string;
}

interface LoginEvent {
  id: number;
  member_id: string | null;
  email: string | null;
  action: string;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, any>;
  created_at: string;
  name: string | null;
}

const ACTION_META: Record<string, { label: string; cls: string; icon: any }> = {
  login_success: { label: "Signed in", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: LogIn },
  logout: { label: "Signed out", cls: "bg-slate-100 text-slate-600 border-slate-200", icon: LogOut },
  password_changed: { label: "Password changed", cls: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: KeyRound },
  login_failed_unknown: { label: "Unknown ID", cls: "bg-rose-50 text-rose-700 border-rose-200", icon: AlertTriangle },
  login_failed_wrong_password: { label: "Wrong password", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle },
  login_blocked_locked: { label: "Blocked (locked)", cls: "bg-orange-50 text-orange-700 border-orange-200", icon: ShieldAlert },
  login_account_locked: { label: "Account locked", cls: "bg-red-50 text-red-700 border-red-200", icon: ShieldAlert },
};

const actionMeta = (action: string) =>
  ACTION_META[action] || { label: action.replace(/_/g, " "), cls: "bg-slate-100 text-slate-600 border-slate-200", icon: Clock };

type MemberFocus = "" | "signed_in" | "never" | "failed" | "locked" | "password";

const FOCUS_TABS: { key: MemberFocus; label: string }[] = [
  { key: "signed_in", label: "Signed in" },
  { key: "never", label: "Never signed in" },
  { key: "failed", label: "Failed attempts" },
  { key: "locked", label: "Locked" },
  { key: "password", label: "Password changed" },
  { key: "", label: "All" },
];

// Event-feed action groups used by the clickable stat cards.
const SUCCESS_ACTIONS = "login_success";
const FAILED_ACTIONS = "login_failed_unknown,login_failed_wrong_password";
const LOCKED_ACTIONS = "login_blocked_locked,login_account_locked";
const PASSWORD_ACTIONS = "password_changed";

const ACTIONS_LABEL: Record<string, string> = {
  [SUCCESS_ACTIONS]: "Successful sign-ins",
  [FAILED_ACTIONS]: "Failed attempts",
  [LOCKED_ACTIONS]: "Lockouts",
  [PASSWORD_ACTIONS]: "Password changes",
};

const focusTitle = (focus: MemberFocus) =>
  ({
    signed_in: "Members who have signed in",
    never: "Members yet to sign in",
    failed: "Members with failed sign-in attempts",
    locked: "Members with locked accounts",
    password: "Members who changed their password",
    "": "All members",
  }[focus] ||
    "Members");

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const formatDuration = (seconds: number | null) => {
  if (!seconds || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${Math.round(seconds)}s`;
};

// Normalize a Kenyan phone number to international digits for wa.me/tel links.
const toIntlDigits = (raw: string | null) => {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 9 && (digits.startsWith("7") || digits.startsWith("1"))) return `254${digits}`;
  return digits;
};

const whatsappHref = (raw: string | null, name: string) => {
  const intl = toIntlDigits(raw);
  if (!intl) return "";
  const msg = encodeURIComponent(
    `Hello ${name}, this is the CSA Kirinyaga office. We noticed you may be having trouble signing in to the members portal and we'd like to help you get access.`
  );
  return `https://wa.me/${intl}?text=${msg}`;
};

const telHref = (raw: string | null) => {
  const intl = toIntlDigits(raw);
  return intl ? `tel:+${intl}` : "";
};

export default function SignInsPanel() {
  const [jumuiyas, setJumuiyas] = useState<JumuiyaOption[]>([]);
  const [jumuiyaFilter, setJumuiyaFilter] = useState("");

  const [stats, setStats] = useState<SignInStats | null>(null);
  const [struggling, setStruggling] = useState<Struggling[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [membersPage, setMembersPage] = useState(1);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberFocus, setMemberFocus] = useState<MemberFocus>("signed_in");
  const [membersLoading, setMembersLoading] = useState(true);

  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventAction, setEventAction] = useState("");
  const [eventActions, setEventActions] = useState("");
  const [eventsLoading, setEventsLoading] = useState(true);

  const [flash, setFlash] = useState<"" | "members" | "events">("");
  const [sharing, setSharing] = useState(false);
  const membersRef = useRef<HTMLDivElement | null>(null);
  const eventsRef = useRef<HTMLDivElement | null>(null);
  const flashTimer = useRef<number | null>(null);

  const membersLimit = 15;
  const eventsLimit = 20;

  const flashPanel = (which: "members" | "events") => {
    setFlash(which);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(""), 1400);
    (which === "members" ? membersRef : eventsRef).current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Clicking a stat card narrows the matching panel to exactly the members /
  // events it counted, and scrolls that panel into view.
  const focusMembers = (focus: MemberFocus) => {
    setMemberFocus(focus);
    setMembersPage(1);
    flashPanel("members");
  };
  const focusEvents = (actions: string) => {
    setEventActions(eventActions === actions ? "" : actions);
    setEventAction("");
    setEventsPage(1);
    flashPanel("events");
  };

  // Compose the currently filtered member list into a WhatsApp message so a
  // jumuiya coordinator can forward it to their officials for follow-up.
  const SHARE_CAP = 300;
  const shareOnWhatsApp = async () => {
    setSharing(true);
    try {
      const params: any = { limit: 1000, offset: 0 };
      if (memberFocus) params.focus = memberFocus;
      if (jumuiyaFilter) params.jumuiya_id = jumuiyaFilter;
      const res = await apiClient.get("/activity-logs/sign-ins/members", { params });
      const rows: MemberRow[] = res.data.data || [];
      const total = res.data.total || rows.length;
      const scopeName = jumuiyaFilter
        ? jumuiyas.find((j) => j.jumuiya_id === jumuiyaFilter)?.jumuiya_name || "Jumuiya"
        : "All Jumuiyas";
      const shown = rows.slice(0, SHARE_CAP);
      const lines = shown.map(
        (r, i) =>
          `${i + 1}. ${r.name}${r.phone ? ` — ${r.phone}` : ""}${
            !jumuiyaFilter && r.jumuiya_name ? ` (${r.jumuiya_name})` : ""
          }`
      );
      const more = total > shown.length ? `\n…and ${total - shown.length} more.` : "";
      const text =
        `*CSA Kirinyaga — ${focusTitle(memberFocus)}*\n` +
        `${scopeName}: ${total} ${total === 1 ? "member" : "members"}\n\n` +
        `${lines.join("\n")}${more}\n\n` +
        `Please help these members get set up on the members portal.`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    } catch (err) {
      console.error("Failed to build share list", err);
    } finally {
      setSharing(false);
    }
  };

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const params: any = {};
      if (jumuiyaFilter) params.jumuiya_id = jumuiyaFilter;
      const res = await apiClient.get("/activity-logs/sign-ins/summary", { params });
      setStats(res.data.stats || null);
      setStruggling(res.data.struggling || []);
      setJumuiyas(res.data.jumuiyas || []);
    } catch (err) {
      console.error("Failed to fetch sign-in summary", err);
      setStats(null);
      setStruggling([]);
    } finally {
      setSummaryLoading(false);
    }
  }, [jumuiyaFilter]);

  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const params: any = { limit: membersLimit, offset: (membersPage - 1) * membersLimit };
      if (memberSearch) params.search = memberSearch;
      if (memberFocus) params.focus = memberFocus;
      if (jumuiyaFilter) params.jumuiya_id = jumuiyaFilter;
      const res = await apiClient.get("/activity-logs/sign-ins/members", { params });
      setMembers(res.data.data || []);
      setMembersTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch member sign-in summary", err);
      setMembers([]);
      setMembersTotal(0);
    } finally {
      setMembersLoading(false);
    }
  }, [membersPage, memberSearch, memberFocus, jumuiyaFilter]);

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const params: any = { limit: eventsLimit, offset: (eventsPage - 1) * eventsLimit };
      if (eventActions) params.actions = eventActions;
      else if (eventAction) params.action = eventAction;
      if (jumuiyaFilter) params.jumuiya_id = jumuiyaFilter;
      const res = await apiClient.get("/activity-logs/sign-ins/events", { params });
      setEvents(res.data.data || []);
      setEventsTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch sign-in events", err);
      setEvents([]);
      setEventsTotal(0);
    } finally {
      setEventsLoading(false);
    }
  }, [eventsPage, eventAction, eventActions, jumuiyaFilter]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const refreshAll = () => {
    fetchSummary();
    fetchMembers();
    fetchEvents();
  };

  const memberPages = Math.max(1, Math.ceil(membersTotal / membersLimit));
  const eventPages = Math.max(1, Math.ceil(eventsTotal / eventsLimit));

  const statCards = stats
    ? [
        {
          key: "success",
          label: "Successful sign-ins",
          value: stats.total_logins,
          icon: LogIn,
          cls: "text-emerald-600 bg-emerald-50",
          active: eventActions === SUCCESS_ACTIONS,
          onClick: () => focusEvents(SUCCESS_ACTIONS),
        },
        {
          key: "members",
          label: "Members who signed in",
          value: stats.members_signed_in,
          icon: UserCheck,
          cls: "text-indigo-600 bg-indigo-50",
          active: memberFocus === "signed_in",
          onClick: () => focusMembers("signed_in"),
          hint: `of ${stats.total_members} members`,
        },
        {
          key: "failed",
          label: "Failed attempts",
          value: stats.failed_unknown + stats.failed_wrong_password,
          icon: AlertTriangle,
          cls: "text-amber-600 bg-amber-50",
          active: eventActions === FAILED_ACTIONS,
          onClick: () => focusEvents(FAILED_ACTIONS),
        },
        {
          key: "locked",
          label: "Lockouts",
          value: stats.lockouts,
          icon: ShieldAlert,
          cls: "text-rose-600 bg-rose-50",
          active: eventActions === LOCKED_ACTIONS,
          onClick: () => focusEvents(LOCKED_ACTIONS),
        },
        {
          key: "password",
          label: "Password changes",
          value: stats.password_changes,
          icon: KeyRound,
          cls: "text-violet-600 bg-violet-50",
          active: eventActions === PASSWORD_ACTIONS,
          onClick: () => focusEvents(PASSWORD_ACTIONS),
        },
        {
          key: "never",
          label: "Never signed in",
          value: stats.never_signed_in,
          icon: UserX,
          cls: "text-slate-600 bg-slate-100",
          active: memberFocus === "never",
          onClick: () => focusMembers("never"),
          hint: `of ${stats.total_members} members`,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Jumuiya filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
          <Filter size={14} className="text-slate-400" />
          <select
            value={jumuiyaFilter}
            onChange={(e) => {
              setJumuiyaFilter(e.target.value);
              setMembersPage(1);
              setEventsPage(1);
            }}
            className="text-sm font-semibold bg-transparent text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Jumuiyas</option>
            {jumuiyas.map((j) => (
              <option key={j.jumuiya_id} value={j.jumuiya_id}>
                {j.jumuiya_name}
              </option>
            ))}
          </select>
        </div>
        {jumuiyaFilter && (
          <button
            onClick={() => {
              setJumuiyaFilter("");
              setMembersPage(1);
              setEventsPage(1);
            }}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 px-2 py-1"
          >
            <X size={12} /> Clear
          </button>
        )}
        <span className="text-xs text-slate-400 font-medium ml-auto hidden sm:block">
          Filter by jumuiya to share with that jumuiya's officials
        </span>
      </div>

      {/* Stat cards — click a card to jump to the members / events it counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(summaryLoading ? Array.from({ length: 6 }) : statCards).map((c: any, i) => (
          <button
            key={i}
            type="button"
            onClick={summaryLoading ? undefined : c.onClick}
            disabled={summaryLoading}
            className={`text-left bg-white rounded-2xl border p-4 shadow-sm transition-all ${
              summaryLoading
                ? "border-slate-200/80"
                : `cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                    c.active ? "border-indigo-400 ring-2 ring-indigo-200" : "border-slate-200/80"
                  }`
            }`}
          >
            {summaryLoading ? (
              <div className="space-y-2">
                <div className="h-8 w-8 rounded-xl skeleton-shimmer" />
                <div className="h-3 w-20 skeleton-shimmer rounded" />
              </div>
            ) : (
              <>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.cls}`}>
                  <c.icon size={17} />
                </div>
                <p className="text-2xl font-black text-slate-800 mt-2 leading-none">{c.value}</p>
                <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wide">{c.label}</p>
                {c.hint && <p className="text-[10px] font-medium text-slate-400 mt-0.5">{c.hint}</p>}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Needs help signing in */}
      {!summaryLoading && struggling.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-900">Members who need help signing in</h3>
              <p className="text-[11px] font-medium text-amber-700">
                Repeated failed attempts, lockouts, or accounts that never completed first sign-in.
              </p>
            </div>
            <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {struggling.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {struggling.map((s) => (
              <div
                key={s.member_id}
                className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-1.5 shadow-2xs"
                title={s.email || undefined}
              >
                <span className="text-xs font-bold text-slate-800">{s.name}</span>
                {s.name !== s.member_id && (
                  <span className="text-[10px] font-mono text-slate-400">{s.member_id}</span>
                )}
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                  {s.failed} failed
                </span>
                {s.locked && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200">
                    locked
                  </span>
                )}
                {!s.is_member && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                    no account
                  </span>
                )}
                {s.is_member && s.jumuiya_name && (
                  <span className="text-[10px] font-semibold text-slate-400">{s.jumuiya_name}</span>
                )}
                {s.is_member && s.phone && (
                  <div className="flex items-center gap-1 ml-0.5">
                    <a
                      href={telHref(s.phone)}
                      title={`Call ${s.name}`}
                      className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      <Phone size={12} />
                    </a>
                    <a
                      href={whatsappHref(s.phone, s.name)}
                      target="_blank"
                      rel="noreferrer"
                      title={`WhatsApp ${s.name}`}
                      className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-colors"
                    >
                      <MessageCircle size={12} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Member rollup */}
        <div
          ref={membersRef}
          className={`bg-white rounded-3xl border shadow-sm overflow-hidden scroll-mt-24 transition-all ${
            flash === "members" ? "border-indigo-400 ring-2 ring-indigo-300" : "border-slate-200/80"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-indigo-500" />
              <h3 className="text-sm font-black text-slate-800">Member sign-in summary</h3>
              <span className="text-xs font-bold text-slate-400">{membersTotal}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setMembersPage(1);
                  }}
                  placeholder="Search member..."
                  className="w-40 sm:w-44 pl-8 pr-7 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                {memberSearch && (
                  <button
                    onClick={() => {
                      setMemberSearch("");
                      setMembersPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <button
                onClick={shareOnWhatsApp}
                disabled={sharing || membersTotal === 0}
                title="Share this list on WhatsApp"
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-[#25D366] text-white hover:bg-[#1eb355] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                <Share2 size={13} />
                {sharing ? "Preparing…" : "Share"}
              </button>
            </div>
          </div>

          {/* Focus chips — mirror the stat cards */}
          <div className="flex items-center gap-1.5 px-5 pt-3 flex-wrap">
            {FOCUS_TABS.map((t) => (
              <button
                key={t.key || "all"}
                onClick={() => {
                  setMemberFocus(t.key);
                  setMembersPage(1);
                }}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                  memberFocus === t.key
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {membersLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl skeleton-shimmer" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">No members match.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="text-left font-bold px-5 py-2.5">Member</th>
                    <th className="text-center font-bold px-2 py-2.5">Sign-ins</th>
                    <th className="text-left font-bold px-2 py-2.5">Last sign-in</th>
                    <th className="text-left font-bold px-2 py-2.5">Time on system</th>
                    <th className="text-left font-bold px-5 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.member_id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-bold text-slate-800 leading-tight">{m.name}</p>
                        {m.name !== m.member_id && (
                          <p className="text-[10px] font-mono text-slate-400">{m.member_id}</p>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {m.jumuiya_name && <p className="text-[10px] text-slate-400">{m.jumuiya_name}</p>}
                          {m.phone && (
                            <span className="flex items-center gap-0.5">
                              <a
                                href={telHref(m.phone)}
                                title={`Call ${m.name}`}
                                className="w-5 h-5 flex items-center justify-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              >
                                <Phone size={10} />
                              </a>
                              <a
                                href={whatsappHref(m.phone, m.name)}
                                target="_blank"
                                rel="noreferrer"
                                title={`WhatsApp ${m.name}`}
                                className="w-5 h-5 flex items-center justify-center rounded-md bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-colors"
                              >
                                <MessageCircle size={10} />
                              </a>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className="font-black text-slate-700">{m.logins}</span>
                        {m.failed > 0 && (
                          <span className="block text-[10px] font-bold text-rose-500">{m.failed} failed</span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <span className="text-xs text-slate-600 font-medium">{formatDate(m.last_login)}</span>
                        {m.last_login && <span className="block text-[10px] text-slate-400">{timeAgo(m.last_login)}</span>}
                      </td>
                      <td className="px-2 py-3">
                        <span className="text-xs font-bold text-slate-700">{formatDuration(m.approx_session_seconds)}</span>
                        {m.last_seen_at && (
                          <span className="block text-[10px] text-slate-400" title={formatDate(m.last_seen_at)}>
                            last active {timeAgo(m.last_seen_at)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {m.locked ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200">Locked</span>
                          ) : null}
                          {!m.setup_complete ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">Setup incomplete</span>
                          ) : (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {memberPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500">
                Page {membersPage} of {memberPages}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMembersPage(Math.max(1, membersPage - 1))}
                  disabled={membersPage === 1}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setMembersPage(Math.min(memberPages, membersPage + 1))}
                  disabled={membersPage === memberPages}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent events feed */}
        <div
          ref={eventsRef}
          className={`bg-white rounded-3xl border shadow-sm overflow-hidden scroll-mt-24 transition-all ${
            flash === "events" ? "border-indigo-400 ring-2 ring-indigo-300" : "border-slate-200/80"
          }`}
        >
          <div className="flex items-center justify-between gap-3 p-5 border-b border-slate-100">
            <div className="flex items-center gap-2 min-w-0">
              <Clock size={16} className="text-indigo-500 shrink-0" />
              <h3 className="text-sm font-black text-slate-800">Recent sign-in activity</h3>
              <span className="text-xs font-bold text-slate-400">{eventsTotal}</span>
              {eventActions && (
                <button
                  onClick={() => {
                    setEventActions("");
                    setEventsPage(1);
                  }}
                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                >
                  {ACTIONS_LABEL[eventActions] || "Filtered"} <X size={10} />
                </button>
              )}
            </div>
            <select
              value={eventAction}
              onChange={(e) => {
                setEventAction(e.target.value);
                setEventActions("");
                setEventsPage(1);
              }}
              className="text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="">All events</option>
              <option value="login_success">Signed in</option>
              <option value="logout">Signed out</option>
              <option value="password_changed">Password changed</option>
              <option value="login_failed_unknown">Unknown ID</option>
              <option value="login_failed_wrong_password">Wrong password</option>
              <option value="login_blocked_locked">Blocked (locked)</option>
              <option value="login_account_locked">Account locked</option>
            </select>
          </div>

          {eventsLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl skeleton-shimmer" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">No events recorded.</div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[560px] overflow-y-auto">
              {events.map((ev) => {
                const meta = actionMeta(ev.action);
                const Icon = meta.icon;
                return (
                  <div key={ev.id} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50/70 transition-colors">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${meta.cls}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${meta.cls}`}>{meta.label}</span>
                        <span className="text-xs font-bold text-slate-700 truncate">
                          {ev.name || ev.member_id || "Unknown"}
                        </span>
                        {ev.name && ev.name !== ev.member_id && (
                          <span className="text-[10px] font-mono text-slate-400">{ev.member_id}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                        <span className="text-slate-500">{formatDate(ev.created_at)}</span>
                        <span>•</span>
                        <span>{timeAgo(ev.created_at)}</span>
                        {ev.ip_address && (
                          <>
                            <span>•</span>
                            <span className="font-mono">IP: {ev.ip_address}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {eventPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500">
                Page {eventsPage} of {eventPages}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEventsPage(Math.max(1, eventsPage - 1))}
                  disabled={eventsPage === 1}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setEventsPage(Math.min(eventPages, eventsPage + 1))}
                  disabled={eventsPage === eventPages}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
