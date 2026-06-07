export default function OfficialsHeroBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-slate-100 to-slate-200" />

      <div className="absolute inset-0 opacity-95">
        <div className="absolute inset-x-0 bottom-0 h-60 hero-wave hero-wave-1" />
        <div className="absolute inset-x-0 bottom-8 h-72 hero-wave hero-wave-2" />
        <div className="absolute inset-x-0 bottom-16 h-80 hero-wave hero-wave-3" />

        <div className="absolute inset-x-0 top-0 h-full overflow-hidden">
          <div className="hero-wave-dot hero-wave-dot-1" />
          <div className="hero-wave-dot hero-wave-dot-2" />
          <div className="hero-wave-dot hero-wave-dot-3" />
          <div className="hero-wave-dot hero-wave-dot-4" />
        </div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_38%)] pointer-events-none" />
    </div>
  );
}
