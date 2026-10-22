import React from "react";
import { FaBookOpen } from "react-icons/fa";

interface BackToCoverButtonProps {
  onBack: () => void;
  label?: string;
  tone?: "blue" | "emerald";
}

export const BackToCoverButton: React.FC<BackToCoverButtonProps> = ({
  onBack,
  label = "Back to Cover",
  tone = "blue",
}) => {
  const toneClasses =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
      : "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100";

  const iconClasses = tone === "emerald" ? "text-emerald-600" : "text-blue-600";

  return (
    <div className="w-full max-w-4xl mt-6 flex justify-center">
      <button
        onClick={onBack}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-bold transition-all active:scale-95 shadow-xs ${toneClasses}`}
      >
        <FaBookOpen className={`text-xs ${iconClasses}`} />
        {label}
      </button>
    </div>
  );
};
