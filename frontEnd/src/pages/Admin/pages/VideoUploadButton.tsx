import React, { useRef, useState } from 'react';
import { Upload, Loader2, X } from 'lucide-react';

interface VideoUploadButtonProps {
  onUpload: (file: File, title: string, description: string) => Promise<void>;
  saving: boolean;
}

const VideoUploadButton: React.FC<VideoUploadButtonProps> = ({ onUpload, saving }) => {
  const [showModal, setShowModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setShowModal(true);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || isUploading) return;
    setIsUploading(true);
    setProgress(0);
    try {
      await onUpload(uploadFile, title, description);
      setShowModal(false);
      setUploadFile(null);
      setTitle('');
      setDescription('');
      setProgress(0);
    } catch {
      // Error handled by parent
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setShowModal(false);
    setUploadFile(null);
    setTitle('');
    setDescription('');
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition shadow-sm cursor-pointer shrink-0 disabled:opacity-50"
      >
        <Upload size={15} /> Upload
      </button>

      {showModal && uploadFile && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={handleClose}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-800">Upload Video</h3>
              {!isUploading && (
                <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="mb-4 p-3 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-700 truncate">{uploadFile.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{(uploadFile.size / (1024 * 1024)).toFixed(1)} MB</p>
            </div>

            <div className="space-y-3 mb-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Video title (optional)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-purple-500"
                disabled={isUploading}
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description (optional)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-purple-500"
                disabled={isUploading}
              />
            </div>

            {isUploading && (
              <div className="mb-4">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 text-center">Uploading...</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isUploading}
                className="px-4 py-2 text-slate-500 text-xs font-bold hover:text-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-purple-500 text-white rounded-xl text-xs font-black hover:bg-purple-600 transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={12} />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoUploadButton;
