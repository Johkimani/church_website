import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaBook, FaChurch, FaCheckCircle, FaUserTie } from "react-icons/fa";
import { CsaConstitutionView } from "./components/CsaConstitutionView";
import { JumuiyaConstitutionView } from "./components/JumuiyaConstitutionView";
import { CoordinatorsConstitutionView } from "./components/CoordinatorsConstitutionView";

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
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Hero Banner */}
      <section className="bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden py-8 sm:py-14">
        {/* Decorative backdrop shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white">
                The Constitution
              </h1>

              <p className="text-xs sm:text-base text-blue-100/90 leading-relaxed font-normal">
                Kirinyaga University St. Thomas Aquinas Catholic Students' Association (CSA).
                The governing instrument establishing our vision, sacred liturgical orders, rights, executive leadership, and the fraternity of the Jumuiyas.
              </p>
            </div>

            {/* Quick stats / seal preview badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 shrink-0 flex items-center gap-3.5 shadow-lg w-fit">
              <img
                src="/images/csa-logo.jpg"
                alt="CSA Seal"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover ring-2 ring-white/20"
              />
              <div className="text-xs">
                <div className="font-extrabold text-white flex items-center gap-1">
                  <span>Official Promulgation</span>
                  <FaCheckCircle className="text-emerald-400 text-[10px]" />
                </div>
                <div className="text-blue-200 font-medium mt-0.5">
                  Ref: P.O. Box 143-10300
                </div>
                <div className="text-[11px] text-cyan-300 font-bold mt-0.5">
                  Kerugoya, Kenya
                </div>
              </div>
            </div>
          </div>

          {/* Primary Tab Switcher */}
          <div className="mt-6 sm:mt-10 w-full max-w-3xl">
            <div className="w-full grid grid-cols-3 p-1 sm:p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl gap-1 sm:gap-2">
              {/* CSA Constitution Tab */}
              <button
                onClick={() => handleTabChange("csa")}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold transition-all ${
                  activeTab === "csa"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <FaBook className={`text-xs sm:text-sm ${activeTab === "csa" ? "text-cyan-200" : "text-slate-400"}`} />
                <span className="text-[11px] sm:text-sm tracking-tight text-center truncate">
                  <span className="sm:hidden">CSA</span>
                  <span className="hidden sm:inline">CSA Constitution</span>
                </span>
              </button>

              {/* Jumuiya Constitution Tab */}
              <button
                onClick={() => handleTabChange("jumuiya")}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold transition-all ${
                  activeTab === "jumuiya"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-500/25"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <FaChurch className={`text-xs sm:text-sm ${activeTab === "jumuiya" ? "text-amber-200" : "text-slate-400"}`} />
                <span className="text-[11px] sm:text-sm tracking-tight text-center truncate">
                  <span className="sm:hidden">Jumuiyas</span>
                  <span className="hidden sm:inline">Jumuiya Constitution</span>
                </span>
              </button>

              {/* Jumuiya Coordinators Tab */}
              <button
                onClick={() => handleTabChange("coordinators")}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold transition-all ${
                  activeTab === "coordinators"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <FaUserTie className={`text-xs sm:text-sm ${activeTab === "coordinators" ? "text-emerald-200" : "text-slate-400"}`} />
                <span className="text-[11px] sm:text-sm tracking-tight text-center truncate">
                  <span className="sm:hidden">Coordinators</span>
                  <span className="hidden sm:inline">Jumuiya Coordinators</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tab Content View */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        {activeTab === "csa" ? (
          <CsaConstitutionView />
        ) : activeTab === "jumuiya" ? (
          <JumuiyaConstitutionView />
        ) : (
          <CoordinatorsConstitutionView />
        )}
      </div>
    </div>
  );
};

export default ConstitutionPage;
