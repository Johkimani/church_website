import { useState } from "react";
import { Images, Save, Loader2, RotateCcw, Upload } from "lucide-react";
import PanelHeader from "../components/PanelHeader";
import { toast } from "react-hot-toast";

type AssetCard = {
  id: string;
  label: string;
  currentUrl: string;
  defaultUrl: string;
};

const DEFAULT_ASSETS: AssetCard[] = [
  {
    id: "hero",
    label: "Hero Banner",
    currentUrl: "https://images.unsplash.com/photo-1548625361-1854589d8995?q=80&w=1600&auto=format&fit=crop",
    defaultUrl: "https://images.unsplash.com/photo-1548625361-1854589d8995?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "all-prayers",
    label: "All Prayers Card",
    currentUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop",
    defaultUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "daily-challenge",
    label: "Daily Challenge Card",
    currentUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop",
    defaultUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "order-mass",
    label: "Order of the Mass Card",
    currentUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=800&auto=format&fit=crop",
    defaultUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=800&auto=format&fit=crop",
  },
];

const STORAGE_KEY = "dashboard-assets";

function loadSaved(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveToDisk(data: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function DashboardAssetsManager() {
  const [assets, setAssets] = useState<AssetCard[]>(() => {
    const saved = loadSaved();
    return DEFAULT_ASSETS.map((a) => ({
      ...a,
      currentUrl: saved[a.id] || a.defaultUrl,
    }));
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleEdit = (asset: AssetCard) => {
    setEditingId(asset.id);
    setInputUrl(asset.currentUrl);
  };

  const handleApply = async () => {
    if (!editingId) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));

    const updated = assets.map((a) =>
      a.id === editingId ? { ...a, currentUrl: inputUrl } : a
    );
    setAssets(updated);

    // Persist
    const map: Record<string, string> = {};
    updated.forEach((a) => { map[a.id] = a.currentUrl; });
    saveToDisk(map);

    // Live sync hero image on dashboard
    if (editingId === "hero") {
      localStorage.setItem("dashboard-hero-image", inputUrl);
    }

    setEditingId(null);
    setSaving(false);
    toast.success("Asset updated and published!");
  };

  const handleReset = async (asset: AssetCard) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));

    const updated = assets.map((a) =>
      a.id === asset.id ? { ...a, currentUrl: a.defaultUrl } : a
    );
    setAssets(updated);

    const map: Record<string, string> = {};
    updated.forEach((a) => { map[a.id] = a.currentUrl; });
    saveToDisk(map);

    if (asset.id === "hero") {
      localStorage.setItem("dashboard-hero-image", asset.defaultUrl);
    }

    setSaving(false);
    toast.success("Reset to default artwork.");
  };

  const handleResetAll = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setAssets(DEFAULT_ASSETS.map((a) => ({ ...a, currentUrl: a.defaultUrl })));
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("dashboard-hero-image");
    setSaving(false);
    toast.success("All assets reset to defaults.");
  };

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Dashboard Assets Manager"
        subtitle="Change background images for every dashboard card"
        icon={<Images size={20} />}
        onRefresh={() => {}}
        loading={false}
        actions={
          <button
            onClick={handleResetAll}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw size={12} />
            Reset All
          </button>
        }
      />

      {/* Asset Grid */}
      <div className="grid gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all hover:shadow-md"
          >
            {/* Image Preview */}
            <div className="relative h-32 overflow-hidden">
              <img
                src={asset.currentUrl}
                alt={asset.label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = asset.defaultUrl;
                }}
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(9, 13, 22, 0.85), transparent)" }}
              />
              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-sm font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                  {asset.label}
                </p>
              </div>
              {asset.currentUrl !== asset.defaultUrl && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500/90 text-[10px] font-bold text-white">
                  CUSTOM
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400 truncate font-mono">{asset.currentUrl}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleReset(asset)}
                  disabled={saving || asset.currentUrl === asset.defaultUrl}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors inline-flex items-center gap-1 disabled:opacity-40"
                >
                  <RotateCcw size={10} />
                  Reset
                </button>
                <button
                  onClick={() => handleEdit(asset)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg text-white transition-all inline-flex items-center gap-1"
                  style={{ background: "linear-gradient(135deg, #D97706, #B45309)" }}
                >
                  <Upload size={10} />
                  Change
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                Change Image — {assets.find((a) => a.id === editingId)?.label}
              </h3>
              <button
                onClick={() => setEditingId(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Preview */}
              <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={inputUrl || assets.find((a) => a.id === editingId)?.defaultUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = assets.find((a) => a.id === editingId)?.defaultUrl || "";
                  }}
                />
                <div className="absolute inset-0" style={{ background: OVERLAY }} />
                <div className="absolute bottom-3 left-3">
                  <p className="text-xs font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                    {assets.find((a) => a.id === editingId)?.label}
                  </p>
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Image URL
                </label>
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Catholic Art Presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Cathedral", url: "https://images.unsplash.com/photo-1548625361-1854589d8995?q=80&w=800&auto=format&fit=crop" },
                    { label: "Night Sky", url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop" },
                    { label: "Sacred Art", url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop" },
                    { label: "Rosary", url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=800&auto=format&fit=crop" },
                    { label: "Altar", url: "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=800&auto=format&fit=crop" },
                    { label: "Candlelight", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setInputUrl(preset.url)}
                      className="relative h-16 rounded-lg overflow-hidden group border-2 transition-all"
                      style={{
                        borderColor: inputUrl === preset.url ? "#D97706" : "transparent",
                      }}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-end">
                        <span className="text-[9px] font-bold text-white px-1.5 pb-1">{preset.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingId(null)}
                className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={saving || !inputUrl.trim()}
                className="px-5 py-2.5 text-sm font-bold rounded-lg text-white transition-all inline-flex items-center gap-2 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #D97706, #B45309)", boxShadow: "0 2px 8px rgba(217, 119, 6, 0.3)" }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Apply &amp; Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const OVERLAY = "linear-gradient(to top, rgba(9, 13, 22, 0.92), rgba(9, 13, 22, 0.45))";
