import { useState, useEffect, useCallback } from 'react';
import apiService from '../../Landing/services/api';
import { UPLOAD_BASE } from '../../../api/config';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  X, 
  Plus, 
  CheckCircle2, 
  Loader2,
  Edit2,
  Save
} from 'lucide-react';

interface GalleryImage {
  id: string | number;
  image_url: string;
  title: string;
  category?: string;
  description?: string;
  created_at?: string;
  event_date?: string;
}

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  
  // New States for dynamic management
  const [activeTab, setActiveTab] = useState<string>('All');
  const [uploadCategory, setUploadCategory] = useState<string>('Gallery Grid');
  
  // Edit State
  const [editItem, setEditItem] = useState<GalleryImage | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const categories = ['Hero Slider', 'Gallery Grid', 'Teaser'];

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const data = await apiService.getGallery();
      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    if (newFiles.length + selectedFiles.length > 10) {
      alert("Maximum 10 photos can be uploaded at once.");
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [selectedFiles]);

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteImage = async (id: string | number) => {
    if (window.confirm('Are you sure you want to remove this photo from the gallery?')) {
      try {
        await apiService.deleteRecord('gallery', id);
        apiService.clearCache('gallery');
        setImages(prev => prev.filter(img => img.id !== id));
      } catch (err) {
        alert('Failed to delete image');
      }
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploadStatus('uploading');
    setUploadProgress(0);
    try {
      // We will attempt to use the real file upload endpoint if available
      // Must dynamically import to avoid top-level issues if not all components have it
      const { uploadFile } = await import('../../../api/axiosInstance');
      
      for (const file of selectedFiles) {
        let finalImageUrl = '';
        
        // Attempt real multipart upload to Cloudinary via backend
        const uploadRes = await uploadFile(file);
        const responseData = uploadRes.data?.data || uploadRes.data;
        
        // Extract URL from standard response shapes sent by backend mediaController
        if (Array.isArray(responseData) && responseData[0]?.url) {
          finalImageUrl = responseData[0].url;
        } else if (responseData?.url) {
          finalImageUrl = responseData.url;
        } else if (typeof responseData === 'string') {
          finalImageUrl = responseData;
        } else if (responseData?.data?.url) {
          finalImageUrl = responseData.data.url;
        }

        if (!finalImageUrl) {
          throw new Error('Failed to retrieve Cloudinary image URL from server response.');
        }

        await apiService.createRecord('gallery', { 
          title: file.name, 
          image_url: finalImageUrl, 
          category: uploadCategory,
          description: '',
          event_date: new Date().toISOString()
        });
      }
      apiService.clearCache('gallery');
      await loadImages();
      setSelectedFiles([]);
      setUploadStatus('success');
      setUploadProgress(100);
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (err) {
      alert('Upload failed');
      setUploadStatus('idle');
      setUploadProgress(0);
    }
  };

  const saveEdit = async () => {
    if (!editItem) return;
    setEditSaving(true);
    try {
      await apiService.updateRecord('gallery', editItem.id, {
        title: editItem.title,
        category: editItem.category,
        description: editItem.description,
        event_date: editItem.event_date
      });
      apiService.clearCache('gallery');
      setImages(prev => prev.map(img => img.id === editItem.id ? editItem : img));
      setEditItem(null);
    } catch (err) {
      alert('Failed to update image details');
    } finally {
      setEditSaving(false);
    }
  };

  const filteredImages = activeTab === 'All' 
    ? images 
    : images.filter(img => img.category === activeTab);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Gallery Manager</h2>
          <p className="text-slate-500 text-xs mt-0.5">Manage public photos and visual media for the church website.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-100">
            {images.length} Photos in Gallery
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
              <Upload size={14} className="text-blue-600" />
              Upload New Media
            </h3>
            
            <div 
              className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/50 scale-[0.98]' 
                  : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input 
                id="file-upload"
                type="file" 
                multiple 
                className="hidden" 
                onChange={(e) => handleFiles(e.target.files)}
                accept="image/*"
              />
              
              <div className="py-8 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
                <p className="text-slate-700 font-bold text-xs mb-0.5">Drop photos here</p>
                <p className="text-slate-400 text-[11px]">or click to browse your files</p>
                <div className="mt-3 flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Max 10 files • JPG, PNG, GIF
                </div>
              </div>
            </div>

            {/* Selected Files Preview & Settings */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  <span>Selected ({selectedFiles.length})</span>
                  <button onClick={() => setSelectedFiles([])} className="text-rose-500 hover:text-rose-600">Clear All</button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 group">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{file.name}</p>
                        <p className="text-[9px] text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeSelectedFile(i); }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                {uploadStatus === 'uploading' && uploadProgress > 0 && (
                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
                <button 
                  onClick={handleUpload}
                  disabled={uploadStatus === 'uploading'}
                  className={`w-full py-3 rounded-xl font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 ${
                    uploadStatus === 'uploading'
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5'
                  }`}
                >
                  {uploadStatus === 'uploading' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Uploading...
                    </>
                  ) : uploadStatus === 'success' ? (
                    <>
                      <CheckCircle2 size={18} />
                      Done!
                    </>
                  ) : (
                    'Start Upload'
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex gap-2 text-amber-800">
            <AlertCircle size={16} className="shrink-0" />
            <div className="text-[11px] font-medium leading-relaxed">
              <p className="font-bold mb-0.5">Usage Tips:</p>
              <ul className="list-disc ml-4 space-y-0.5">
                <li>Optimize images before upload for faster loading.</li>
                <li>High-resolution landscape photos work best for the hero section.</li>
                <li>Ensure you have the rights to the photos you publish.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="xl:col-span-2">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-indigo-600" />
                  Live Gallery Grid
                </h3>
                
                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-xl self-start sm:self-auto overflow-x-auto">
                  {['All', ...categories].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        activeTab === tab 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
                <Loader2 size={32} className="text-slate-200 animate-spin mb-3" />
                <p className="text-slate-400 font-bold text-xs">Synchronizing with server...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
                {images.map((image) => (
                  <div key={image.id} className="group relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 aspect-square">
                    <img 
                      src={image.image_url?.startsWith('http') ? image.image_url : `${UPLOAD_BASE}${image.image_url}`} 
                      alt={image.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <button className="p-1.5 bg-white/20 hover:bg-white text-white hover:text-slate-900 rounded-lg backdrop-blur-md transition-all">
                          <Maximize2 size={12} />
                        </button>
                        <button 
                          onClick={() => handleDeleteImage(image.id)}
                          className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white font-bold text-[11px] truncate">{image.title}</p>
                        <p className="text-slate-300 text-[9px] uppercase tracking-widest font-black">
                          {image.category || 'Church Event'} • {image.created_at ? new Date(image.created_at).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty States Placeholder */}
                {images.length === 0 && (
                  <div className="col-span-full border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-200 py-10">
                     <ImageIcon size={40} className="mb-3 opacity-20" />
                     <p className="text-slate-400 font-bold text-xs">No images in your gallery yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
