import React, { useState, useMemo } from "react";
import {
  FaChurch,
  FaBookOpen,
  FaSearch,
  FaFilePdf,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaExpand,
  FaTimes,
  FaPrint,
  FaShareAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUsers,
} from "react-icons/fa";
import {
  jumuiyaList,
  jumuiyaBookletPages,
  JumuiyaMetadata,
  JumuiyaPageContent,
} from "../data/jumuiyaConstitutionData";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";

export const JumuiyaConstitutionView: React.FC = () => {
  // Selected Jumuiya (Defaults to Saint Augustine as it has the uploaded booklet)
  const [selectedJumuiyaId, setSelectedJumuiyaId] = useState<string>("st-augustine");

  // Page state (1 to 15)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"digital" | "scan">("digital");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Touch swipe left/right on mobile to flip pages
  const swipeHandlers = useSwipeNavigation({
    onSwipeLeft: () => {
      if (currentPage < 15) {
        setCurrentPage((p) => Math.min(15, p + 1));
      }
    },
    onSwipeRight: () => {
      if (currentPage > 1) {
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    },
  });

  const activeJumuiya = useMemo<JumuiyaMetadata>(() => {
    return jumuiyaList.find((j) => j.id === selectedJumuiyaId) || jumuiyaList[0];
  }, [selectedJumuiyaId]);

  const activePageData = useMemo<JumuiyaPageContent>(() => {
    return (
      jumuiyaBookletPages.find((p) => p.pageNumber === currentPage) ||
      jumuiyaBookletPages[0]
    );
  }, [currentPage]);

  /** Resolve the scan image URL for the current page + selected Jumuiya */
  const activeScanImageUrl = useMemo<string | undefined>(() => {
    if (!activeJumuiya.scanSlug) return undefined;
    return `/images/constitution/jumuiya/${activeJumuiya.scanSlug}-page-${currentPage}.jpg`;
  }, [activeJumuiya, currentPage]);

  /** Whether this Jumuiya has an uploaded PDF yet */
  const hasPdf = !!activeJumuiya.pdfUrl;

  // Search filter across pages
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return jumuiyaBookletPages.filter((page) => {
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
          title: `Kirinyaga University CSA - ${activeJumuiya.name} Booklet`,
          text: `Read Page ${currentPage} of the ${activeJumuiya.name} Jumuiya Constitution Booklet.`,
          url,
        });
      } catch {
        // Fallback to clipboard
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
      {/* Top Banner & Info */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-blue-700/40">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-white">
              Jumuiya Constitution & Guidelines
            </h2>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-sans">
              Statutory charter, governance protocols, and executive guidelines for the Small Christian Communities of Kirinyaga University Catholic Students' Association (C.S.A).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            {hasPdf ? (
              <a
                href={activeJumuiya.pdfUrl}
                download={`Kirinyaga_University_CSA_Jumuiya_Booklet_${activeJumuiya.name.replace(/ /g, "_")}.pdf`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <FaDownload className="text-xs" />
                Download {activeJumuiya.name} Booklet PDF
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/50 text-slate-300 border border-slate-600/50 font-bold text-xs sm:text-sm cursor-not-allowed">
                <FaFilePdf className="text-xs" />
                PDF Not Yet Uploaded
              </span>
            )}

          </div>
        </div>
      </div>

      {/* Jumuiya Selector Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FaUsers className="text-blue-600" />
              Select Small Christian Community
            </h3>
            <p className="text-xs text-slate-500">
              Each Jumuiya operates under these shared statutes with personalized patron Saint and devotions.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 w-fit">
            Viewing: {activeJumuiya.name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {jumuiyaList.map((j) => {
            const isSelected = j.id === selectedJumuiyaId;
            return (
              <button
                key={j.id}
                onClick={() => {
                setSelectedJumuiyaId(j.id);
                setCurrentPage(1); // reset to cover page on Jumuiya switch
              }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-2 ring-blue-500/20"
                    : "border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs mb-1.5 shadow-xs"
                  style={{ backgroundColor: j.color }}
                >
                  {j.name.replace("Saint ", "").charAt(0)}
                </div>
                <span className="text-xs font-bold truncate max-w-full">
                  {j.name.replace("Saint ", "St. ")}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {j.feastDay}
                </span>
              </button>
            );
          })}
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

            {/* Action Buttons: Share & Print */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all active:scale-95"
                title="Share link"
              >
                <FaShareAlt className="text-xs text-blue-600" />
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
              placeholder="Search booklet (e.g. chairs, elections, liturgist)..."
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
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 min-w-0 flex-1 sm:w-auto sm:max-w-[180px] truncate"
              >
                {jumuiyaBookletPages.map((p) => (
                  <option key={p.pageNumber} value={p.pageNumber}>
                    {p.pageNumber} — {p.title}
                  </option>
                ))}
              </select>
              <span className="shrink-0 text-slate-500 text-[11px] sm:text-xs">of 15</span>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(15, p + 1))}
              disabled={currentPage >= 15}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
              title="Next Page"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>

        {/* Search Results Drawer */}
        {searchQuery && (
          <div className="mt-3 pt-3 border-t border-slate-200 text-xs">
            <span className="font-bold text-slate-600 mb-2 block">
              Found in {searchResults.length} page(s):
            </span>
            <div className="flex flex-wrap gap-2">
              {searchResults.length > 0 ? (
                searchResults.map((r) => (
                  <button
                    key={r.pageNumber}
                    onClick={() => {
                      setCurrentPage(r.pageNumber);
                      setSearchQuery("");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold border border-blue-200 flex items-center gap-1 transition-all"
                  >
                    <span>Page {r.pageNumber}:</span>
                    <span className="font-medium text-slate-600 truncate max-w-[120px]">
                      {r.title}
                    </span>
                  </button>
                ))
              ) : (
                <span className="text-slate-400 italic">
                  No matching content found for "{searchQuery}"
                </span>
              )}
            </div>
          </div>
        )}

        {copiedLink && (
          <div className="mt-2 text-center text-xs font-semibold text-emerald-600 animate-fade-in">
            ✓ Link copied to clipboard!
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div
        {...swipeHandlers}
        className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden min-h-[600px] flex flex-col justify-between touch-pan-y"
      >
        {/* Document Header */}
        <div className="border-b border-slate-200/80 px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] uppercase tracking-wider">
                {activePageData.category || "General"}
              </span>
              <span className="text-xs font-bold text-slate-400">
                Booklet Page {activePageData.pageNumber} of 15
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-black text-slate-900">
              {activePageData.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {activeScanImageUrl && (
              <button
                onClick={() => setIsZoomModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all"
              >
                <FaExpand className="text-[11px]" />
                Inspect Full Scan
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-8 lg:p-10 flex-1">
          {viewMode === "scan" ? (
            /* Physical Scan View */
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative border border-slate-300 rounded-2xl overflow-hidden shadow-lg max-w-2xl w-full bg-slate-100 flex items-center justify-center p-2 group">
                {activeScanImageUrl ? (
                  <img
                    src={activeScanImageUrl}
                    alt={`${activeJumuiya.name} Booklet Page ${activePageData.pageNumber}`}
                    className="w-full h-auto object-contain rounded-xl shadow-xs"
                  />
                ) : (
                  <div className="p-12 text-center text-slate-400">
                    Scan not available — PDF for {activeJumuiya.name} not yet uploaded.
                  </div>
                )}
                <button
                  onClick={() => setIsZoomModalOpen(true)}
                  className="absolute bottom-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2.5 rounded-xl text-xs font-bold backdrop-blur-xs flex items-center gap-1.5 shadow-md transition-all"
                >
                  <FaExpand /> Full Screen
                </button>
              </div>
              <p className="text-xs text-slate-500 italic">
                Official scan from the original Kirinyaga University Catholic Students' Association archive.
              </p>
            </div>
          ) : (
            /* Digital Reader View */
            <div className="max-w-3xl mx-auto space-y-8 text-slate-800 text-sm sm:text-base">
              {/* PAGE 1: COVER SPECIAL DISPLAY */}
              {activePageData.pageNumber === 1 && (
                <div className="text-center py-6 px-4 sm:px-8 border-2 border-slate-200 rounded-3xl bg-gradient-to-b from-blue-50/40 via-white to-amber-50/30 shadow-xs space-y-6">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-black tracking-widest text-slate-700 uppercase">
                      KIRINYAGA UNIVERSITY CATHOLIC STUDENTS' ASSOCIATION
                    </p>
                    <p className="text-xs sm:text-sm font-bold tracking-wider text-blue-800 uppercase">
                      SMALL CHRISTIAN COMMUNITIES
                    </p>
                  </div>

                  <div className="py-2">
                    <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-widest text-slate-900 underline underline-offset-8 decoration-amber-500">
                      BOOKLET
                    </h1>
                  </div>

                  {/* Saint Icon / Artwork */}
                  <div className="flex justify-center my-4">
                    <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-amber-400/80 shadow-xl bg-white p-1">
                      {activeJumuiya.portraitUrl || activeJumuiya.coverScan ? (
                        <img
                          src={activeJumuiya.portraitUrl || activeJumuiya.coverScan}
                          alt={activeJumuiya.patron}
                          className="w-full h-full object-cover object-center rounded-full"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-full flex flex-col items-center justify-center text-white p-4"
                          style={{ backgroundColor: activeJumuiya.color }}
                        >
                          <FaChurch className="text-4xl mb-2 text-amber-300" />
                          <span className="text-sm font-bold text-center">
                            {activeJumuiya.patron}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Motto */}
                  <div className="max-w-lg mx-auto py-2">
                    <p className="text-base sm:text-xl font-serif font-bold italic text-slate-800 leading-snug">
                      "{activeJumuiya.motto}"
                    </p>
                  </div>

                  {/* Jumuiya Name */}
                  <div className="pt-2">
                    <h2
                      className="text-2xl sm:text-3xl font-serif font-black tracking-wider uppercase"
                      style={{ color: activeJumuiya.color }}
                    >
                      {activeJumuiya.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Feast Day: {activeJumuiya.feastDay} • Meeting: {activeJumuiya.meetingDay}
                    </p>
                  </div>
                </div>
              )}

              {/* Standard Page Content */}
              {activePageData.pageNumber !== 1 &&
                activePageData.sections.map((section, sIdx) => (
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
                      <h5 className="text-sm sm:text-base font-bold text-blue-900 uppercase tracking-wide">
                        {section.subheading}
                      </h5>
                    )}

                    {/* Paragraphs */}
                    {section.paragraphs?.map((pText, pIdx) => (
                      <p
                        key={pIdx}
                        className={`leading-relaxed text-slate-700 ${
                          section.type === "quote"
                            ? "italic font-serif text-slate-800 border-l-4 border-blue-500 pl-4 py-1"
                            : ""
                        }`}
                      >
                        {pText}
                      </p>
                    ))}

                    {/* Alert Type */}
                    {section.type === "alert" && section.items && (
                      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 sm:p-5 text-amber-900 space-y-2.5">
                        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
                          <FaExclamationTriangle className="text-amber-600" />
                          Mandatory Binding Directives
                        </div>
                        <ul className="space-y-2 text-xs sm:text-sm">
                          {section.items.map((it, iIdx) => (
                            <li key={iIdx} className="flex items-start gap-2">
                              <span className="text-amber-600 font-bold">•</span>
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
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
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 text-left transition-all group"
                            >
                              <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                                {titlePart}
                              </span>
                              <span className="text-xs font-bold text-blue-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
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
                              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-100/90 hover:bg-blue-50/40 hover:border-blue-100 transition-colors"
                            >
                              <div className="p-1 rounded-lg bg-blue-100 text-blue-700 text-[11px] mt-0.5 shrink-0">
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
                ))}

              {/* Signatures & Seal Section (Page 15) */}
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

                        {/* Signature Line */}
                        <div className="mt-6 pt-3 border-t border-slate-300 relative">
                          <span className="font-serif italic text-blue-800 text-lg select-none opacity-80 block">
                            {sig.name.split(" ")[0]}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                            Status: Officially Signed
                          </span>
                        </div>

                        {/* Official Stamp */}
                        {sig.hasStamp && (
                          <div className="mt-3 p-2.5 rounded-xl border-2 border-dashed border-red-400 bg-red-50/60 text-red-900 text-center relative rotate-1 shadow-xs">
                            <span className="text-[9px] font-black uppercase tracking-widest block text-red-700">
                              Official Seal
                            </span>
                            <span className="text-[10px] font-bold block mt-0.5">
                              06 FEB 2022
                            </span>
                            <span className="text-[8px] text-red-600 block mt-0.5">
                              P.O. BOX 303 - 10300, KERUGOYA
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Pagination Footer */}
        <div className="border-t border-slate-200/80 px-6 sm:px-8 py-4 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <FaChevronLeft className="text-[10px]" /> Previous Page
          </button>

          <span className="text-xs font-bold text-slate-600">
            Page {currentPage} of 15
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(15, p + 1))}
            disabled={currentPage >= 15}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next Page <FaChevronRight className="text-[10px]" />
          </button>
        </div>
      </div>

      {/* Full-Screen Zoom Modal */}
      {isZoomModalOpen && activeScanImageUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="relative max-w-4xl max-h-[92vh] w-full bg-slate-900 rounded-3xl overflow-hidden flex flex-col border border-slate-800 shadow-2xl">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <span className="text-xs font-bold text-slate-200">
                {activeJumuiya.name} Booklet — Page {activePageData.pageNumber}: {activePageData.title}
              </span>
              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950">
              <img
                src={activeScanImageUrl}
                alt={`${activeJumuiya.name} Page ${activePageData.pageNumber} Full Scan`}
                className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
