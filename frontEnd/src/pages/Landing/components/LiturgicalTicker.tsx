import React from 'react';
import { useLiturgicalCalendar } from '../../../hooks/useLiturgicalCalendar';
import { Cross } from 'lucide-react';

export const LiturgicalTicker: React.FC = () => {
  const { data, loading } = useLiturgicalCalendar();

  if (loading || !data || data.celebrations.length === 0) return null;

  const celebration = data.celebrations[0];
  const color = celebration.colour.toLowerCase();

  // Determine the background color of the ticker based on the liturgical color
  let bgColor = "bg-green-600";
  if (color === "red") bgColor = "bg-red-700";
  if (color === "purple") bgColor = "bg-purple-700";
  if (color === "white") bgColor = "bg-amber-100 text-amber-900 border-b border-amber-200"; // white/gold
  if (color === "rose") bgColor = "bg-rose-500";

  const textColor = color === "white" ? "text-amber-900" : "text-white";

  return (
    <div className={`w-full overflow-hidden ${bgColor} ${textColor} py-2 shadow-inner z-50 relative flex items-center`}>
      <div className="flex-shrink-0 px-4 font-bold flex items-center gap-2 border-r border-white/20 z-10 bg-inherit">
        <Cross size={16} /> 
        Today's Liturgy
      </div>
      
      {/* Marquee Animation */}
      <div className="flex-1 overflow-hidden relative">
        <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] inline-block font-medium text-sm px-4 tracking-wide">
          <span className="mr-4">•</span>
          {celebration.title} ({celebration.colour.charAt(0).toUpperCase() + celebration.colour.slice(1)})
          <span className="ml-4 mr-4">•</span>
          Please check your daily missal for the readings of the day.
          <span className="ml-4 mr-4">•</span>
          {celebration.title}
          <span className="ml-4 mr-4">•</span>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};
