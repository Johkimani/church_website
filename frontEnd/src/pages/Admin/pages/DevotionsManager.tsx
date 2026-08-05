import { useState } from "react";
import { Palette, Save, Loader2, Eye, ExternalLink, ImageIcon } from "lucide-react";
import PanelHeader from "../components/PanelHeader";
import { toast } from "react-hot-toast";

type DevotionCard = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  link: string;
  imageUrl: string;
};

const DEFAULT_CARDS: DevotionCard[] = [
  {
    id: "hero",
    title: "Hero Banner",
    subtitle: "Today's Liturgy • Ordinary Time",
    description: "Welcome banner with scripture verse and daily prayer CTA.",
    link: "/devotions/prayer-module",
    imageUrl: "https://images.unsplash.com/photo-1548625361-1854589d8995?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "all-prayers",
    title: "All Prayers",
    subtitle: "Prayers &middot; Novenas &middot; Rosary &middot; Liturgy",
    description: "Prayer book, novenas, rosary, and liturgy guides — everything in one place.",
    link: "/devotions/all-prayers",
    imageUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "daily-challenge",
    title: "Daily Challenge",
    subtitle: "Test Your Faith",
    description: "Explore the liturgy and deepen your understanding of the faith.",
    link: "/devotions/challenge",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "order-mass",
    title: "Order of the Mass",
    subtitle: "Liturgy Guide",
    description: "Follow the Introductory Rites, Liturgy of the Word, and Eucharist.",
    link: "/devotions/liturgy",
    imageUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=800&auto=format&fit=crop",
  },
];

export default function DevotionsManager() {
  const [cards, setCards] = useState<DevotionCard[]>(DEFAULT_CARDS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DevotionCard>(DEFAULT_CARDS[0]);
  const [saving, setSaving] = useState(false);

  const handleEdit = (card: DevotionCard) => {
    setEditingId(card.id);
    setForm({ ...card });
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 800));
    setCards((prev) => prev.map((c) => (c.id === editingId ? { ...form } : c)));
    setEditingId(null);
    setSaving(false);
    toast.success("Card updated and published!");
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSetBackground = (imageUrl: string) => {
    // Find the devotions container and set the CSS custom property
    const container = document.querySelector('.devotions-view-container');
    if (container) {
      container.style.setProperty('--bg-custom-image', `url('${imageUrl}')`);
      toast.success("Background image updated live!");
    } else {
      toast.info("Background will apply when the Devotions page is open.");
      // Store in localStorage as fallback
      localStorage.setItem('devotions-bg-image', imageUrl);
    }
  };

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Devotions Dashboard Manager"
        subtitle="Manage dashboard card images, titles, and links"
        icon={<Palette size={20} />}
        onRefresh={() => {}}
        loading={false}
      />

      {/* Card List */}
      <div className="grid gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all hover:shadow-md"
          >
            {/* Preview */}
            <div
              className="relative h-40 bg-cover bg-center"
              style={{ backgroundImage: `url(${card.imageUrl})` }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(9, 13, 22, 0.9), rgba(9, 13, 22, 0.3))",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-[10px] font-bold tracking-wider text-amber-400 uppercase mb-1">
                  {card.subtitle}
                </p>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                  {card.title}
                </h3>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-600 truncate">{card.description}</p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <ExternalLink size={10} />
                  {card.link}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleSetBackground(card.imageUrl)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors inline-flex items-center gap-1"
                  title="Set as devotions background"
                >
                  <ImageIcon size={12} />
                  Set Background
                </button>
                <button
                  onClick={() => handleEdit(card)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Edit
                </button>
                <a
                  href={card.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                >
                  <Eye size={12} />
                  Preview
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Edit Card</h3>
              <button
                onClick={handleCancel}
                className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Image Preview */}
              <div
                className="relative h-36 rounded-xl bg-cover bg-center overflow-hidden"
                style={{ backgroundImage: `url(${form.imageUrl})` }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(9, 13, 22, 0.8), rgba(9, 13, 22, 0.2))",
                  }}
                />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-[10px] font-bold text-amber-400 uppercase">{form.subtitle}</p>
                  <p className="text-sm font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                    {form.title}
                  </p>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Background Image URL
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Card Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Subtitle / Badge
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all resize-none"
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Link URL
                </label>
                <input
                  type="text"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                  placeholder="/devotions/readings"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 text-sm font-bold rounded-lg text-white transition-all inline-flex items-center gap-2 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #D97706, #B45309)",
                  boxShadow: "0 2px 8px rgba(217, 119, 6, 0.3)",
                }}
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Save &amp; Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
