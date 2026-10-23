import React, { useState, useMemo, useEffect } from "react";
import {
  FaMusic,
  FaBookOpen,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaShareAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaFilePdf,
  FaExpand,
  FaDownload,
  FaClock,
  FaCalendarAlt,
  FaUserCheck,
} from "react-icons/fa";
import {
  choirConstitutionPages,
  choirConstitutionMeta,
  ChoirPageContent,
} from "../data/choirConstitutionData";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";
import { BackToCoverButton } from "./BackToCoverButton";
import { ConstitutionReaderProps } from "./types";

export const ChoirConstitutionView: React.FC<ConstitutionReaderProps> = ({
  onReadingChange,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"digital" | "scan">("digital");
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const totalPages = choirConstitutionPages.length;

  // Touch swipe left/right on mobile to flip pages
  const swipeHandlers = useSwipeNavigation({
    onSwipeLeft: () => {
      if (currentPage < totalPages) {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
        window.scrollTo({ top: 120, behavior: "smooth" });
      }
    },
    onSwipeRight: () => {
      if (currentPage > 1) {
        setCurrentPage((p) => Math.max(1, p - 1));
        window.scrollTo({ top: 120, behavior: "smooth" });
      }
    },
  });

  const activePageData = useMemo<ChoirPageContent>(() => {
    return (
      choirConstitutionPages.find((p) => p.pageNumber === currentPage) ||
      choirConstitutionPages[0]
    );
  }, [currentPage]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return choirConstitutionPages.filter((page) => {
      const matchTitle = page.title.toLowerCase().includes(query);
      const matchCategory = page.category?.toLowerCase().includes(query);
      const matchSections = page.sections.some(
        (sec) =>
          sec.heading?.toLowerCase().includes(query) ||
          sec.subheading?.toLowerCase().includes(query) ||
          sec.paragraphs?.some((p) => p.toLowerCase().includes(query)) ||
          sec.items?.some((item) => item.toLowerCase().includes(query))
      );
      const matchSignatories = page.signatories?.some(
        (sig) =>
          sig.name.toLowerCase().includes(query) ||
          sig.title.toLowerCase().includes(query)
      );
      return matchTitle || matchCategory || matchSections || matchSignatories;
    });
  }, [searchQuery]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Kirinyaga University CSA — St. Thomas Aquinas Choir Constitution",
          text: `Read Page ${currentPage} of the St. Thomas Aquinas Choir Constitution.`,
          url,
        });
      } catch {
        // Fallback
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Focus mode: page 1 is the cover letter/front cover.
  useEffect(() => {
    onReadingChange?.(currentPage > 1);
  }, [currentPage, onReadingChange]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 sm:px-8 py-6 sm:py-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold mb-1">
              <FaMusic className="text-[11px]" />
              <span>Liturgical Music Ministry</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              St. Thomas Aquinas Choir Constitution
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Official statutes governing music practices, liturgical rehearsals, code of conduct, executive roles, and member welfare.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={choirConstitutionMeta.pdfUrl}
              download="Kirinyaga_University_CSA_Choir_Constitution.pdf"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all active:scale-95"
            >
              <FaDownload className="text-xs" />
              Download PDF
            </a>
          </div>
        </div>
      </div>

      {/* Reader Controls Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3 sm:p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Top Row: View Mode Toggle on left + Share & Print on right */}
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setViewMode("digital")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "digital"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FaBookOpen className="text-xs" />
                Digital Reader
              </button>
              <button
                onClick={() => setViewMode("scan")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "scan"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FaFilePdf className="text-xs" />
                Physical Scan
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all active:scale-95"
                title="Share link"
              >
                <FaShareAlt className="text-xs text-blue-600" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md w-full">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search choir constitution (e.g. practices, uniform, elections)..."
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>

          {/* Page Pagination Controls */}
          <div className="flex items-center justify-between lg:justify-end gap-1.5 sm:gap-2 w-full lg:w-auto">
            <button
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
              title="Previous Page"
            >
              <FaChevronLeft className="text-xs" />
            </button>

            <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold text-slate-700 min-w-0 flex-1 sm:flex-initial">
              <span className="shrink-0 text-slate-500">Page</span>
              <select
                value={currentPage}
                onChange={(e) => {
                  setCurrentPage(Number(e.target.value));
                  window.scrollTo({ top: 120, behavior: "smooth" });
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 min-w-0 flex-1 sm:w-auto sm:max-w-[180px] truncate"
              >
                {choirConstitutionPages.map((p) => (
                  <option key={p.pageNumber} value={p.pageNumber}>
                    {p.pageNumber} — {p.title}
                  </option>
                ))}
              </select>
              <span className="shrink-0 text-slate-500 text-[11px] sm:text-xs">of {totalPages}</span>
            </div>

            <button
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
              title="Next Page"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>

        {/* Search Results Drawer */}
        {searchQuery && (
          <div className="mt-3 pt-3 border-t border-slate-100 max-h-52 overflow-y-auto space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Found {searchResults.length} matching page(s)
            </div>
            {searchResults.length === 0 ? (
              <div className="text-xs text-slate-400 py-2">
                No matching content found for "{searchQuery}".
              </div>
            ) : (
              searchResults.map((res) => (
                <button
                  key={res.pageNumber}
                  onClick={() => {
                    setCurrentPage(res.pageNumber);
                    setSearchQuery("");
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 flex items-center justify-between text-xs transition-colors"
                >
                  <span className="font-bold text-slate-800">
                    Page {res.pageNumber}: {res.title}
                  </span>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
                    Jump to page →
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {copiedLink && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs font-semibold text-center animate-fade-in">
          Link copied to clipboard!
        </div>
      )}

      {/* Main Document Viewer */}
      <div
        {...swipeHandlers}
        className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden min-h-[640px] flex flex-col justify-between"
      >
        <div className="p-6 sm:p-10 lg:p-12">
          {currentPage > 1 && (
            <BackToCoverButton onBack={() => setCurrentPage(1)} />
          )}

          {viewMode === "scan" && activePageData.scanImageUrl ? (
            /* Physical Scan Mode */
            <div className="flex flex-col items-center">
              <div className="relative group max-w-2xl w-full border border-slate-200 rounded-2xl overflow-hidden shadow-lg bg-slate-900/5">
                <img
                  src={activePageData.scanImageUrl}
                  alt={`Scan Page ${activePageData.pageNumber}`}
                  className="w-full h-auto object-contain cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
                  onClick={() => setIsZoomModalOpen(true)}
                />
                <button
                  onClick={() => setIsZoomModalOpen(true)}
                  className="absolute bottom-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-all"
                >
                  <FaExpand /> Full Screen
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                Click image or "Full Screen" to enlarge high-resolution scan.
              </p>
            </div>
          ) : (
            /* Digital Reader Mode */
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Header on page */}
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
                    {activePageData.category || "Statutes"}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                    {activePageData.title}
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {currentPage === 1 ? "Cover" : `P. ${currentPage}`}
                </span>
              </div>

              {/* Cover Page Special Display */}
              {currentPage === 1 && (
                <div className="space-y-6">
                  <div className="p-8 sm:p-10 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white rounded-3xl shadow-xl relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 space-y-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-xs text-white text-2xl shadow-inner mx-auto mb-2">
                        <FaMusic />
                      </div>
                      <h1 className="text-xl sm:text-3xl font-black uppercase tracking-wide">
                        Kirinyaga University St. Thomas Aquinas CSA Choir
                      </h1>
                      <div className="w-16 h-1 bg-amber-400 mx-auto rounded-full" />
                      <h2 className="text-lg sm:text-2xl font-bold text-blue-100 tracking-wider">
                        THE CONSTITUTION
                      </h2>
                      <p className="text-xs sm:text-sm text-blue-200/90 italic max-w-lg mx-auto">
                        “Sing to the Lord a new song; sing to the Lord, all the earth.” (Psalm 96:1)
                      </p>
                    </div>
                  </div>

                  {/* Rehearsal Schedule Quick Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-1">
                        <FaClock className="text-blue-600" />
                        <span>Tuesday Practice</span>
                      </div>
                      <p className="text-sm font-black text-slate-900">
                        {choirConstitutionMeta.rehearsalSchedule.tuesday}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Common songs & part rehearsals</p>
                    </div>

                    <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-1">
                        <FaCalendarAlt className="text-amber-600" />
                        <span>Saturday Practice</span>
                      </div>
                      <p className="text-sm font-black text-slate-900">
                        {choirConstitutionMeta.rehearsalSchedule.saturday}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Mass preparation & new pieces</p>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                        <FaUserCheck className="text-emerald-600" />
                        <span>Sunday Warm-up</span>
                      </div>
                      <p className="text-sm font-black text-slate-900">
                        {choirConstitutionMeta.rehearsalSchedule.sundayWarmup}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Mandatory pre-Mass session</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sections Render (page 1 uses the dedicated cover layout above) */}
              {currentPage !== 1 && activePageData.sections.map((sec, idx) => (
                <div key={idx} className="space-y-3">
                  {sec.badge && (
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 rounded-md">
                      {sec.badge}
                    </span>
                  )}
                  {sec.heading && (
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      {sec.heading}
                    </h4>
                  )}
                  {sec.subheading && (
                    <h5 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                      {sec.subheading}
                    </h5>
                  )}

                  {sec.type === "cover" && (
                    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white space-y-2">
                      {sec.paragraphs?.map((p, pIdx) => (
                        <p key={pIdx} className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                          {p}
                        </p>
                      ))}
                    </div>
                  )}

                  {sec.type === "quote" && (
                    <div className="border-l-4 border-blue-600 pl-4 py-2 bg-blue-50/50 rounded-r-xl italic text-slate-700 text-sm">
                      {sec.paragraphs?.map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                    </div>
                  )}

                  {sec.type === "alert" && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs sm:text-sm space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-800">
                        <FaExclamationTriangle />
                        <span>Important Directive</span>
                      </div>
                      {sec.paragraphs?.map((p, pIdx) => (
                        <p key={pIdx} className="leading-relaxed">
                          {p}
                        </p>
                      ))}
                      {sec.items && (
                        <ul className="list-disc pl-5 space-y-1">
                          {sec.items.map((it, itIdx) => (
                            <li key={itIdx}>{it}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {sec.type === "rules" && (
                    <div className="space-y-2">
                      {sec.paragraphs?.map((p, pIdx) => (
                        <p key={pIdx} className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                          {p}
                        </p>
                      ))}
                      {sec.items && (
                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs sm:text-sm text-slate-700">
                          {sec.items.map((it, itIdx) => (
                            <div key={itIdx} className="leading-relaxed">
                              {it}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {sec.type === "toc" && (
                    <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200/80 space-y-2.5">
                      {sec.items?.map((it, itIdx) => {
                        const parts = it.split(" — ");
                        const titlePart = parts[0];
                        const pagePart = parts[1];
                        return (
                          <div
                            key={itIdx}
                            className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-slate-200/40 last:border-b-0 hover:text-blue-600 transition-colors"
                          >
                            <span className="font-semibold text-slate-700">
                              {titlePart}
                            </span>
                            {pagePart && (
                              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                {pagePart}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(!sec.type || sec.type === "standard") && (
                    <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {sec.paragraphs?.map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                      {sec.items && (
                        <ul className="space-y-1.5 pl-2">
                          {sec.items.map((it, itIdx) => (
                            <li key={itIdx} className="flex items-start gap-2">
                              <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Signatories Display */}
              {activePageData.signatories && activePageData.signatories.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">
                    Official Committee Assent & Signatures
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {activePageData.signatories.map((sig, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 text-center space-y-2 relative overflow-hidden"
                      >
                        <div className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                          {sig.title}
                        </div>
                        <div className="font-bold text-slate-900 text-sm">
                          {sig.name}
                        </div>
                        <div className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <FaCheckCircle className="text-[10px]" /> Signed & Sealed
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Pagination Bar */}
        <div className="border-t border-slate-200/80 px-6 sm:px-8 py-4 bg-slate-50 flex items-center justify-between text-xs font-bold">
          <button
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 120, behavior: "smooth" });
            }}
            disabled={currentPage <= 1}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <FaChevronLeft className="text-[10px]" /> Previous Page
          </button>

          <span className="text-xs font-bold text-slate-600">
            {currentPage === 1 ? "Cover" : `Page ${currentPage} of ${totalPages}`}
          </span>

          <button
            onClick={() => {
              setCurrentPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 120, behavior: "smooth" });
            }}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next Page <FaChevronRight className="text-[10px]" />
          </button>
        </div>
      </div>

      {/* Full-Screen Zoom Modal */}
      {isZoomModalOpen && activePageData.scanImageUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[92vh] w-full flex flex-col items-center">
            <button
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-amber-400 p-2 text-xl font-bold transition-colors"
              title="Close modal"
            >
              <FaTimes />
            </button>
            <div className="overflow-auto rounded-2xl bg-slate-900 border border-slate-700 p-2 shadow-2xl max-h-[85vh]">
              <img
                src={activePageData.scanImageUrl}
                alt={`Scan Page ${activePageData.pageNumber}`}
                className="max-w-full h-auto object-contain rounded-xl"
              />
            </div>
            <div className="text-center text-xs text-slate-400 mt-2 font-semibold">
              Page {activePageData.pageNumber} — St. Thomas Aquinas Choir Constitution Scan
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
