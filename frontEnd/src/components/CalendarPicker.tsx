import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarPickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  label?: string;
  required?: boolean;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateString(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseDate(val: string): { year: number; month: number; day: number } | null {
  if (!val) return null;
  const [y, m, d] = val.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

export default function CalendarPicker({ value, onChange, min, label, required }: CalendarPickerProps) {
  const selected = parseDate(value);
  const today = new Date();
  const todayStr = toDateString(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewYear, setViewYear] = useState(selected?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.month ?? today.getMonth());

  // Build calendar grid
  const { days, startOffset } = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // Monday-based offset (0 = Mon, 6 = Sun)
    let offset = firstDay.getDay() - 1;
    if (offset < 0) offset = 6;
    return { days: daysInMonth, startOffset: offset };
  }, [viewYear, viewMonth]);

  const minDate = min ? parseDate(min) : null;
  const minStr = min || todayStr;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else { setViewMonth(viewMonth - 1); }
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else { setViewMonth(viewMonth + 1); }
  };

  const selectDate = (d: number) => {
    const dateStr = toDateString(viewYear, viewMonth, d);
    if (dateStr < minStr) return;
    onChange(dateStr);
  };

  const cellForDay = (d: number | null, idx: number) => {
    if (d === null) {
      return <div key={`empty-${idx}`} className="w-full aspect-square" />;
    }

    const dateStr = toDateString(viewYear, viewMonth, d);
    const isPast = dateStr < minStr;
    const isSelected = dateStr === value;
    const isToday = dateStr === todayStr;

    return (
      <button
        key={dateStr}
        type="button"
        disabled={isPast}
        onClick={() => selectDate(d)}
        className={`w-full aspect-square rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center ${
          isPast
            ? "text-slate-300 cursor-not-allowed"
            : isSelected
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : isToday
                ? "bg-blue-50 text-blue-600 font-bold ring-1 ring-blue-200"
                : "text-slate-700 hover:bg-slate-100 cursor-pointer"
        }`}
      >
        {d}
      </button>
    );
  };

  // Build rows
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(cellForDay(null, i));
  for (let d = 1; d <= days; d++) cells.push(cellForDay(d, d));

  return (
    <div>
      {label && (
        <label className="block text-xs font-bold text-slate-600 mb-1.5">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <button
            type="button"
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <h3 className="text-sm font-black text-slate-800 tracking-tight">
            {MONTHS[viewMonth]} {viewYear}
          </h3>
          <button
            type="button"
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 px-4 pt-3 pb-1">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {wd}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1 px-4 pb-4">
          {cells}
        </div>
      </div>
    </div>
  );
}
