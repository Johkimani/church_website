import React, { useState, useMemo, useEffect } from "react";
import {
  FaSearch,
  FaBook,
  FaChevronLeft,
  FaChevronRight,
  FaList,
  FaTimes,
  FaShareAlt,
  FaImage,
  FaExternalLinkAlt,
  FaExpand,
  FaStamp,
  FaBookOpen,
  FaCheckCircle,
} from "react-icons/fa";
import {
  csaConstitutionMeta,
  tableOfContents,
  initialCsaPages,
  ConstitutionPageContent,
} from "../data/csaConstitutionData";
import { CoverPageDisplay } from "./CoverPageDisplay";
import { BackToCoverButton } from "./BackToCoverButton";
import { ConstitutionReaderProps } from "./types";
import toast from "react-hot-toast";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";

export const CsaConstitutionView: React.FC<ConstitutionReaderProps> = ({
  onReadingChange,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  const [pageViewMode, setPageViewMode] = useState<"digital" | "scanned">("digital");
  const [coverViewMode, setCoverViewMode] = useState<"digital" | "scanned">("digital");
  const [isCoverZoomed, setIsCoverZoomed] = useState(false);

  // Touch swipe left/right on mobile to flip pages
  const swipeHandlers = useSwipeNavigation({
    onSwipeLeft: () => {
      if (currentPage < csaConstitutionMeta.totalPages) {
        setCurrentPage((p) => Math.min(csaConstitutionMeta.totalPages, p + 1));
        setPageViewMode("digital");
      }
    },
    onSwipeRight: () => {
      if (currentPage > 0) {
        setCurrentPage((p) => Math.max(0, p - 1));
        setPageViewMode("digital");
      }
    },
  });

  // Filter TOC based on search
  const filteredToc = useMemo(() => {
    if (!searchQuery.trim()) return tableOfContents;
    const q = searchQuery.toLowerCase();
    return tableOfContents.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.chapter.toLowerCase().includes(q) ||
        `page ${item.page}`.includes(q)
    );
  }, [searchQuery]);

  // Current page data
  const pageData: ConstitutionPageContent | undefined = useMemo(() => {
    if (currentPage === 0) return undefined;
    return initialCsaPages.find((p) => p.pageNumber === currentPage);
  }, [currentPage]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Kirinyaga University CSA Constitution",
          text: "Read the official Constitution of Kirinyaga University Catholic Students' Association.",
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Constitution link copied to clipboard!");
    }
  };

  const fontSizeClass = "text-base leading-relaxed";

  // Focus mode: tell the parent when we leave the cover letter.
  useEffect(() => {
    onReadingChange?.(currentPage > 0);
  }, [currentPage, onReadingChange]);

  return (
    <div className="w-full">
      {/* Search & Utility Bar */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 mb-6 shadow-xs flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search articles, chapters, or page..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Page counter */}
        <div className="text-xs font-bold text-slate-500">
          {currentPage === 0 ? (
            <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">Cover</span>
          ) : (
            <span className="text-slate-700">
              <strong className="text-blue-600">{currentPage}</strong>
              {" / "}
              <strong>{csaConstitutionMeta.totalPages}</strong>
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Table of contents toggle */}
          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              isTocOpen
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <FaList />
            <span className="hidden sm:inline">Table of Contents</span>
          </button>

          {/* Cover view toggle — only on cover page */}
          {currentPage === 0 && (
            <>
              <div className="inline-flex bg-slate-100 p-0.5 rounded-xl">
                <button
                  onClick={() => setCoverViewMode("digital")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    coverViewMode === "digital"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Digital
                </button>
                <button
                  onClick={() => setCoverViewMode("scanned")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    coverViewMode === "scanned"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FaImage className="text-[10px]" />
                  Original
                </button>
              </div>
              {coverViewMode === "scanned" && (
                <button
                  onClick={() => setIsCoverZoomed(!isCoverZoomed)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <FaExpand className="text-[10px]" />
                  {isCoverZoomed ? "Reset" : "Full View"}
                </button>
              )}
            </>
          )}

          {/* Share button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            title="Share Link"
          >
            <FaShareAlt className="text-xs" />
          </button>
        </div>
      </div>

      {/* Main Layout: TOC Sidebar + Document Content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Table of Contents Drawer/Sidebar */}
        {(isTocOpen || searchQuery) && (
          <aside className="w-full lg:w-80 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <FaBook className="text-blue-600" />
                Outline & Index
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                {filteredToc.length} Sections
              </span>
            </div>

            <div className="space-y-1">
              {filteredToc.map((item) => {
                const isActive = currentPage === item.page;
                const hasScan = item.page >= 0 && item.page <= 22;
                return (
                  <button
                    key={item.page}
                    onClick={() => {
                      setCurrentPage(item.page);
                      setPageViewMode("digital");
                      setIsTocOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-start justify-between gap-2 ${
                      isActive
                        ? "bg-blue-600 text-white font-bold shadow-xs"
                        : "text-slate-700 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <div className="flex-1 truncate">
                      <div className="truncate font-semibold flex items-center gap-1.5">
                        <span className="truncate">{item.title}</span>
                        {hasScan && (
                          <span
                            className={`text-[9px] px-1 rounded ${
                              isActive ? "bg-blue-500 text-white" : "bg-emerald-50 text-emerald-600"
                            }`}
                            title="Page image verified"
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[10px] truncate ${
                          isActive ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {item.chapter}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                        isActive ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.page === 0 ? "Cover" : `P.${item.page}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Reader Centerstage — hidden on mobile when TOC is open */}
        <main
          {...swipeHandlers}
          className={`flex-1 w-full flex flex-col items-center touch-pan-y ${isTocOpen ? "hidden lg:flex" : ""}`}
        >


          {/* Page Display Area */}
          {currentPage === 0 ? (
            /* Cover Page Component */
            <CoverPageDisplay viewMode={coverViewMode} isZoomed={isCoverZoomed} />
          ) : (
            /* Standard Constitution Page Sheet */
            <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-lg p-4 sm:p-8 lg:p-12 relative overflow-hidden transition-all duration-300">
              <div className="border-b border-slate-200 pb-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-500 text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/images/csa-logo.jpg"
                    alt="CSA Logo"
                    className="w-7 h-7 rounded-md object-cover shrink-0"
                  />
                  <div>
                    <div className="font-extrabold uppercase text-slate-800 tracking-wider text-xs">
                      Kirinyaga University Catholic Students' Association Constitution
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Approved by Dean of Students
                    </div>
                  </div>
                </div>

                {pageData?.scannedImageUrl && (
                  <div className="inline-flex bg-slate-100 p-0.5 rounded-lg">
                    <button
                      onClick={() => setPageViewMode("digital")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        pageViewMode === "digital"
                          ? "bg-white text-blue-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Digital View
                    </button>
                    <button
                      onClick={() => setPageViewMode("scanned")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                        pageViewMode === "scanned"
                          ? "bg-white text-blue-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <FaImage className="text-[10px]" />
                      Original Scan
                    </button>
                  </div>
                )}
              </div>

              {/* Scanned Image Mode */}
              {pageViewMode === "scanned" && pageData?.scannedImageUrl ? (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
                    <span className="font-semibold flex items-center gap-1.5">
                      <FaImage className="text-amber-400" />
                      Authentic Document Photo: Page {currentPage}
                    </span>
                    <a
                      href={pageData.scannedImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200"
                    >
                      <FaExternalLinkAlt className="text-[10px]" /> Open Full Size
                    </a>
                  </div>
                  <div className="flex justify-center bg-slate-100 p-2 sm:p-4 rounded-xl border border-slate-200">
                    <img
                      src={pageData.scannedImageUrl}
                      alt={`CSA Constitution Page ${currentPage}`}
                      className="max-h-[850px] w-auto object-contain rounded-lg shadow-md"
                    />
                  </div>
                </div>
              ) : (
                /* Digital Formatted Mode */
                pageData && (
                  <div className="space-y-6">
                    {pageData.title && (
                      <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
                        {pageData.title}
                      </h2>
                    )}

                    {pageData.sections.map((sec, idx) => (
                      <div key={idx} className="mt-6 space-y-4">
                        {sec.heading && (
                          <h3 className="text-lg font-black text-blue-900 tracking-wide uppercase border-b-2 border-blue-100 pb-2">
                            {sec.heading}
                          </h3>
                        )}

                        {sec.subheading && (
                          <h4 className="text-sm font-black text-slate-800 tracking-wide uppercase text-blue-800 mt-2">
                            {sec.subheading}
                          </h4>
                        )}

                        {sec.paragraphs &&
                          sec.paragraphs.map((p, pIdx) => (
                            <p
                              key={pIdx}
                              className={`${fontSizeClass} text-slate-800 text-justify leading-relaxed`}
                            >
                              {p}
                            </p>
                          ))}

                        {sec.numberedList && sec.numberedList.length > 0 && (
                          <div className="space-y-2.5 my-3">
                            {sec.numberedList.map((item, nIdx) => {
                              // If this is a Table of Contents entry, extract destination page
                              const pageMatch = item.text.match(/Page\s+(\d+)/i);
                              const targetPage = pageMatch ? Number(pageMatch[1]) : null;

                              return (
                                <div
                                  key={nIdx}
                                  onClick={() => {
                                    if (targetPage) {
                                      setCurrentPage(targetPage);
                                      setPageViewMode("digital");
                                      window.scrollTo({ top: 120, behavior: "smooth" });
                                    }
                                  }}
                                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                                    targetPage
                                      ? "hover:bg-blue-50/80 cursor-pointer border border-transparent hover:border-blue-100"
                                      : "bg-slate-50/70 border border-slate-100"
                                  }`}
                                >
                                  <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-xs shrink-0 mt-0.5">
                                    {item.num}
                                  </span>
                                  <span
                                    className={`${fontSizeClass} text-slate-800 leading-snug flex-1 ${
                                      targetPage ? "font-semibold text-blue-900" : ""
                                    }`}
                                  >
                                    {item.text}
                                  </span>
                                  {targetPage && (
                                    <span className="text-xs text-blue-600 font-bold shrink-0 self-center">
                                      Go →
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {sec.bullets && sec.bullets.length > 0 && (
                          <ul className="list-disc pl-6 space-y-2 text-slate-800 text-sm">
                            {sec.bullets.map((b, bIdx) => (
                              <li key={bIdx} className={fontSizeClass}>
                                {b}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}

                    {/* Page 22: Official Promulgation & Stamp Display */}
                    {currentPage === 22 && (
                      <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-slate-50 border-2 border-blue-200 shadow-md">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="space-y-4 flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase tracking-wider">
                              <span>✓ Promulgated Charter</span>
                            </div>
                            <h4 className="text-xl font-serif font-black text-slate-900 tracking-tight">
                              Official Executive Signatures & Seal
                            </h4>
                            <div className="space-y-3">
                              {csaConstitutionMeta.signatories.map((sig, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs"
                                >
                                  <div>
                                    <span className="text-xs font-mono font-bold text-slate-400 mr-2">
                                      {sIdx + 1}.
                                    </span>
                                    <strong className="text-sm font-black text-slate-900">
                                      {sig.name}
                                    </strong>
                                    <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                                      {sig.position}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-serif italic text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                                      Signed ✍️
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Official Rubber Stamp Visual */}
                          <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full border-2 border-dashed border-[#1e40af] bg-blue-50/70 p-1 flex flex-col items-center justify-center text-center shadow-md backdrop-blur-xs select-none shrink-0 transform rotate-3 hover:rotate-0 transition-transform">
                            <div className="w-full h-full rounded-full border border-[#2563eb] flex flex-col items-center justify-center p-2 text-[9px] font-bold text-[#1e3a8a] leading-tight">
                              <span className="text-[8px] font-extrabold uppercase text-[#1d4ed8]">
                                ★ K.Y.U. CATHOLIC STUDENTS ASSOCIATION ★
                              </span>
                              <span className="text-red-600 font-black text-xs my-1 tracking-wider bg-red-50/80 px-2 py-0.5 rounded shadow-xs">
                                06 FEB 2022
                              </span>
                              <span className="italic font-serif text-[9px] text-blue-900">
                                Sign: ✍️ Promulgated
                              </span>
                              <span className="text-[7px] text-slate-600 font-semibold mt-1">
                                P.O. Box 143-10300, KERUGOYA
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Document Page Footer */}
              <div className="border-t border-slate-200 mt-12 pt-4 flex items-center justify-between text-xs text-slate-400">
                <span className="italic font-serif">
                  Kirinyaga University Catholic Students' Association Constitution
                </span>
                <span className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {currentPage}
                </span>
              </div>
            </div>
          )}

          {/* Bottom Pagination Bar — attached like Jumuiya */}
          <div className="w-full max-w-4xl border-t border-slate-200/80 px-4 sm:px-6 py-4 bg-slate-50 rounded-b-2xl flex items-center justify-between mt-2">
            <button
              disabled={currentPage === 0}
              onClick={() => {
                setCurrentPage((p) => Math.max(0, p - 1));
                setPageViewMode("digital");
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FaChevronLeft className="text-[10px]" /> Previous Page
            </button>

            <span className="text-xs font-bold text-slate-600">
              {currentPage === 0 ? "Cover" : `Page ${currentPage} of ${csaConstitutionMeta.totalPages}`}
            </span>

            <button
              disabled={currentPage >= csaConstitutionMeta.totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(csaConstitutionMeta.totalPages, p + 1));
                setPageViewMode("digital");
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next Page <FaChevronRight className="text-[10px]" />
            </button>
          </div>

          {/* Back to Cover — shown once the reader has left the cover letter */}
          {currentPage > 0 && (
            <BackToCoverButton
              onBack={() => {
                setCurrentPage(0);
                setPageViewMode("digital");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {/* Metadata Cards — only on cover page, shown after the nav bar */}
          {currentPage === 0 && (
            <div className="w-full max-w-4xl mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <FaStamp className="text-lg" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Promulgated</h4>
                  <p className="text-sm font-black text-slate-900">{csaConstitutionMeta.stampDetails.date}</p>
                  <p className="text-xs text-slate-500">Kerugoya, Kirinyaga County</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <FaBookOpen className="text-lg" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Length</h4>
                  <p className="text-sm font-black text-slate-900">{csaConstitutionMeta.totalPages} Pages Total</p>
                  <p className="text-xs text-slate-500">Comprehensive Association Statutes</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <FaCheckCircle className="text-lg" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Binding Jurisdiction</h4>
                  <p className="text-sm font-black text-slate-900">All CSA Members</p>
                  <p className="text-xs text-slate-500">Supreme Governing Law</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
