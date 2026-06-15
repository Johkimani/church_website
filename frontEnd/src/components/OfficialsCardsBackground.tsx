export default function OfficialsCardsBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900" />

      <div className="absolute inset-0 opacity-95">
        <div className="absolute inset-x-0 bottom-0 h-72 wave wave-1" />
        <div className="absolute inset-x-0 bottom-8 h-80 wave wave-2" />
        <div className="absolute inset-x-0 bottom-16 h-96 wave wave-3" />

        <div className="absolute inset-x-0 top-0 h-full overflow-hidden">
          <div className="wave-dot wave-dot-1" />
          <div className="wave-dot wave-dot-2" />
          <div className="wave-dot wave-dot-3" />
          <div className="wave-dot wave-dot-4" />
          <div className="wave-dot wave-dot-5" />
        </div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_45%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_40%)] pointer-events-none" />
    </div>
  );
}


