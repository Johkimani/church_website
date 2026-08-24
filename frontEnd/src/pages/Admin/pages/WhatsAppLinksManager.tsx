import { useEffect, useState } from "react";
import {
  MessageCircle,
  Save,
  Loader2,
  ExternalLink,
  Trash2,
  Link2,
  Users,
  GraduationCap,
  Church,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { apiClient } from "../../../api/axiosInstance";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

const JUMUIYAS = [
  { slug: "st-anthony", name: "St. Anthony of Padua", color: "#8b5cf6" },
  { slug: "st-augustine", name: "St. Augustine of Hippo", color: "#3b82f6" },
  { slug: "st-catherine", name: "St. Catherine of Alexandria", color: "#800000" },
  { slug: "st-dominic", name: "St. Dominic Guzman", color: "#475569" },
  { slug: "st-elizabeth", name: "St. Elizabeth of Hungary", color: "#059669" },
  { slug: "st-maria-goretti", name: "St. Maria Goretti", color: "#0284c7" },
  { slug: "st-monica", name: "St. Monica of Hippo", color: "#dc2626" },
];

const YEARS = [1, 2, 3, 4];

interface QrWelcomeEntry {
  label: string;
  url: string;
}

interface LinkData {
  general: string;
  years: Record<string, string>;
  jumuiyas: Record<string, string>;
  jumuiyaYears: Record<string, Record<string, string>>;
  qrWelcome?: QrWelcomeEntry[];
  scope?: string;
}

export default function WhatsAppLinksManager() {
  const { user } = useAuth();
  const [data, setData] = useState<LinkData>({ general: "", years: {}, jumuiyas: {}, jumuiyaYears: {}, qrWelcome: [{ label: "", url: "" }, { label: "", url: "" }] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedJumuiya, setExpandedJumuiya] = useState<string | null>(null);

  const isScoped = data.scope && data.scope !== "global" && data.scope !== "none";
  const scopedJumuiya = isScoped ? JUMUIYAS.find(j => j.slug === data.scope) : null;

  useEffect(() => { loadLinks(); }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const { data: resp } = await apiClient.get("/whatsapp-links/all");
      setData(resp);
      // Auto-expand for scoped users (only their jumuiya)
      if (resp.scope && resp.scope !== "global" && resp.scope !== "none") {
        setExpandedJumuiya(resp.scope);
      }
    } catch {
      toast.error("Failed to load WhatsApp links");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put("/whatsapp-links", {
        general: data.general,
        years: data.years,
        jumuiyas: data.jumuiyas,
        jumuiyaYears: data.jumuiyaYears,
        qrWelcome: data.qrWelcome,
      });
      toast.success("WhatsApp links saved successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save links");
    } finally {
      setSaving(false);
    }
  };

  const updateGeneral = (val: string) => setData((p) => ({ ...p, general: val }));
  const updateQrWelcome = (idx: number, field: "label" | "url", val: string) =>
    setData((p) => {
      const arr = [...(p.qrWelcome || [{ label: "", url: "" }, { label: "", url: "" }])];
      arr[idx] = { ...(arr[idx] || { label: "", url: "" }), [field]: val };
      return { ...p, qrWelcome: arr };
    });
  const updateYear = (y: string, val: string) => setData((p) => ({ ...p, years: { ...p.years, [y]: val } }));
  const updateJumuiya = (slug: string, val: string) => setData((p) => ({ ...p, jumuiyas: { ...p.jumuiyas, [slug]: val } }));
  const updateJumuiyaYear = (slug: string, year: string, val: string) =>
    setData((p) => ({
      ...p,
      jumuiyaYears: {
        ...p.jumuiyaYears,
        [slug]: { ...(p.jumuiyaYears[slug] || {}), [year]: val },
      },
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-[#25D366]" />
          Loading WhatsApp links...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-[#25D366]/10 rounded-2xl">
              <MessageCircle className="w-7 h-7 text-[#25D366]" />
            </div>
            WhatsApp Groups
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {isScoped && scopedJumuiya
              ? `Manage WhatsApp group links for ${scopedJumuiya.name}.`
              : "Manage invite links for CSA and Jumuiya WhatsApp groups."}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] disabled:bg-[#25D366]/50 text-white font-bold rounded-xl text-sm transition-all shadow-sm shadow-[#25D366]/20 cursor-pointer"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save Links"}
        </button>
      </div>

      {/* Validation Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-start gap-3">
        <Link2 size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 font-medium">
          All links must start with <code className="bg-amber-100 px-1.5 py-0.5 rounded text-[11px]">https://chat.whatsapp.com/</code>.
          Leave empty to hide that group from members.
        </p>
      </div>

      {/* How It Works — global admins only */}
      {!isScoped && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Visibility Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#25D366] text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <p><strong>All Years:</strong> CSA Main + Jumuiya Main</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#34B7F1] text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <p><strong>Year 1 Only:</strong> CSA Year 1 + Jumuiya Year 1</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Section 1: CSA General — global admins only ──────── */}
      {!isScoped && (
        <Card
          icon={<Users size={20} className="text-[#25D366]" />}
          title="CSA Main Group"
          description="All logged-in CSA members see this"
          accent="#25D366"
        >
          <LinkInput
            value={data.general}
            onChange={updateGeneral}
            placeholder="https://chat.whatsapp.com/..."
            label="CSA General Link"
          />
        </Card>
      )}

      {/* ── Section 1b: QR Registration Welcome Groups — global admins only ──── */}
      {!isScoped && (
        <Card
          icon={<Users size={20} className="text-[#128C7E]" />}
          title="QR Registration Welcome Groups"
          description="Shown to new members immediately after they submit the QR registration form"
          accent="#128C7E"
        >
          <div className="space-y-5">
            {[0, 1].map((idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-3">
                  Group {idx + 1}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Group name</label>
                    <input
                      value={data.qrWelcome?.[idx]?.label || ""}
                      onChange={(e) => updateQrWelcome(idx, "label", e.target.value)}
                      placeholder="e.g. CSA Announcements"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 focus:border-[#25D366]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Invite link</label>
                    <LinkInput
                      value={data.qrWelcome?.[idx]?.url || ""}
                      onChange={(val) => updateQrWelcome(idx, "url", val)}
                      placeholder="https://chat.whatsapp.com/..."
                      label=""
                    />
                  </div>
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-500">
              These two groups appear as green join buttons on the success screen right after someone registers via the QR code.
            </p>
          </div>
        </Card>
      )}

      {/* ── Section 2: CSA Year Groups — global admins only ──── */}
      {!isScoped && (
        <Card
          icon={<GraduationCap size={20} className="text-[#34B7F1]" />}
          title="CSA Year Groups"
          description="Year-specific groups across all Jumuiyas"
          accent="#34B7F1"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {YEARS.map((y) => (
              <LinkInput
                key={y}
                value={data.years[String(y)] || ""}
                onChange={(val) => updateYear(String(y), val)}
                placeholder="https://chat.whatsapp.com/..."
                label={`Year ${y}`}
              />
            ))}
          </div>
        </Card>
      )}

      {/* ── Section 3: Jumuiya Groups ───────────────── */}
      <Card
        icon={<Church size={20} className="text-[#7C3AED]" />}
        title={isScoped && scopedJumuiya ? scopedJumuiya.name : "Jumuiya Groups"}
        description={isScoped && scopedJumuiya ? "Main group + year-specific groups" : "Each Jumuiya has a main group + year-specific groups"}
        accent="#7C3AED"
      >
        <div className="space-y-3">
          {(isScoped ? JUMUIYAS.filter(j => j.slug === data.scope) : JUMUIYAS).map((j) => {
            const isExpanded = expandedJumuiya === j.slug;
            const yearCount = YEARS.filter((y) => data.jumuiyaYears[j.slug]?.[String(y)]?.trim()).length;
            const mainHasValue = !!data.jumuiyas[j.slug]?.trim();

            return (
              <div
                key={j.slug}
                className="border border-slate-200 rounded-xl overflow-hidden"
              >
                {/* Jumuiya Header */}
                <button
                  onClick={() => setExpandedJumuiya(isExpanded ? null : j.slug)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: j.color }} />
                  <span className="text-sm font-bold text-slate-800 text-left flex-1">{j.name}</span>
                  <div className="flex items-center gap-2">
                    {mainHasValue && (
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded">Main</span>
                    )}
                    {yearCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded">{yearCount}/4 Years</span>
                    )}
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={16} className="text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-slate-100">
                    {/* Main Jumuiya Link */}
                    <div className="pt-3">
                      <LinkInput
                        value={data.jumuiyas[j.slug] || ""}
                        onChange={(val) => updateJumuiya(j.slug, val)}
                        placeholder="https://chat.whatsapp.com/..."
                        label={`${j.name} — Main Group`}
                      />
                    </div>

                    {/* Year Groups for this Jumuiya */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Year-Specific Groups
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {YEARS.map((y) => (
                          <LinkInput
                            key={y}
                            value={data.jumuiyaYears[j.slug]?.[String(y)] || ""}
                            onChange={(val) => updateJumuiyaYear(j.slug, String(y), val)}
                            placeholder="https://chat.whatsapp.com/..."
                            label={`Year ${y}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ── Reusable Card wrapper ──────────────────────────────── */
function Card({
  icon,
  title,
  description,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ backgroundColor: `${accent}14` }}>{icon}</div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500 font-medium">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ── Reusable Link Input ────────────────────────────────── */
function LinkInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  label: string;
}) {
  const isValid = !value || value.startsWith("https://chat.whatsapp.com/");
  const hasValue = !!value.trim();

  return (
    <div className="flex-1 min-w-0">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-4 py-2.5 text-sm rounded-xl border-2 transition-all outline-none font-medium ${
            hasValue && isValid ? "pr-20" : "pr-10"
          } ${
            !isValid
              ? "border-red-300 bg-red-50/50 text-red-700 focus:border-red-400"
              : hasValue
                ? "border-[#25D366]/30 bg-[#25D366]/5 text-slate-800 focus:border-[#25D366]"
                : "border-slate-200 bg-white text-slate-800 focus:border-slate-400"
          }`}
        />
        {hasValue && isValid && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={() => onChange("")}
              className="p-1 text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
              title="Clear link"
            >
              <Trash2 size={12} />
            </button>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-slate-400 hover:text-[#25D366] transition-colors"
              title="Open link"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
      {!isValid && (
        <p className="text-[10px] text-red-500 mt-1 font-medium">
          Must start with https://chat.whatsapp.com/
        </p>
      )}
    </div>
  );
}
