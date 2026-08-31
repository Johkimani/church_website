import { useEffect, useState } from "react";
import {
  MessageCircle,
  Facebook,
  Music2,
  Save,
  Loader2,
  RefreshCw,
  Link2,
  Share2,
  Check,
} from "lucide-react";
import { apiClient } from "../../../api/axiosInstance";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { SkeletonCardGrid } from "../../../components/Skeleton";

interface ChannelState {
  whatsapp: string;
  facebook: string;
  tiktok: string;
}

const EMPTY: ChannelState = { whatsapp: "", facebook: "", tiktok: "" };

const PLATFORMS: {
  key: keyof ChannelState;
  label: string;
  icon: React.ElementType;
  placeholder: string;
  color: string;
}[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    placeholder: "https://chat.whatsapp.com/...",
    color: "#25D366",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: Facebook,
    placeholder: "https://facebook.com/...",
    color: "#1877F2",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: Music2,
    placeholder: "https://www.tiktok.com/@...",
    color: "#111827",
  },
];

export default function ChannelsManager() {
  const { user } = useAuth();
  const userJumuiyaId = user?.jumuiya_id || "";
  const [jumuiyas, setJumuiyas] = useState<any[]>([]);
  const [channels, setChannels] = useState<Record<string, ChannelState>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Jumuiya-scoped: an official only sees and manages their own jumuiya.
  const ownJumuiyas = jumuiyas.filter(
    (j) => userJumuiyaId && String(j.group_id) === String(userJumuiyaId)
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/jumuiya-data/all");
      const list = (data && data.data) || [];
      setJumuiyas(list);
      const map: Record<string, ChannelState> = {};
      list.forEach((j: any) => {
        const cur: ChannelState = { ...EMPTY };
        (j.socialMedia || []).forEach((sm: any) => {
          const p = (sm.platform || "").toLowerCase();
          if (p.includes("whatsapp")) cur.whatsapp = sm.url || "";
          else if (p.includes("facebook")) cur.facebook = sm.url || "";
          else if (p.includes("tiktok")) cur.tiktok = sm.url || "";
        });
        map[j.id] = cur;
      });
      setChannels(map);
    } catch {
      toast.error("Failed to load jumuiya channels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const setField = (id: string, key: keyof ChannelState, val: string) =>
    setChannels((p) => ({ ...p, [id]: { ...(p[id] || { ...EMPTY }), [key]: val } }));

  const buildPayload = (j: any) => {
    const cur = channels[j.id] || { ...EMPTY };
    return PLATFORMS.map((pl) => ({ platform: pl.label, url: cur[pl.key].trim() })).filter(
      (c) => c.url.length > 0
    );
  };

  const saveJumuiya = async (j: any) => {
    setSavingId(j.id);
    try {
      await apiClient.patch(`/jumuiya-data/${encodeURIComponent(j.id)}/channels`, {
        channels: buildPayload(j),
      });
      toast.success(`${j.name} channels saved`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save channels");
    } finally {
      setSavingId(null);
    }
  };

  const hasAny = (j: any) => {
    const c = channels[j.id] || { ...EMPTY };
    return Boolean(c.whatsapp || c.facebook || c.tiktok);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md">
            <Share2 size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Jumuiya Channels</h2>
            <p className="text-xs text-slate-500 font-medium">
              Manage the WhatsApp, Facebook &amp; TikTok accounts shown on your jumuiya's page
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Hint */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 text-blue-700 px-5 py-4 rounded-2xl">
        <Link2 size={18} className="shrink-0 mt-0.5" />
        <p className="text-sm font-medium">
          Leave a field empty to hide that channel. Channels with a URL are shown on the public
          jumuiya page — admins can paste their official WhatsApp, Facebook and TikTok links.
        </p>
      </div>

      {/* Cards */}
      {loading ? (
        <SkeletonCardGrid count={2} />
      ) : ownJumuiyas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-500 font-bold">No jumuiya linked to your account</p>
          <p className="text-sm text-slate-400 mt-1">Your account is not assigned to a jumuiya.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ownJumuiyas.map((j) => {
            const jColor = j.color || "#6366f1";
            const cur = channels[j.id] || { ...EMPTY };
            return (
              <div
                key={j.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
              >
                {/* Card header */}
                <div
                  className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3"
                  style={{ borderTop: `3px solid ${jColor}` }}
                >
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-slate-800 truncate">{j.name}</h3>
                    <p className="text-[11px] text-slate-400 font-medium truncate">{j.fullName || j.id}</p>
                  </div>
                  {hasAny(j) && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full shrink-0">
                      <Check size={11} /> Active
                    </span>
                  )}
                </div>

                {/* Channel fields */}
                <div className="p-5 space-y-4">
                  {PLATFORMS.map((pl) => {
                    const Icon = pl.icon;
                    return (
                      <div key={pl.key} className="space-y-1.5">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <Icon size={14} style={{ color: pl.color }} />
                          {pl.label}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cur[pl.key] || ""}
                            onChange={(e) => setField(j.id, pl.key, e.target.value)}
                            placeholder={pl.placeholder}
                            className="w-full pr-24 pl-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                          />
                          {cur[pl.key] && (
                            <a
                              href={cur[pl.key]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              Visit
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Card footer */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => saveJumuiya(j)}
                    disabled={savingId === j.id}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 disabled:opacity-60"
                  >
                    {savingId === j.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
