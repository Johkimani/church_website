import { X, RotateCcw, Trash2, AlertTriangle, Info } from 'lucide-react';

export interface AffectedOfficial {
  id: number;
  name: string;
  photoUrl: string;
  role: string;
  category: string;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  variant?: 'danger' | 'info' | 'success' | 'warning';
  isLoading?: boolean;
  affectedItems?: AffectedOfficial[];
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  variant = 'info',
  isLoading = false,
  affectedItems = [],
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  // Set up theme styles based on variant
  const getThemeConfig = () => {
    switch (variant) {
      case 'success':
        return {
          icon: <RotateCcw className="w-7 h-7 text-white stroke-[2.5]" />,
          iconBg: 'bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-emerald-200/50',
          cardBorder: 'border-emerald-500/20 shadow-[0_20px_50px_rgba(16,185,129,0.12)]',
          titleColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent',
          btnBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20 hover:shadow-emerald-500/30 focus:ring-emerald-400',
          pulseColor: 'bg-emerald-400',
        };
      case 'danger':
        return {
          icon: <Trash2 className="w-7 h-7 text-white stroke-[2.5]" />,
          iconBg: 'bg-gradient-to-tr from-rose-500 to-red-600 shadow-rose-200/50',
          cardBorder: 'border-rose-500/20 shadow-[0_20px_50px_rgba(244,63,94,0.12)]',
          titleColor: 'bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent',
          btnBg: 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-rose-500/20 hover:shadow-rose-500/30 focus:ring-rose-400',
          pulseColor: 'bg-rose-400',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-7 h-7 text-white stroke-[2.5]" />,
          iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-200/50',
          cardBorder: 'border-amber-500/20 shadow-[0_20px_50px_rgba(245,158,11,0.12)]',
          titleColor: 'bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent',
          btnBg: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/20 hover:shadow-amber-500/30 focus:ring-amber-400',
          pulseColor: 'bg-amber-400',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-7 h-7 text-white stroke-[2.5]" />,
          iconBg: 'bg-gradient-to-tr from-indigo-500 to-blue-600 shadow-indigo-200/50',
          cardBorder: 'border-indigo-500/20 shadow-[0_20px_50px_rgba(99,102,241,0.12)]',
          titleColor: 'bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent',
          btnBg: 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-indigo-500/20 hover:shadow-indigo-500/30 focus:ring-indigo-400',
          pulseColor: 'bg-indigo-400',
        };
    }
  };

  const theme = getThemeConfig();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      {/* Modal Card */}
      <div className={`bg-gradient-to-b from-white to-slate-50 rounded-3xl p-6 md:p-8 max-w-md w-full overflow-hidden flex flex-col relative border ${theme.cardBorder} transform transition-all duration-300 animate-in zoom-in-95`}>
        
        {/* Subtle decorative top background pattern */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-gray-200/20 to-transparent"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status Badge & Header */}
        <div className="flex flex-col items-center text-center mt-3">
          
          {/* Animated Glow Rings */}
          <div className="relative mb-5 flex items-center justify-center">
            {/* Outer Breathing Pulse Ring */}
            <span className={`absolute -inset-3 rounded-full animate-pulse opacity-10 duration-2000 ${theme.pulseColor}`}></span>
            
            {/* Inner Ping Ring */}
            <span className={`absolute inset-0 rounded-full animate-ping opacity-15 duration-1000 ${theme.pulseColor}`}></span>
            
            {/* Main Gradient Badge Icon */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg relative ${theme.iconBg}`}>
              {theme.icon}
            </div>
          </div>

          <h3 className={`text-2xl font-extrabold tracking-tight leading-tight ${theme.titleColor}`}>
            {title}
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed whitespace-pre-line max-w-xs">
            {message}
          </p>
        </div>

        {/* List of Affected Officials */}
        {affectedItems && affectedItems.length > 0 && (
          <div className="mt-5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2 px-1">
              Affected Leadership Record{affectedItems.length > 1 ? 's' : ''} ({affectedItems.length})
            </span>
            
            <div className="border border-slate-100 rounded-2xl bg-slate-50/70 p-2.5 max-h-40 overflow-y-auto space-y-2 shadow-inner custom-scrollbar">
              {affectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 shadow-sm transition-all duration-200 hover:scale-[1.01]"
                >
                  <div className="relative shrink-0">
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://res.cloudinary.com/dulas3ex1/image/upload/v1711776510/default-avatar_g9jhzp.png';
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full shadow-sm">
                      <div className={`w-2.5 h-2.5 rounded-full ${variant === 'success' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-800 truncate leading-snug">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">
                      {item.role}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-extrabold text-indigo-600 bg-indigo-50/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons Action Group */}
        <div className="flex items-center gap-3.5 mt-7">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 transition-all text-sm active:scale-[0.98] disabled:opacity-50 shadow-sm hover:shadow"
          >
            {cancelText}
          </button>
          
          <button
            onClick={async () => {
              if (isLoading) return;
              await onConfirm();
            }}
            disabled={isLoading}
            className={`flex-1 py-3 px-5 text-white font-bold rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] text-sm flex items-center justify-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-offset-2 ${theme.btnBg}`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="tracking-wide">Processing...</span>
              </>
            ) : (
              <span className="tracking-wide">{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
