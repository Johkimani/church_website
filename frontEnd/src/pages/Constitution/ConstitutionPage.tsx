import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaBook, FaChurch, FaUserTie } from "react-icons/fa";
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
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                Constitution
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl">
                Kirinyaga University St. Thomas Aquinas Catholic Students' Association (CSA) Constitution, Jumuiya Constitutions and Coordinators Guidelines.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <img
                src="/images/csa-logo.jpg"
                alt="CSA Seal"
                className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200"
              />
              <div className="text-xs text-slate-600">
                <div className="font-semibold text-slate-900">Official Document</div>
                <div>P.O. Box 143-10300 • Kerugoya, Kenya</div>
              </div>
            </div>
          </div>

          {/* Primary Tab Switcher */}
          <div className="mt-5 w-full max-w-2xl">
            <div className="w-full grid grid-cols-3 p-1 rounded-xl bg-slate-100 border border-slate-200 gap-1">
              <button
                onClick={() => handleTabChange("csa")}
                className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "csa"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FaBook className="text-xs" />
                <span className="hidden sm:inline">CSA Constitution</span>
                <span className="sm:hidden">CSA</span>
              </button>

              <button
                onClick={() => handleTabChange("jumuiya")}
                className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "jumuiya"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FaChurch className="text-xs" />
                <span className="hidden sm:inline">Jumuiya Constitution</span>
                <span className="sm:hidden">Jumuiya</span>
              </button>

              <button
                onClick={() => handleTabChange("coordinators")}
                className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "coordinators"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FaUserTie className="text-xs" />
                <span className="hidden sm:inline">Jumuiya Coordinators</span>
                <span className="sm:hidden">Coordinators</span>
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
