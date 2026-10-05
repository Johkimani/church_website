import { useEffect, useRef, useState } from "react";
import { FaPhoneAlt, FaTimes, FaUsers, FaExpand } from "react-icons/fa";
import {
  type Developer,
  type ChairpersonContact,
  type DeveloperTeamSettings,
  loadDeveloperSettings,
  loadDeveloperSettingsFromServer,
} from "./developerTeamStore";

interface DeveloperModalProps {
  open: boolean;
  onClose: () => void;
  developers?: Developer[];
  chairperson?: ChairpersonContact;
}

function Avatar({ name, avatar, gradient }: { name: string; avatar?: string; gradient: string }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={`${name}'s avatar`}
        className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10"
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold ring-2 ring-white/10"
      style={{ background: gradient }}
      aria-hidden="true"
    >
      {initials || <FaPhoneAlt size={18} />}
    </div>
  );
}

export default function DeveloperModal({
  open,
  onClose,
  developers,
  chairperson,
}: DeveloperModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const saved = loadDeveloperSettings();
  const [serverSettings, setServerSettings] = useState<DeveloperTeamSettings | null>(null);
  const devs = developers ?? serverSettings?.developers ?? saved.developers;
  const chair = chairperson ?? serverSettings?.chairperson ?? saved.chairperson;
  const teamPhoto = serverSettings?.teamPhoto ?? saved.teamPhoto;
  const [showDevs, setShowDevs] = useState(false);
  const [viewPhoto, setViewPhoto] = useState(false);
  const viewPhotoRef = useRef(false);
  viewPhotoRef.current = viewPhoto;
  const [viewDev, setViewDev] = useState<Developer | null>(null);
  const viewDevRef = useRef<Developer | null>(null);
  viewDevRef.current = viewDev;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    loadDeveloperSettingsFromServer().then((settings) => {
      if (!cancelled && settings) setServerSettings(settings);
    });

    const dialog = dialogRef.current;
    previouslyFocused.current = document.activeElement as HTMLElement;

    const focusables = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button, a[href], input, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const first = focusables()[0];
    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (viewDevRef.current) {
          setViewDev(null);
          return;
        }
        if (viewPhotoRef.current) {
          setViewPhoto(false);
          return;
        }
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const active = document.activeElement as HTMLElement;
      const inside = dialog?.contains(active);
      if (e.shiftKey && (active === firstEl || !inside)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && (active === lastEl || !inside)) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes dmBackdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dmCardIn {
          from { opacity: 0; transform: scale(0.92) translateY(14px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
        style={{
          background: "rgba(2, 6, 23, 0.75)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          animation: "dmBackdropIn 0.25s ease both",
        }}
        onClick={onClose}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dm-title"
          aria-describedby="dm-description"
          className="relative w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl"
          style={{
            background: "linear-gradient(180deg, #111827 0%, #0b1220 100%)",
            boxShadow: "0 40px 100px -20px rgba(0,0,0,0.7)",
            animation: "dmCardIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close development team dialog"
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <FaTimes size={16} />
          </button>

          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300"
                style={{ background: "rgba(59, 130, 246, 0.12)", border: "1px solid rgba(59, 130, 246, 0.25)" }}
              >
                Crafted with &hearts;
              </div>
              <h2
                id="dm-title"
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Development Team
              </h2>
              <p id="dm-description" className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                The passionate developers who brought this platform to life.
              </p>
            </div>

            {/* Team photo — hero */}
            <div className="mt-6">
              {teamPhoto ? (
                <button
                  type="button"
                  onClick={() => setViewPhoto(true)}
                  aria-label="View team photo full size"
                  className="relative w-full block group rounded-2xl overflow-hidden ring-1 ring-white/10"
                >
                  <img
                    src={teamPhoto}
                    alt="Development team group photo"
                    className="w-full max-h-80 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <span className="absolute inset-0 bg-black/25 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-slate-800 text-xs font-bold shadow">
                      <FaExpand size={11} />
                      View full size
                    </span>
                  </span>
                </button>
              ) : (
                <div
                  className="w-full min-h-40 rounded-2xl flex flex-col items-center justify-center text-center p-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))",
                    border: "1px dashed rgba(255,255,255,0.2)",
                  }}
                >
                  <FaUsers size={26} className="text-slate-500" />
                  <p className="text-sm text-slate-400 mt-2">Team photo coming soon</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowDevs((v) => !v)}
                aria-expanded={showDevs}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <FaUsers size={13} />
                {showDevs ? "Hide developers" : "Meet the developers"}
              </button>
              <a
                href={`tel:${chair.phone.replace(/[\s()-]/g, "")}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                  boxShadow: "0 8px 20px -6px rgba(59, 130, 246, 0.5)",
                }}
              >
                <FaPhoneAlt size={13} />
                Contact the Chairperson
              </a>
            </div>

            {/* Developer cards — revealed on demand */}
            {showDevs && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {devs.map((dev) => (
                  <div
                    key={dev.name}
                    className="flex flex-col items-center text-center p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {dev.avatar ? (
                      <button
                        type="button"
                        onClick={() => setViewDev(dev)}
                        aria-label={`View ${dev.name}'s photo`}
                        title="Click to view photo"
                        className="relative w-16 h-16 rounded-full overflow-hidden group ring-2 ring-white/10"
                      >
                        <Avatar name={dev.name} avatar={dev.avatar} gradient={dev.gradient} />
                        <span className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <FaExpand size={16} className="text-white" />
                        </span>
                      </button>
                    ) : (
                      <Avatar name={dev.name} avatar={dev.avatar} gradient={dev.gradient} />
                    )}
                    <p className="mt-3 text-sm font-semibold text-white">{dev.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{dev.role}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Chairperson contact */}
            <div className="mt-6 rounded-2xl p-[1px]" style={{ background: "linear-gradient(120deg, #2563EB, #3B82F6, rgba(59,130,246,0.3))" }}>
              <div
                className="rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4"
                style={{ background: "#0b1220" }}
              >
                <Avatar name={chair.name} gradient="linear-gradient(135deg, #F59E0B, #EF4444)" />
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">Contact the Chairperson</p>
                  <p className="text-base font-bold text-white mt-1">{chair.name}</p>
                  <p className="text-xs text-slate-400">{chair.role}</p>
                </div>
                <a
                  href={`tel:${chair.phone.replace(/[\s()-]/g, "")}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)", boxShadow: "0 8px 20px -6px rgba(59, 130, 246, 0.5)" }}
                >
                  <FaPhoneAlt size={13} />
                  {chair.phone}
                </a>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-[10px] text-slate-500 mt-6 tracking-wider">
              &copy; {new Date().getFullYear()} St. Thomas Aquinas CSA
            </p>
          </div>
        </div>
      </div>

      {/* Photo lightbox */}
      {viewPhoto && teamPhoto && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
          style={{ background: "rgba(2, 6, 23, 0.94)", backdropFilter: "blur(4px)" }}
          onClick={() => setViewPhoto(false)}
        >
          <button
            onClick={() => setViewPhoto(false)}
            aria-label="Close photo"
            className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <FaTimes size={20} />
          </button>
          <img
            src={teamPhoto}
            alt="Development team photo full size"
            className="max-w-full max-h-[92vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Developer photo lightbox */}
      {viewDev && viewDev.avatar && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
          style={{ background: "rgba(2, 6, 23, 0.94)", backdropFilter: "blur(4px)" }}
          onClick={() => setViewDev(null)}
        >
          <button
            onClick={() => setViewDev(null)}
            aria-label="Close photo"
            className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <FaTimes size={20} />
          </button>
          <div className="text-center max-w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={viewDev.avatar}
              alt={`${viewDev.name}'s photo full size`}
              className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl mx-auto"
            />
            <p className="mt-4 text-white font-semibold">{viewDev.name}</p>
            <p className="text-sm text-slate-400">{viewDev.role}</p>
          </div>
        </div>
      )}
    </>
  );
}
