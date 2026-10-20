import React from "react";
import { FaCheckCircle, FaStamp } from "react-icons/fa";

interface CoverPageDisplayProps {
  viewMode: "digital" | "scanned";
  isZoomed: boolean;
}

export const CoverPageDisplay: React.FC<CoverPageDisplayProps> = ({ viewMode, isZoomed }) => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Main Cover Render */}
      {viewMode === "digital" ? (
        /* Digital Recreation of the Physical Cover */
        <div className="relative w-full max-w-[620px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Spiral binder aesthetic line on the left */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-100/90 border-r border-slate-200 flex flex-col justify-evenly items-center py-4 z-20">
            {Array.from({ length: 22 }).map((_, i) => (
              <div
                key={i}
                className="w-3.5 h-3.5 rounded-full bg-slate-800/80 shadow-inner border border-slate-400 flex items-center justify-center"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>

          {/* Paper Content Area */}
          <div className="pl-12 pr-6 sm:pr-10 py-10 flex flex-col justify-between min-h-[760px] bg-gradient-to-b from-[#fafbfe] via-white to-[#f7f9fd]">
            {/* Top Teal Header Banner */}
            <div>
              <div className="bg-[#48b2de] text-white py-3.5 px-4 text-center rounded-sm shadow-xs border-b-2 border-[#2b96c4]">
                <h2 className="text-xs sm:text-sm md:text-base font-black tracking-wider uppercase leading-snug drop-shadow-xs">
                  Kirinyaga University St.Thomas Aquinas
                  <br />
                  Catholic Students' Association.
                </h2>
              </div>

              {/* Title Section */}
              <div className="mt-10 sm:mt-14 text-center relative">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black tracking-widest text-[#2c7199] uppercase">
                  Constitution
                </h1>
                <div className="w-24 h-1 bg-[#48b2de] mx-auto mt-2 rounded-full" />

                {/* Stamp placed on top right like the physical copy */}
                <div className="absolute -top-4 right-0 sm:right-2 transform rotate-6 hover:rotate-0 transition-transform cursor-pointer">
                  <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-full border-2 border-dashed border-[#1e40af] bg-blue-50/70 p-1 flex flex-col items-center justify-center text-center shadow-xs backdrop-blur-xs select-none">
                    <div className="w-full h-full rounded-full border border-[#2563eb] flex flex-col items-center justify-center p-1 text-[8px] sm:text-[9px] font-bold text-[#1e3a8a] leading-tight">
                      <span className="text-[7px] font-extrabold uppercase text-[#1d4ed8]">
                        ★ K.Y.U. Catholic Students Association ★
                      </span>
                      <span className="text-red-600 font-black text-[10px] sm:text-[11px] my-0.5 tracking-wider bg-red-50/80 px-1 rounded">
                        06 FEB 2022
                      </span>
                      <span className="italic font-serif text-[8px] text-blue-900">
                        Sign: ✍️ Certified
                      </span>
                      <span className="text-[6.5px] text-slate-600 font-semibold mt-0.5">
                        P.O. Box 143-10300, KERUGOYA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Central Seal / Emblem */}
            <div className="my-8 flex flex-col items-center justify-center">
              <div className="relative group">
                {/* Subtle radiant halo behind logo */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-200 to-blue-200 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity" />

                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full p-2 bg-white shadow-xl border-4 border-cyan-100 flex items-center justify-center overflow-hidden">
                  <img
                    src="/images/csa-logo.jpg"
                    alt="Kirinyaga University Catholic Students Association Seal"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>

              {/* Verified Ribbon */}
              <div className="inline-flex items-center gap-1.5 mt-5 bg-blue-50 border border-blue-200 text-blue-800 px-3.5 py-1 rounded-full text-xs font-bold shadow-xs">
                <FaCheckCircle className="text-blue-600" />
                <span>Authentic Promulgated Charter</span>
              </div>
            </div>

            {/* Bottom Subtitle and Bar */}
            <div className="mt-auto">
              <div className="text-center mb-6">
                <p className="text-xs sm:text-sm font-black tracking-wider text-[#2680a6] uppercase font-serif">
                  Kirinyaga University St Thomas Aquinas
                  <br />
                  Catholic Students' Association:
                </p>
              </div>

              {/* Bottom Teal Bar */}
              <div className="w-full h-4 bg-[#48b2de] rounded-xs shadow-xs" />
            </div>
          </div>
        </div>
      ) : (
        /* Scanned High-Res Physical Copy View */
        <div
          className={`relative w-full max-w-2xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl transition-all ${
            isZoomed ? "max-w-4xl" : ""
          }`}
        >
          <div className="p-2 sm:p-4 bg-slate-950 flex items-center justify-between text-white text-xs border-b border-slate-800">
            <span className="font-semibold flex items-center gap-1.5 text-slate-300">
              <FaStamp className="text-amber-400" />
              Physical Scanned Cover (Spiral Bound Document)
            </span>
            <span className="text-slate-400">Enacted 06 Feb 2022</span>
          </div>

          <div className="flex justify-center items-center bg-slate-900/90 p-2 sm:p-4">
            <img
              src="/images/csa-constitution-cover.jpg"
              alt="Official Signed Kirinyaga University CSA Constitution Cover"
              className="max-h-[750px] w-auto object-contain rounded-lg shadow-2xl transition-transform duration-200 hover:scale-[1.01]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
