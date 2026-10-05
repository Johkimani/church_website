import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/axiosInstance";
import { LocalStorage } from "../utils";
import {
  MessageCircle,
  X,
  ExternalLink,
  CheckCircle2,
  PartyPopper,
} from "lucide-react";

interface WhatsAppLinks {
  general: string | null;
  csaYear: string | null;
  jumuiyaMain: string | null;
  jumuiyaYear: string | null;
  yearLevel: number | null;
  isFirstYear: boolean;
  jumuiyaSlug: string | null;
  jumuiyaName: string | null;
}

interface JoinedState {
  general?: boolean;
  csaYear?: boolean;
  jumuiyaMain?: boolean;
  jumuiyaYear?: boolean;
  dismissed?: boolean;
}

const STORAGE_PREFIX = "csa_wa_joined_";

function getJoined(memberId: string): JoinedState {
  return LocalStorage.get(`${STORAGE_PREFIX}${memberId}`) || {};
}

function saveJoined(memberId: string, state: JoinedState) {
  LocalStorage.set(`${STORAGE_PREFIX}${memberId}`, state);
}

export default function WhatsAppWidget() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<WhatsAppLinks | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState<JoinedState>(() =>
    user?.member_id ? getJoined(user.member_id) : {}
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const fetchedRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const memberId = user?.member_id || "";

  // Fetch links from backend
  useEffect(() => {
    if (!isAuthenticated || fetchedRef.current) {
      if (!isAuthenticated) setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.get("/whatsapp-links");
        if (!cancelled) {
          setLinks(data);
          fetchedRef.current = true;
        }
      } catch {
        if (!cancelled) fetchedRef.current = true;
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  // Sync joined state from localStorage
  useEffect(() => {
    if (memberId) setJoined(getJoined(memberId));
  }, [memberId]);

  // Cleanup timer
  useEffect(() => {
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, []);

  // Compute which groups to show and whether all are joined
  const { groups, allJoined, remainingCount } = useMemo(() => {
    if (!links) return { groups: [], allJoined: false, remainingCount: 0 };

    const g: { key: string; label: string; sublabel: string; href: string; color: string }[] = [];

    // 1. CSA General — ALL years
    if (links.general) {
      g.push({
        key: "general",
        label: "CSA Main Group",
        sublabel: "All CSA members",
        href: links.general,
        color: "bg-[#25D366]",
      });
    }

    // 2. CSA Year Group — FIRST YEARS ONLY
    if (links.csaYear && links.isFirstYear) {
      g.push({
        key: "csaYear",
        label: `CSA Year ${links.yearLevel || 1}`,
        sublabel: "First year students",
        href: links.csaYear,
        color: "bg-[#34B7F1]",
      });
    }

    // 3. Jumuiya Main — ALL years
    if (links.jumuiyaMain && links.jumuiyaName) {
      g.push({
        key: "jumuiyaMain",
        label: links.jumuiyaName,
        sublabel: "Your Jumuiya",
        href: links.jumuiyaMain,
        color: "bg-[#7C3AED]",
      });
    }

    // 4. Jumuiya Year — FIRST YEARS ONLY
    if (links.jumuiyaYear && links.isFirstYear && links.jumuiyaName) {
      g.push({
        key: "jumuiyaYear",
        label: `${links.jumuiyaName} Year 1`,
        sublabel: "First year Jumuiya group",
        href: links.jumuiyaYear,
        color: "bg-[#F59E0B]",
      });
    }

    const remaining = g.filter((item) => !joined[item.key]);

    return {
      groups: g,
      allJoined: g.length > 0 && remaining.length === 0,
      remainingCount: remaining.length,
    };
  }, [links, joined]);

  // Auto-hide after showing success
  useEffect(() => {
    if (allJoined && open) {
      hideTimerRef.current = setTimeout(() => {
        setOpen(false);
        setShowSuccess(false);
      }, 3000);
    }
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [allJoined, open]);

  const handleLinkClick = (key: string) => {
    const updated = { ...joined, [key]: true };
    setJoined(updated);
    if (memberId) saveJoined(memberId, updated);
    // Check if all joined using the UPDATED state
    if (groups.every((g) => updated[g.key])) {
      setShowSuccess(true);
    }
  };

  const handleDismissAll = () => {
    const dismissed: JoinedState = {};
    groups.forEach((g) => { dismissed[g.key as keyof JoinedState] = true; });
    dismissed.dismissed = true;
    setJoined(dismissed);
    if (memberId) saveJoined(memberId, dismissed);
    setShowSuccess(true);
    hideTimerRef.current = setTimeout(() => { setOpen(false); setShowSuccess(false); }, 2500);
  };

  const handleUndo = () => {
    setJoined({});
    if (memberId) saveJoined(memberId, {});
    setShowSuccess(false);
  };

  // Don't render if not ready. The join widget is for members only, so keep it
  // off the admin side (officials are already assumed to be in the groups).
  if (location.pathname.startsWith("/admin")) return null;
  if (!isAuthenticated || loading || !links) return null;
  if (groups.length === 0) return null;
  if (allJoined && !showSuccess) return null;

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <>
      {/* ── FAB (bottom-left) ─────────────────────────── */}
      <button
        onClick={() => { if (!allJoined) { setOpen(!open); setShowSuccess(false); } }}
        className={`fixed bottom-5 left-5 md:bottom-6 md:left-6 z-[9998] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 cursor-pointer group ${
          allJoined
            ? "bg-emerald-500 shadow-emerald-200 hover:bg-emerald-600"
            : "bg-[#25D366] hover:bg-[#20ba5a] shadow-[#25D366]/30 hover:scale-110"
        }`}
        aria-label="WhatsApp Community Groups"
        title={allJoined ? "All groups joined!" : "Join our WhatsApp groups"}
      >
        {allJoined ? (
          <CheckCircle2 size={24} className="text-white" />
        ) : open ? (
          <X size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" />
        ) : (
          <MessageCircle size={24} className="text-white group-hover:scale-110 transition-transform duration-300" />
        )}
        {!open && !allJoined && remainingCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
            {remainingCount}
          </span>
        )}
      </button>

      {/* ── Success Overlay ───────────────────────────── */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => { setShowSuccess(false); setOpen(false); }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PartyPopper size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">You're all set!</h3>
            <p className="text-slate-500 text-sm font-medium mb-4">
              You've joined all your WhatsApp groups. The icon will no longer appear.
            </p>
            <button
              onClick={() => { setShowSuccess(false); setOpen(false); }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Drawer (bottom-left) ──────────────────────── */}
      <div
        className={`fixed bottom-24 left-5 md:left-6 z-[9998] w-[320px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-left ${
          open && !allJoined
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-sm">CSA WhatsApp Groups</h3>
              <p className="text-white/70 text-[11px] font-medium truncate">
                {firstName}, join your communities
              </p>
            </div>
            {joined.dismissed && (
              <button
                onClick={handleUndo}
                className="text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
              >
                Undo
              </button>
            )}
          </div>
        </div>

        {/* Group Links */}
        <div className="p-4 space-y-2.5">
          {groups.map((group) => {
            const isJoined = !!joined[group.key];
            return (
              <a
                key={group.key}
                href={group.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(group.key)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
                  isJoined ? "bg-emerald-50/80 opacity-75" : "hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                    isJoined ? "bg-emerald-500" : group.color
                  }`}
                >
                  {isJoined ? (
                    <CheckCircle2 size={18} className="text-white" />
                  ) : (
                    <MessageCircle size={18} className="text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold transition-colors truncate ${
                      isJoined
                        ? "text-emerald-700 line-through decoration-emerald-300"
                        : "text-slate-800 group-hover:text-[#25D366]"
                    }`}
                  >
                    {group.label}
                  </p>
                  <p className={`text-[11px] font-medium ${isJoined ? "text-emerald-500" : "text-slate-400"}`}>
                    {isJoined ? "Joined" : group.sublabel}
                  </p>
                </div>
                {isJoined ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-wider shrink-0">
                    Joined
                  </span>
                ) : (
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-[#25D366] transition-colors shrink-0" />
                )}
              </a>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
          {groups.every((g) => joined[g.key]) ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <CheckCircle2 size={14} />
              <span className="text-xs font-bold">All groups joined!</span>
            </div>
          ) : (
            <button
              onClick={handleDismissAll}
              className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 font-semibold transition-colors cursor-pointer py-0.5"
            >
              I've already joined all groups
            </button>
          )}
        </div>
      </div>

      {/* ── Backdrop ──────────────────────────────────── */}
      {open && !allJoined && (
        <div
          className="fixed inset-0 z-[9997] bg-black/10 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
