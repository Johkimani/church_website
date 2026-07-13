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
    setUploadStatus('uploading');
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
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (err) {
      alert('Upload failed');
      setUploadStatus('idle');
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Edit Modal Overlay */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-800">Edit Photo Details</h3>
              <button onClick={() => setEditItem(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Category Section</label>
                <select 
                  value={editItem.category || ''}
                  onChange={e => setEditItem({...editItem, category: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Category...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Title / Headline</label>
                <input 
                  type="text" 
                  value={editItem.title || ''}
                  onChange={e => setEditItem({...editItem, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="E.g. Sunday Mass"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description Overlay</label>
                <textarea 
                  value={editItem.description || ''}
                  onChange={e => setEditItem({...editItem, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  placeholder="Description text shown on the scroller..."
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setEditItem(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                disabled={editSaving}
              >
                Cancel
              </button>
              <button 
                onClick={saveEdit}
                disabled={editSaving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200"
              >
                {editSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gallery Manager</h2>
          <p className="text-slate-500 text-sm mt-1">Manage public photos, hero slider, and visual media.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100">
            {images.length} Photos total
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Upload size={18} className="text-blue-600" />
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
              
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus size={32} />
                </div>
                <p className="text-slate-700 font-bold mb-1">Drop photos here</p>
                <p className="text-slate-400 text-xs">or click to browse</p>
              </div>
            </div>

            {/* Selected Files Preview & Settings */}
            {selectedFiles.length > 0 && (
              <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 border-t border-slate-100 pt-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Upload To Section</label>
                  <select 
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                  <span>Selected ({selectedFiles.length})</span>
                  <button onClick={() => setSelectedFiles([])} className="text-rose-500 hover:text-rose-600">Clear All</button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeSelectedFile(i); }}
                        className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleUpload}
                  disabled={uploadStatus === 'uploading'}
                  className={`w-full py-4 rounded-xl font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                    uploadStatus === 'uploading'
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5'
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
        </div>

        {/* Gallery Grid */}
        <div className="xl:col-span-2">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[600px] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <ImageIcon size={18} className="text-indigo-600" />
                  Live Grid
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
                <Loader2 size={48} className="text-slate-200 animate-spin mb-4" />
                <p className="text-slate-400 font-bold">Synchronizing with server...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                {filteredImages.map((image) => (
                  <div key={image.id} className="group relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 aspect-square flex flex-col">
                    <div className="relative flex-1 overflow-hidden">
                      <img 
                        src={image.image_url?.startsWith('http') || image.image_url?.startsWith('blob') ? image.image_url : `${UPLOAD_BASE}${image.image_url}`} 
                        alt={image.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      {/* Badge */}
                      {image.category && (
                         <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] uppercase tracking-widest font-black text-white">
                           {image.category}
                         </div>
                      )}

                      {/* Overlay actions */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button 
                             onClick={() => setEditItem(image)}
                             className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-lg"
                             title="Edit Details"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteImage(image.id)}
                            className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all shadow-lg"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white font-bold text-xs truncate mb-1">{image.title}</p>
                          {image.description && (
                            <p className="text-slate-300 text-[10px] leading-snug line-clamp-2">
                              {image.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty States Placeholder */}
                {filteredImages.length === 0 && (
                  <div className="col-span-full border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300 py-20">
                     <ImageIcon size={48} className="mb-4 opacity-50" />
                     <p className="text-slate-400 font-bold">No images found for {activeTab}.</p>
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
