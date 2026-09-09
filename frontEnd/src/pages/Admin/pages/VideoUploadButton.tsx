import React, { useRef, useState } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { apiClient } from '../../../api/axiosInstance';

interface VideoUploadButtonProps {
  moduleId: string;
  onUploadComplete: () => void;
  saving: boolean;
}

const VideoUploadButton: React.FC<VideoUploadButtonProps> = ({ moduleId, onUploadComplete, saving }) => {
  const [showModal, setShowModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File too large. Maximum size is 50 MB.');
        return;
      }
      setUploadFile(file);
      setShowModal(true);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || isUploading) return;
    setIsUploading(true);
    setProgress(0);
    setUploadStatus('Requesting upload signature...');

    try {
      // Step 1: Get signed upload params from backend
      const sigRes = await apiClient.get(`/community-videos/${moduleId}/videos/signature`);
      const { signature, timestamp, folder, public_id, api_key, cloud_name } = sigRes.data;

      // Step 2: Upload directly to Cloudinary from browser
      setUploadStatus('Uploading to Cloudinary...');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('api_key', api_key);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('folder', folder);
      formData.append('public_id', public_id);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/video/upload`;

      const xhr = new XMLHttpRequest();
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.open('POST', cloudinaryUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setProgress(percent);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            let errMsg = `Cloudinary upload failed: ${xhr.statusText}`;
            try { errMsg = JSON.parse(xhr.responseText)?.error?.message || errMsg; } catch {}
            reject(new Error(errMsg));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });

      const cloudinaryResult = await uploadPromise;

      // Step 3: Save metadata to backend
      setUploadStatus('Saving video details...');
      setProgress(100);
      await apiClient.post(`/community-videos/${moduleId}/videos/save-upload`, {
        title: title || uploadFile.name.replace(/\.[^/.]+$/, ''),
        description,
        video_file_url: cloudinaryResult.secure_url,
        cloudinary_public_id: cloudinaryResult.public_id,
      });

      setShowModal(false);
      setUploadFile(null);
      setTitle('');
      setDescription('');
      setProgress(0);
      setUploadStatus('');
      onUploadComplete();
    } catch (e: any) {
      alert(e?.message || e?.response?.data?.error || 'Failed to upload video');
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
    setProgress(0);
    setUploadStatus('');
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
        disabled={saving || isUploading}
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
                <p className="text-[10px] text-slate-500 mt-1 text-center">
                  {uploadStatus} {progress > 0 && `${progress}%`}
                </p>
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
