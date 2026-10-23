import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaBook, FaChurch, FaUserTie, FaMusic } from "react-icons/fa";
import { CsaConstitutionView } from "./components/CsaConstitutionView";
import { JumuiyaConstitutionView } from "./components/JumuiyaConstitutionView";
import { CoordinatorsConstitutionView } from "./components/CoordinatorsConstitutionView";
import { ChoirConstitutionView } from "./components/ChoirConstitutionView";
import "../Jumuiya/JumuiyaLanding.css";

export const ConstitutionPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const getTabFromParam = (
    param: string | null
  ): "csa" | "jumuiya" | "coordinators" | "choir" => {
    if (param === "jumuiya") return "jumuiya";
    if (param === "coordinators") return "coordinators";
    if (param === "choir") return "choir";
    return "csa";
  };
  const [activeTab, setActiveTab] = useState<
    "csa" | "jumuiya" | "coordinators" | "choir"
  >(getTabFromParam(searchParams.get("tab")));
  // True once the reader has left the cover letter — hides the landing header.
  const [isReading, setIsReading] = useState(false);

  // The hero collapses when entering focus mode, so re-anchor the scroll.
  useEffect(() => {
    if (isReading) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isReading]);

  useEffect(() => {
    const tabParam = getTabFromParam(searchParams.get("tab"));
    if (tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (
    tab: "csa" | "jumuiya" | "coordinators" | "choir"
  ) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setIsReading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="landing-page">
      <div className="container">
        {/* Hero Section — hidden once reading past the cover letter */}
        {!isReading && (
          <header className="hero animate-fade-in">
            <h1 className="hero-title">Constitution</h1>
            <p className="hero-subtitle">Kirinyaga University St. Thomas Aquinas CSA</p>
            <p className="hero-description">
              The governing instruments establishing our vision, sacred liturgical orders, rights, executive leadership, choir ministry, and the fraternity of the Jumuiyas.
            </p>
          </header>
        )}

        {/* Tabs — hidden once reading past the cover letter */}
        {!isReading && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={() => handleTabChange("csa")}
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === "csa"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <FaBook className="text-xs" />
              <span>CSA Constitution</span>
            </button>
            <button
              onClick={() => handleTabChange("jumuiya")}
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === "jumuiya"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <FaChurch className="text-xs" />
              <span>Jumuiya Constitution</span>
            </button>
            <button
              onClick={() => handleTabChange("coordinators")}
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === "coordinators"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <FaUserTie className="text-xs" />
              <span>Jumuiya Coordinators</span>
            </button>
            <button
              onClick={() => handleTabChange("choir")}
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === "choir"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <FaMusic className="text-xs" />
              <span>Choir Constitution</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className={isReading ? "mt-0" : "mt-8"}>
          {activeTab === "csa" ? (
            <CsaConstitutionView onReadingChange={setIsReading} />
          ) : activeTab === "jumuiya" ? (
            <JumuiyaConstitutionView onReadingChange={setIsReading} />
          ) : activeTab === "coordinators" ? (
            <CoordinatorsConstitutionView onReadingChange={setIsReading} />
          ) : (
            <ChoirConstitutionView onReadingChange={setIsReading} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConstitutionPage;
