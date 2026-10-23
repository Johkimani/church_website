import React from "react";
import { FaBookOpen } from "react-icons/fa";

interface BackToCoverButtonProps {
  onBack: () => void;
  label?: string;
}

export const BackToCoverButton: React.FC<BackToCoverButtonProps> = ({
  onBack,
  label = "Back to Cover",
}) => {
  return (
    <div className="w-full max-w-4xl mt-6 flex justify-center">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 text-sm font-bold transition-all active:scale-95 shadow-xs"
      >
        <FaBookOpen className="text-xs text-blue-600" />
        {label}
      </button>
    </div>
  );
};
