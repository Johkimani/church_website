import React, { useState, useMemo } from "react";
import {
  FaUserTie,
  FaBookOpen,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaPrint,
  FaShareAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaFilePdf,
  FaExpand,
  FaDownload,
} from "react-icons/fa";
import {
  coordinatorConstitutionPages,
  CoordinatorPageContent,
} from "../data/coordinatorsConstitutionData";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";

export const CoordinatorsConstitutionView: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"digital" | "scan">("digital");
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const totalPages = coordinatorConstitutionPages.length;

  // Touch swipe left/right on mobile to flip pages
  const swipeHandlers = useSwipeNavigation({
    onSwipeLeft: () => {
      if (currentPage < totalPages) {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
      }
    },
    onSwipeRight: () => {
      if (currentPage > 1) {
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    },
  });

  const activePageData = useMemo<CoordinatorPageContent>(() => {
    return (
      coordinatorConstitutionPages.find((p) => p.pageNumber === currentPage) ||
      coordinatorConstitutionPages[0]
    );
  }, [currentPage]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return coordinatorConstitutionPages.filter((page) => {
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
          title: "Kirinyaga University CSA - Jumuiya Coordinators Guidelines",
          text: `Read Page ${currentPage} of the Jumuiya Coordinators Constitution.`,
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-emerald-700/40">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-white">
              Jumuiya Coordinators Constitution
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-sans">
              Statutory charter, coordination protocols, oversight responsibilities, and procedural guidelines for the Jumuiya Coordinators serving Kirinyaga University Catholic Students' Association (C.S.A).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <a
              href="/documents/jumuiya-coordinators-booklet.pdf"
              download="Kirinyaga_University_CSA_Jumuiya_Coordinators_Booklet.pdf"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <FaDownload className="text-xs" />
              Download Booklet PDF
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
                    ? "bg-white text-emerald-700 shadow-xs"
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
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FaFilePdf className="text-xs" />
                Physical Scan
              </button>
            </div>

            {/* Action Buttons: Share & Print */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all active:scale-95"
                title="Share link"
              >
                <FaShareAlt className="text-xs text-emerald-600" />
                <span>Share</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all active:scale-95"
                title="Print Page"
              >
                <FaPrint className="text-xs text-slate-600" />
                <span>Print</span>
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
              placeholder="Search coordinators guidelines..."
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-w-0 flex-1 sm:w-auto sm:max-w-[180px] truncate"
              >
                {coordinatorConstitutionPages.map((p) => (
                  <option key={p.pageNumber} value={p.pageNumber}>
                    {p.pageNumber} — {p.title}
                  </option>
                ))}
              </select>
              <span className="shrink-0 text-slate-500 text-[11px] sm:text-xs">of {totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
                  }}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 flex items-center justify-between text-xs transition-colors"
                >
                  <span className="font-bold text-slate-800">
                    Page {res.pageNumber}: {res.title}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                    Jump to page →
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {copiedLink && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold text-center animate-fade-in">
          Link copied to clipboard!
        </div>
      )}

      {/* Main Document Viewer */}
      <div
        {...swipeHandlers}
        className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden min-h-[500px] flex flex-col touch-pan-y"
      >
        {/* Document Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/40">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
              {activePageData.category || "Statutory Charter"} • Page {activePageData.pageNumber} of {totalPages}
            </span>
            <h3 className="text-base sm:text-lg font-serif font-black tracking-tight text-white">
              {activePageData.title}
            </h3>
          </div>

          {activePageData.scanImageUrl && (
            <button
              onClick={() => setIsZoomModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 text-xs font-bold transition-all shadow-xs"
            >
              <FaExpand className="text-[11px]" />
              Inspect Scan
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-8 lg:p-10 flex-1">
          {viewMode === "scan" ? (
            /* Physical Scan View */
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative border border-slate-300 rounded-2xl overflow-hidden shadow-lg max-w-2xl w-full bg-slate-100 flex items-center justify-center p-2 group">
                {activePageData.scanImageUrl ? (
                  <img
                    src={activePageData.scanImageUrl}
                    alt={`Coordinators Booklet Page ${activePageData.pageNumber}`}
                    className="w-full h-auto object-contain rounded-xl shadow-xs"
                  />
                ) : (
                  <div className="p-12 text-center text-slate-400">
                    Scan for page {activePageData.pageNumber} will appear here.
                  </div>
                )}
                {activePageData.scanImageUrl && (
                  <button
                    onClick={() => setIsZoomModalOpen(true)}
                    className="absolute bottom-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2.5 rounded-xl text-xs font-bold backdrop-blur-xs flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <FaExpand /> Full Screen
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 italic">
                Official scan from the Kirinyaga University Catholic Students' Association archive.
              </p>
            </div>
          ) : (
            /* Digital Reader View */
            <div className="max-w-3xl mx-auto space-y-8 text-slate-800 text-sm sm:text-base">
              {/* PAGE 1: COVER SPECIAL DISPLAY */}
              {activePageData.pageNumber === 1 && (
                <div className="text-center py-6 px-4 sm:px-8 border-2 border-emerald-200/80 rounded-3xl bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/30 shadow-xs space-y-6">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-black tracking-widest text-slate-700 uppercase">
                      Kirinyaga University Catholic Students' Association
                    </p>
                    <p className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
                      Small Christian Communities
                    </p>
                  </div>

                  <div className="py-2">
                    <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-widest text-slate-900 underline underline-offset-8 decoration-emerald-500">
                      BOOKLET
                    </h1>
                  </div>

                  {/* Emblem Circle */}
                  <div className="flex justify-center my-4">
                    <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-emerald-500/80 shadow-xl bg-white p-1">
                      {activePageData.scanImageUrl ? (
                        <img
                          src={activePageData.scanImageUrl}
                          alt="Jumuiya Coordinators Cover"
                          className="w-full h-full object-cover object-center rounded-full scale-110"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-emerald-600 text-white flex flex-col items-center justify-center p-4">
                          <FaUserTie className="text-5xl mb-2 text-amber-300" />
                          <span className="text-xs font-bold text-center">
                            Jumuiya Coordinators
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* St Thomas Aquinas Quote */}
                  <div className="max-w-xl mx-auto py-2">
                    <p className="text-sm sm:text-base font-serif font-bold italic text-slate-800 leading-snug">
                      "BETTER TO ILLUMINATE THAN MERELY TO SHINE, TO DELIVER TO OTHERS CONTEMPLATED TRUTHS THAN MERELY TO CONTEMPLATE"
                    </p>
                    <p className="text-xs font-bold text-emerald-800 mt-2 uppercase tracking-wider">
                      — “ST THOMAS AQUINAS” —
                    </p>
                  </div>

                  {/* Title */}
                  <div className="pt-2">
                    <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-wider uppercase text-emerald-800">
                      JUMUIA COORDINATORS
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Small Christian Communities Coordination Office
                    </p>
                  </div>
                </div>
              )}

              {/* Standard Page Content */}
              {activePageData.sections.map((section, sIdx) => {
                if (activePageData.pageNumber === 1 && section.type === "cover") {
                  return null; // Already rendered in cover box above
                }

                return (
                  <div key={sIdx} className="space-y-4">
                    {section.heading && (
                      <h4 className="text-lg sm:text-xl font-serif font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                        <span>{section.heading}</span>
                        {section.badge && (
                          <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {section.badge}
                          </span>
                        )}
                      </h4>
                    )}

                    {section.subheading && (
                      <h5 className="text-sm sm:text-base font-bold text-emerald-900 uppercase tracking-wide">
                        {section.subheading}
                      </h5>
                    )}

                    {/* Paragraphs */}
                    {section.paragraphs?.map((pText, pIdx) => (
                      <p
                        key={pIdx}
                        className={`leading-relaxed text-slate-700 ${
                          section.type === "quote"
                            ? "italic font-serif text-slate-800 border-l-4 border-emerald-500 pl-4 py-1"
                            : ""
                        }`}
                      >
                        {pText}
                      </p>
                    ))}

                    {/* Alert Type */}
                    {section.type === "alert" && (
                      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 sm:p-5 text-amber-900 space-y-2.5">
                        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
                          <FaExclamationTriangle className="text-amber-600" />
                          Mandatory Binding Directives
                        </div>
                        {section.paragraphs && (
                          <div className="space-y-1 text-xs sm:text-sm">
                            {section.paragraphs.map((p, pIdx) => (
                              <p key={pIdx}>{p}</p>
                            ))}
                          </div>
                        )}
                        {section.items && (
                          <ul className="space-y-2 text-xs sm:text-sm">
                            {section.items.map((it, iIdx) => (
                              <li key={iIdx} className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold">•</span>
                                <span>{it}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* TOC Type */}
                    {section.type === "toc" && section.items && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                        {section.items.map((it, iIdx) => {
                          const parts = it.split("—");
                          const titlePart = parts[0]?.trim();
                          const pagePart = parts[1]?.trim() || "";
                          const targetPage = parseInt(pagePart.replace(/\D/g, "")) || 1;
                          return (
                            <button
                              key={iIdx}
                              onClick={() => setCurrentPage(targetPage)}
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 text-left transition-all group"
                            >
                              <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-emerald-700">
                                {titlePart}
                              </span>
                              <span className="text-xs font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                {pagePart}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Items List (Rules / Duties) */}
                    {section.type !== "alert" &&
                      section.type !== "toc" &&
                      section.items && (
                        <div className="space-y-2.5">
                          {section.items.map((item, iIdx) => (
                            <div
                              key={iIdx}
                              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-100/90 hover:bg-emerald-50/40 hover:border-emerald-100 transition-colors"
                            >
                              <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 text-[11px] mt-0.5 shrink-0">
                                <FaCheckCircle />
                              </div>
                              <span className="text-slate-800 leading-snug">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })}

              {/* Signatories Section if any */}
              {activePageData.signatories && activePageData.signatories.length > 0 && (
                <div className="mt-8 pt-8 border-t-2 border-slate-200 space-y-6">
                  <h4 className="text-base font-bold text-slate-900 uppercase tracking-wider text-center">
                    Official Endorsement & Execution
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {activePageData.signatories.map((sig, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            {sig.title}
                          </span>
                          <span className="text-sm font-bold text-slate-900 block font-serif">
                            {sig.name}
                          </span>
                        </div>

                        {sig.hasStamp && (
                          <div className="my-3 p-2 rounded-2xl border-2 border-dashed border-blue-600/70 bg-blue-50/80 text-center select-none rotate-2">
                            <span className="text-[8px] font-extrabold uppercase text-blue-900 block">
                              ★ K.Y.U. CATHOLIC STUDENTS ASSOCIATION ★
                            </span>
                            <span className="inline-block text-red-600 font-black text-xs my-0.5 tracking-wider bg-red-100/80 px-2 py-0.5 rounded">
                              06 FEB 2022
                            </span>
                            <span className="text-[8px] text-slate-600 font-semibold block">
                              P.O. Box 143-10300, KERUGOYA
                            </span>
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-slate-300 relative">
                          <span className="font-serif italic text-emerald-800 text-lg select-none opacity-80 block">
                            {sig.signed ? sig.name.split(" ")[0] : "—"}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">
                            Official Signature
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Document Footer */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Kirinyaga University CSA</span>
            <span>•</span>
            <span>Jumuiya Coordinators Guidelines</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 transition-colors"
            >
              Previous
            </button>
            <span className="font-mono font-bold text-slate-700 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
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
              Page {activePageData.pageNumber} — Jumuiya Coordinators Booklet Scan
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
