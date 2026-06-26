import React from "react";
import { useNavigate } from "react-router-dom";

export const ArtDeco404: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[75vh] flex items-center justify-center bg-gradient-to-b from-[#031c16] via-[#063329] to-[#021712] text-[#f4efe6] overflow-hidden p-6 md:p-12 rounded-[32px] border border-[#c5a059]/20 shadow-2xl">
      {/* Google Font Import & Inline Styles */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Montserrat:wght@300;400;600&display=swap');
          .font-deco-serif {
            font-family: 'Cinzel', serif;
          }
          .font-deco-sans {
            font-family: 'Montserrat', sans-serif;
          }
          .deco-gold-border {
            border-color: #c5a059;
          }
          .deco-gold-text {
            color: #d4af37;
          }
        `}
      </style>

      {/* Symmetrical Corner Ornaments (Art Deco Corner brackets) */}
      <div className="absolute top-6 left-6 w-16 h-16 pointer-events-none border-t-2 border-l-2 border-[#c5a059]/70">
        <div className="absolute top-1 left-1 w-3 h-3 bg-[#c5a059]" />
        <div className="absolute top-2 left-2 w-8 h-[1px] bg-[#c5a059]/40" />
        <div className="absolute top-2 left-2 h-8 w-[1px] bg-[#c5a059]/40" />
      </div>
      <div className="absolute top-6 right-6 w-16 h-16 pointer-events-none border-t-2 border-r-2 border-[#c5a059]/70">
        <div className="absolute top-1 right-1 w-3 h-3 bg-[#c5a059]" />
        <div className="absolute top-2 right-2 w-8 h-[1px] bg-[#c5a059]/40" />
        <div className="absolute top-2 right-2 h-8 w-[1px] bg-[#c5a059]/40" />
      </div>
      <div className="absolute bottom-6 left-6 w-16 h-16 pointer-events-none border-b-2 border-l-2 border-[#c5a059]/70">
        <div className="absolute bottom-1 left-1 w-3 h-3 bg-[#c5a059]" />
        <div className="absolute bottom-2 left-2 w-8 h-[1px] bg-[#c5a059]/40" />
        <div className="absolute bottom-2 left-2 h-8 w-[1px] bg-[#c5a059]/40" />
      </div>
      <div className="absolute bottom-6 right-6 w-16 h-16 pointer-events-none border-b-2 border-r-2 border-[#c5a059]/70">
        <div className="absolute bottom-1 right-1 w-3 h-3 bg-[#c5a059]" />
        <div className="absolute bottom-2 right-2 w-8 h-[1px] bg-[#c5a059]/40" />
        <div className="absolute bottom-2 right-2 h-8 w-[1px] bg-[#c5a059]/40" />
      </div>

      {/* Symmetrical Inner Geometric Frame */}
      <div className="absolute inset-8 pointer-events-none border border-[#c5a059]/30 rounded-2xl" />
      <div className="absolute inset-10 pointer-events-none border border-[#c5a059]/10 rounded-xl" />

      {/* Background Ray Glow (Art Deco Sunburst) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#c5a059] fill-current">
          <circle cx="50" cy="50" r="10" />
          <path d="M50 0 L51 35 L49 35 Z" />
          <path d="M50 100 L51 65 L49 65 Z" />
          <path d="M0 50 L35 51 L35 49 Z" />
          <path d="M100 50 L65 51 L65 49 Z" />
          <path d="M15 15 L39 40 L37 42 Z" />
          <path d="M85 85 L61 60 L63 58 Z" />
          <path d="M85 15 L60 39 L58 37 Z" />
          <path d="M15 85 L40 61 L42 63 Z" />
        </svg>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-lg w-full text-center flex flex-col items-center py-10 px-4 md:px-8">
        
        {/* Vintage Inspired Geometric Icon (Padlock & Key Medallion) */}
        <div className="w-28 h-28 mb-8 relative flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_12px_rgba(197,160,89,0.3)]">
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C5A059" />
                <stop offset="30%" stopColor="#F5EFEB" />
                <stop offset="70%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#8A6421" />
              </linearGradient>
            </defs>
            {/* Outer Hexagon/Octagon Deco Frame */}
            <polygon points="50,5 88,27 88,73 50,95 12,73 12,27" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
            <polygon points="50,11 83,30 83,70 50,89 17,70 17,30" fill="none" stroke="url(#goldGrad)" strokeWidth="0.8" opacity="0.6" />
            
            {/* Stepped Chevrons */}
            <path d="M35,70 L50,83 L65,70" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" />
            <path d="M40,74 L50,83 L60,74" fill="none" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.8" />
            
            {/* Center Circle & Ornate Key */}
            <circle cx="50" cy="45" r="22" fill="#04221b" stroke="url(#goldGrad)" strokeWidth="1.5" />
            
            {/* Elegant Art Deco Key */}
            <circle cx="50" cy="35" r="6" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
            <line x1="50" y1="41" x2="50" y2="58" stroke="url(#goldGrad)" strokeWidth="2.5" />
            {/* Key bits */}
            <path d="M50,50 L56,50 L56,53 L50,53" fill="url(#goldGrad)" />
            <path d="M50,55 L58,55 L58,58 L50,58" fill="url(#goldGrad)" />
          </svg>
        </div>

        {/* Elegant Serif Headline */}
        <h1 className="font-deco-serif text-3xl md:text-4xl font-extrabold uppercase tracking-[0.2em] text-[#d4af37] mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          Halt, Traveler
        </h1>
        <h2 className="font-deco-serif text-xs md:text-sm tracking-[0.35em] text-[#f4efe6] uppercase mb-6 opacity-80">
          Unauthorized Access
        </h2>

        {/* Art Deco Decorative Divider */}
        <div className="flex items-center justify-center gap-4 w-full mb-8">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#c5a059]" />
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-1.5 h-1.5 bg-[#c5a059] rotate-45" />
            <div className="w-2.5 h-2.5 bg-[#d4af37] rotate-45 border border-[#031c16]" />
            <div className="w-1.5 h-1.5 bg-[#c5a059] rotate-45" />
          </div>
          <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#c5a059]" />
        </div>

        {/* Description / Explanation */}
        <p className="font-deco-sans text-sm font-light text-[#f4efe6]/85 tracking-[0.08em] leading-relaxed mb-10 max-w-sm">
          Your credentials do not grant entry to this specific administrative chamber. This threshold is reserved for assigned officials.
        </p>

        {/* Geometric Vintage-Inspired Action Button */}
        <button
          onClick={() => navigate("/admin")}
          className="group relative font-deco-serif text-xs font-bold tracking-[0.25em] uppercase px-8 py-3.5 border-2 border-[#c5a059] text-[#d4af37] hover:text-[#031c16] hover:bg-[#c5a059] transition-all duration-300 shadow-md shadow-black/30 active:scale-[0.98]"
        >
          {/* Inner border line on hover */}
          <div className="absolute inset-0.5 border border-[#c5a059] group-hover:border-[#031c16] opacity-60 transition-colors pointer-events-none" />
          Return to Hub
        </button>

      </div>
    </div>
  );
};
