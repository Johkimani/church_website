import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaBook, FaChurch, FaUserTie } from "react-icons/fa";
import { CsaConstitutionView } from "./components/CsaConstitutionView";
import { JumuiyaConstitutionView } from "./components/JumuiyaConstitutionView";
import { CoordinatorsConstitutionView } from "./components/CoordinatorsConstitutionView";
import "../Jumuiya/JumuiyaLanding.css";

export const ConstitutionPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const getTabFromParam = (param: string | null): "csa" | "jumuiya" | "coordinators" => {
    if (param === "jumuiya") return "jumuiya";
    if (param === "coordinators") return "coordinators";
    return "csa";
  };
  const [activeTab, setActiveTab] = useState<"csa" | "jumuiya" | "coordinators">(
    getTabFromParam(searchParams.get("tab"))
  );

  useEffect(() => {
    const tabParam = getTabFromParam(searchParams.get("tab"));
    if (tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: "csa" | "jumuiya" | "coordinators") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="landing-page">
      <div className="container">
        {/* Hero Section */}
        <header className="hero animate-fade-in">
          <h1 className="hero-title">Constitution</h1>
          <p className="hero-subtitle">Kirinyaga University St. Thomas Aquinas CSA</p>
          <p className="hero-description">
            The governing instrument establishing our vision, sacred liturgical orders, rights, executive leadership, and the fraternity of the Jumuiyas.
          </p>
        </header>

        {/* Tabs */}
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
        </div>

        {/* Content */}
        <div className="mt-8">
          {activeTab === "csa" ? (
            <CsaConstitutionView />
          ) : activeTab === "jumuiya" ? (
            <JumuiyaConstitutionView />
          ) : (
            <CoordinatorsConstitutionView />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConstitutionPage;
