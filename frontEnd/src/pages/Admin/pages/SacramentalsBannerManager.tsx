import { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Trash2, CheckCircle2, Loader2, X } from 'lucide-react';
import apiService from '../../../services/api';
import { uploadFile } from '../../../api/axiosInstance';

interface BannerImage {
  id: number;
  section: string;
  url: string;
  title?: string;
  message?: string;
  position?: number;
  created_at?: string;
}

const SECTION_OPTIONS = [
  { value: 'sacramentals', label: 'Slider Image' },
  { value: 'sacramentals-hero', label: 'Hero Banner' },
];

export default function SacramentalsBannerManager() {
  const [images, setImages] = useState<BannerImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [section, setSection] = useState<string>('sacramentals');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingMessage, setEditingMessage] = useState('');

  useEffect(() => {
    loadBannerImages();
  }, [section]);

  const loadBannerImages = async () => {
    setLoading(true);
    try {
      const data = await apiService.getSacramentalsSliderImages(section);
      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load sacramentals banner images:', err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please choose an image to upload first.');
      return;
    }

    setStatus('uploading');

    try {
      const uploadResponse = await uploadFile(selectedFile);
      const uploadedData = uploadResponse.data?.data;
      const uploaded = Array.isArray(uploadedData) ? uploadedData[0] : uploadedData;
      const imageUrl = uploaded?.url || uploaded?.secure_url;

      if (!imageUrl) {
        throw new Error('Upload did not return a usable image URL.');
      }

      const created = await apiService.createSacramentalsSliderImage({
        section,
        image_url: imageUrl,
        title: title || selectedFile.name,
        message,
      });

      setImages((prev) => [created, ...prev]);
      setSelectedFile(null);
      setTitle('');
      setMessage('');
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      console.error('Failed to upload sacramentals banner image:', err);
      alert('Upload failed. Please try again.');
      setStatus('idle');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this banner image?')) return;
    try {
      await apiService.deleteSacramentalsSliderImage(id);
      setImages((prev) => prev.filter((image) => image.id !== id));
    } catch (err) {
      console.error('Failed to delete banner image:', err);
      alert('Could not delete image.');
    }
  };

  const handleEdit = (image: BannerImage) => {
    setEditingId(image.id);
    setEditingTitle(image.title || '');
    setEditingMessage(image.message || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
    setEditingMessage('');
  };

  const handleSaveEdit = async (image: BannerImage) => {
    try {
      const updated = await apiService.updateSacramentalsSliderImage(image.id, {
        title: editingTitle,
        message: editingMessage,
      });
      setImages((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      handleCancelEdit();
    } catch (err) {
      console.error('Failed to save banner image edits:', err);
      alert('Could not save changes.');
    }
  };

  const swapPositions = async (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= images.length) return;

    const ordered = [...images].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const current = ordered[index];
    const target = ordered[nextIndex];
    if (!current || !target) return;

    try {
      const [updatedA, updatedB] = await Promise.all([
        apiService.updateSacramentalsSliderImage(current.id, { position: target.position ?? 0 }),
        apiService.updateSacramentalsSliderImage(target.id, { position: current.position ?? 0 }),
      ]);

      setImages((prev) => {
        return prev.map((item) => {
          if (item.id === updatedA.id) return { ...item, ...updatedA };
          if (item.id === updatedB.id) return { ...item, ...updatedB };
          return item;
        }).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      });
    } catch (err) {
      console.error('Failed to reorder images:', err);
      alert('Could not reorder images.');
    }
  };

  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-[30px] border border-blue-100 bg-gradient-to-br from-sky-50 via-white to-slate-50 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sacramentals Media Manager</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-2xl">Control hero and slider banners for the Sacramentals section with a polished, professional admin experience.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700 shadow-sm">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
              {images.length} {section === 'sacramentals-hero' ? 'hero image' : 'slider image'}{images.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200/50">
                <Upload size={20} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">Add a New Banner Image</p>
                <p className="text-sm text-slate-500">Upload a fresh hero or slider asset with title and overlay text.</p>
              </div>
            </div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">Banner type</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none mb-4"
            >
              {SECTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label className="block text-sm font-semibold text-slate-700 mb-2">Select image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />

            {previewUrl && (
              <div className="mt-4 overflow-hidden rounded-[28px] border border-slate-200 shadow-sm">
                <img src={previewUrl} alt="Preview" className="w-full h-44 object-cover" />
              </div>
            )}

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={section === 'sacramentals-hero' ? 'Hero title (optional)' : 'Optional banner title'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
              />

              <label className="block text-sm font-semibold text-slate-700">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional overlay message"
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={status === 'uploading' || !selectedFile}
              className={`mt-6 w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                status === 'uploading'
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white shadow-xl shadow-blue-200/50 hover:bg-blue-700'
              }`}
            >
              {status === 'uploading' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle2 size={18} />
                  Uploaded
                </>
              ) : (
                'Upload Banner'
              )}
            </button>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50/80 p-5 shadow-sm">
            <p className="text-sm font-semibold text-blue-900 mb-3">Best Practices</p>
            <ul className="space-y-2 text-sm leading-6 text-slate-600">
              <li>• Use wide, landscape images for the slider.</li>
              <li>• Keep overlay text minimal for cleaner hero banners.</li>
              <li>• Prioritize bright, high-contrast visuals.</li>
            </ul>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/20 min-h-[600px]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-blue-700">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xl">Current {section === 'sacramentals-hero' ? 'Hero Banners' : 'Slider Images'}</h3>
                  <p className="text-sm text-slate-500">Review and manage existing assets with reordered controls.</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                Showing {images.length} item{images.length === 1 ? '' : 's'}
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
                <Loader2 size={48} className="text-slate-200 animate-spin mb-4" />
                <p className="text-slate-400 font-bold">Loading images...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div key={image.id} className="group overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-[0_20px_70px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      <img src={image.url} alt={image.title || 'Banner'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <p className="text-base font-semibold text-slate-900 truncate">{image.title || 'Sacramentals Banner'}</p>
                          {image.message && <p className="text-sm text-slate-500 line-clamp-2">{image.message}</p>}
                          <p className="text-[11px] text-slate-400 uppercase tracking-[0.18em]">{image.created_at ? new Date(image.created_at).toLocaleDateString() : 'Added recently'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(image)}
                            className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(image.id)}
                            className="rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 uppercase tracking-[0.18em]">
                        <span className="rounded-2xl bg-white/80 px-3 py-2 shadow-sm">Position: {image.position ?? index + 1}</span>
                        <span className="rounded-2xl bg-white/80 px-3 py-2 shadow-sm text-right">{section === 'sacramentals-hero' ? 'Hero' : 'Slider'}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => swapPositions(index, 'up')}
                          disabled={index === 0}
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-blue-200"
                        >
                          Move Up
                        </button>
                        <button
                          onClick={() => swapPositions(index, 'down')}
                          disabled={index === images.length - 1}
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-blue-200"
                        >
                          Move Down
                        </button>
                      </div>

                      {editingId === image.id && (
                        <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">Editing</p>
                            <button onClick={handleCancelEdit} className="rounded-full p-1 text-slate-500 transition hover:text-slate-900">
                              <X size={16} />
                            </button>
                          </div>
                          <input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            placeholder="Edit title"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
                          />
                          <textarea
                            value={editingMessage}
                            onChange={(e) => setEditingMessage(e.target.value)}
                            placeholder="Edit message"
                            rows={3}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveEdit(image)}
                            className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {images.length === 0 && (
                  <div className="col-span-full rounded-[28px] border-2 border-dashed border-slate-200 bg-slate-50 py-24 text-center text-slate-500">
                    <ImageIcon size={48} className="mx-auto mb-4 text-blue-500" />
                    <p className="font-semibold text-slate-900">No sacramentals slider images yet.</p>
                    <p className="text-sm mt-2">Upload a hero image above to populate the page slider.</p>
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
