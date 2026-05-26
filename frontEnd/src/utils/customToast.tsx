import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export const showSuccessToast = (message: string, description?: string) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-in fade-in slide-in-from-top-4 duration-300' : 'animate-out fade-out slide-out-to-top-2 duration-200'
      } max-w-md w-full bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl pointer-events-auto flex border border-green-100 p-4 transition-all`}
    >
      <div className="flex-1 flex items-start gap-3">
        <div className="flex-shrink-0 bg-green-50 p-2 rounded-xl text-green-600">
          <CheckCircle className="w-6 h-6 animate-bounce" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-bold text-gray-900">{message}</p>
          {description && (
            <p className="mt-1 text-xs text-gray-500 font-medium">{description}</p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center ml-4 border-l border-gray-100 pl-3">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  ), {
    duration: 4000,
  });
};

export const showErrorToast = (message: string, description?: string) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-in fade-in slide-in-from-top-4 duration-300' : 'animate-out fade-out slide-out-to-top-2 duration-200'
      } max-w-md w-full bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl pointer-events-auto flex border border-red-100 p-4 transition-all`}
    >
      <div className="flex-1 flex items-start gap-3">
        <div className="flex-shrink-0 bg-red-50 p-2 rounded-xl text-red-600">
          <AlertCircle className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-bold text-gray-900">{message}</p>
          {description && (
            <p className="mt-1 text-xs text-gray-500 font-medium">{description}</p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center ml-4 border-l border-gray-100 pl-3">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  ), {
    duration: 5000,
  });
};
