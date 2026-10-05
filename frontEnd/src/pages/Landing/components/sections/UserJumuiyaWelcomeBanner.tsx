import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { useUserJumuiya } from "../../../../hooks/useUserJumuiya";
import { Sparkles, ArrowRight, ShieldCheck, Heart } from "lucide-react";

export const UserJumuiyaWelcomeBanner: React.FC = () => {
  const { user } = useAuth();
  const userJumuiya = useUserJumuiya();
  const navigate = useNavigate();

  if (!user || !userJumuiya) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-8 relative z-20">
      <div
        className="rounded-3xl p-5 sm:p-7 shadow-xl border backdrop-blur-md transition-all duration-300 relative overflow-hidden group"
        style={{
          background: `linear-gradient(135deg, #ffffff 0%, ${userJumuiya.color}0d 50%, #ffffff 100%)`,
          borderColor: `${userJumuiya.color}35`,
        }}
      >
        {/* Subtle background glow effect */}
        <div
          className="absolute -right-16 -top-16 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: userJumuiya.color }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            {/* Saint / Jumuiya Icon */}
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 transition-transform group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${userJumuiya.color}, ${userJumuiya.color}dd)`,
              }}
            >
              {userJumuiya.saintImage && userJumuiya.saintImage !== "/images/cross.png" ? (
                <img
                  src={userJumuiya.saintImage}
                  alt={userJumuiya.name}
                  className="w-10 h-10 object-contain drop-shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-2xl">⛪</span>
              )}
            </div>

            {/* Info text */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Welcome to Catholic Students Association
                </span>
                {userJumuiya.isFirstYear && (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white shadow-xs"
                    style={{ backgroundColor: userJumuiya.color }}
                  >
                    <Sparkles size={11} /> 1st Year Member
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                Karibu, <span className="text-blue-700">{user.name}</span>! You belong to{" "}
                <span style={{ color: userJumuiya.color }}>{userJumuiya.name} Jumuiya</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Your Jumuiya community page is ready with member updates, activities, and communication channels.
              </p>
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <button
              onClick={() => navigate(userJumuiya.path)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${userJumuiya.color}, ${userJumuiya.color}ee)`,
                boxShadow: `0 8px 20px -4px ${userJumuiya.color}60`,
              }}
            >
              <span>Go to My Jumuiya</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
