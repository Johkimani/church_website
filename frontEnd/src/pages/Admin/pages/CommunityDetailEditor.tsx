import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient, createTableRecord, updateTableRecord, deleteTableRecord, uploadFile } from '../../../api/axiosInstance';
import {
  ArrowLeft,
  Calendar,
  Megaphone,
  Users,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Info,
  Save,
  Image as ImageIcon,
  ShoppingBag,
  MessageSquare,
  FileText as FilePdf,
  Truck,
  Box,
  Eye,
  Check,
  X
} from 'lucide-react';

type TabType = 'about' | 'activities' | 'announcements' | 'members' | 'gallery' | 'tshirts' | 'suggestions';

interface GalleryItem {
  id: number;
  image_url: string;
  event_name: string;
  category?: string;
}

interface ProductItem {
  id: number;
  name: string;
  price: number;
  sizes?: string[] | string;
  image_url?: string;
  description?: string;
}

interface OrderItem {
  id: number;
  recipient_name: string;
  phone: string;
  size: string;
  quantity: number;
  total_amount: number;
  status: string;
  created_at: string;
}

interface SuggestionItem {
  id: number;
  name?: string;
  email?: string;
  suggestion: string;
  category?: string;
  status: string;
  created_at?: string;
  member_jumuiya?: string;
}

export default function CommunityDetailEditor() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [moduleMeta, setModuleMeta] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [aboutSaving, setAboutSaving] = useState(false);
  const [aboutForm, setAboutForm] = useState({ biography: '', saint_image_url: '', history_pdf_url: '' });
  const [enrollmentStats, setEnrollmentStats] = useState<{ total: string; approved: string; pending: string; rejected: string } | null>(null);

  // Community-specific Gallery state
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [galleryModal, setGalleryModal] = useState(false);
  const [newImageForm, setNewImageForm] = useState({ event_name: '', image_url: '', category: '' });

  // Community-specific T-Shirts state
  const [tshirtTab, setTshirtTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [productModal, setProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', price: 1200, sizes: 'S, M, L, XL, XXL', description: '', image_url: '' });

  // Community-specific Suggestions state
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  useEffect(() => {
    loadCategoryData();
  }, [categoryId, activeTab]);

  // Sync moduleMeta into aboutForm whenever meta loads/changes
  useEffect(() => {
    if (moduleMeta) {
      setAboutForm({
        biography: moduleMeta.description || moduleMeta.story || moduleMeta.about || '',
        saint_image_url: moduleMeta.saint_image_url || moduleMeta.image_url || '',
        history_pdf_url: moduleMeta.history_pdf_url || moduleMeta.pdf_url || '',
      });
    }
  }, [moduleMeta]);

  const loadCategoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Module Meta if not already loaded or category changed
      if (!moduleMeta || moduleMeta.id !== categoryId) {
        const modulesResponse = await apiClient.get('/hub_modules');
        const modules = Array.isArray(modulesResponse.data) ? modulesResponse.data : (modulesResponse.data?.data || []);
        const meta = modules.find((m: any) => m.id === categoryId);
        setModuleMeta(meta);
      }

      // 2. Fetch specific tab data
      if (activeTab === 'about') {
        setLoading(false);
        return;
      }

      if (activeTab === 'gallery') {
        try {
          const res = await apiClient.get('/hub-gallery', { params: { module_id: categoryId } });
          setGalleryImages(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
          console.error('Failed to load gallery for community', e);
        }
        setLoading(false);
        return;
      }

      if (activeTab === 'tshirts') {
        try {
          const prodRes = await apiClient.get(`/community-tshirts/${categoryId}/products`);
          setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
          const ordRes = await apiClient.get(`/community-tshirts/${categoryId}/orders`);
          setOrders(Array.isArray(ordRes.data) ? ordRes.data : []);
        } catch (e) {
          console.error('Failed to load tshirts for community', e);
        }
        setLoading(false);
        return;
      }

      if (activeTab === 'suggestions') {
        try {
          const res = await apiClient.get('/suggestions').catch(async () => {
            return await apiClient.get('/table/suggestions');
          });
          const allSuggestions = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          const filtered = allSuggestions.filter((s: any) => 
            s.jumuiya_id === categoryId || 
            (s.category && s.category.toLowerCase().includes(categoryId?.toLowerCase() || ''))
          );
          setSuggestions(filtered);
        } catch (e) {
          console.error('Failed to load suggestions for community', e);
        }
        setLoading(false);
        return;
      }

      // Members use dedicated enrollment endpoint
      if (activeTab === 'members') {
        try {
          const res = await apiClient.get(`/community-enrollment/${categoryId}`, {
            params: { status: 'all' },
          });
          setData(res.data?.enrollments || []);
          setEnrollmentStats(res.data?.stats || null);
        } catch {
          const response = await apiClient.get('/enrollments');
          const items = Array.isArray(response.data) ? response.data : (response.data?.data || []);
          setData(items.filter((item: any) => (item.module_id === categoryId) || (item.class_id === categoryId)));
        }
        setLoading(false);
        return;
      }

      let tableName = '';
      switch (activeTab) {
        case 'activities': tableName = 'hub_activities'; break;
        case 'announcements': tableName = 'hub_announcements'; break;
      }

      if (tableName) {
        const response = await apiClient.get(`/${tableName}`);
        const items = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        const filtered = items.filter((item: any) =>
          (item.module_id === categoryId) || (item.class_id === categoryId)
        );
        setData(filtered);
      }
    } catch (err: any) {
      console.error(`[DetailEditor] Load error for ${activeTab}:`, err);
      setError(`Failed to load ${activeTab} data`);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormValues({});
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormValues({ ...item });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingItem(null); setFormValues({}); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      setFormValues(v => ({ ...v, _files: Array.from(files) }));
    }
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'activities' || activeTab === 'announcements') {
        if (!formValues.title) return alert('Title required');
      }
      if (activeTab === 'members') {
        if (!formValues.full_name) return alert('Full name required');
      }

      if (formValues._files && formValues._files.length) {
        setUploading(true);
        const res = await uploadFile(formValues._files as File[]);
        const uploaded = res.data || [];
        if (uploaded[0]) {
          const uploadedUrl = uploaded[0].url || uploaded[0].secure_url || uploaded[0].path;
          const uploadedId = uploaded[0].public_id || uploaded[0].id;
          formValues.image_url = uploadedUrl;
          formValues.public_id = uploadedId;
        }
        setUploading(false);
      }

      const tableName = activeTab === 'activities' ? 'hub_activities' : activeTab === 'announcements' ? 'hub_announcements' : 'enrollments';
      let payload: any = { module_id: categoryId };

      if (activeTab === 'activities') {
        payload = {
          module_id: categoryId,
          title: formValues.title,
          description: formValues.description,
          activity_date: formValues.activity_date || null,
          location: formValues.location || '',
          status: formValues.status || 'Upcoming'
        };
      } else if (activeTab === 'announcements') {
        payload = {
          module_id: categoryId,
          title: formValues.title,
          content: formValues.description || formValues.content,
          announcement_date: formValues.announcement_date || new Date().toISOString()
        };
      } else if (activeTab === 'members') {
        payload = {
          class_id: categoryId,
          module_id: categoryId,
          full_name: formValues.full_name || formValues.fullName,
          voice_type: ['charismatic', 'dancers', 'youth'].includes(categoryId || '') ? '' : (formValues.voice_type || ''),
          music_level: ['charismatic', 'dancers', 'youth'].includes(categoryId || '') ? '' : (formValues.music_level || 'Beginner'),
          phone: ['charismatic', 'dancers', 'youth'].includes(categoryId || '') ? (formValues.phone || formValues.phoneNumber || '') : '',
          email: formValues.email || '',
          status: formValues.status || 'Pending'
        };
      }

      if (editingItem?.id) {
        await updateTableRecord(tableName, editingItem.id, payload);
        showToast('Updated successfully');
      } else {
        await createTableRecord(tableName, payload);
        showToast('Created successfully');
      }

      try {
        localStorage.removeItem('csa_cache_hub_activities');
        localStorage.removeItem('csa_cache_hub_announcements');
        localStorage.removeItem('csa_cache_enrollments');
      } catch { }

      closeModal();
      await loadCategoryData();
    } catch (err: any) {
      console.error('Save failed', err);
      alert(err?.message || 'Save failed');
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;
    try {
      const tableName = activeTab === 'activities' ? 'hub_activities' : activeTab === 'announcements' ? 'hub_announcements' : 'enrollments';
      await deleteTableRecord(tableName, id as any);
      showToast('Deleted');
      await loadCategoryData();
    } catch (err: any) {
      console.error('Delete failed', err);
      alert('Delete failed');
    }
  };

  const showToast = (msg: string) => {
    try { (window as any).toast && (window as any).toast(msg); } catch { }
  };

  const handleSaveAbout = async () => {
    if (!categoryId) return;
    setAboutSaving(true);
    try {
      await apiClient.patch(`/hub_modules/${categoryId}`, {
        description: aboutForm.biography,
        story: aboutForm.biography,
        about: aboutForm.biography,
        saint_image_url: aboutForm.saint_image_url,
        history_pdf_url: aboutForm.history_pdf_url,
      });
      showToast('About content saved successfully!');
      const modulesResponse = await apiClient.get('/hub_modules');
      const modules = Array.isArray(modulesResponse.data) ? modulesResponse.data : (modulesResponse.data?.data || []);
      const meta = modules.find((m: any) => m.id === categoryId);
      setModuleMeta(meta);
    } catch (err: any) {
      console.error('Save about failed', err);
      alert('Failed to save about content. Please try again.');
    } finally {
      setAboutSaving(false);
    }
  };

  // Gallery Handlers
  const handleAddGalleryImage = async () => {
    if (!newImageForm.image_url || !newImageForm.event_name) {
      return alert('Event name and image URL are required');
    }
    try {
      await apiClient.post('/hub-gallery', {
        image_url: newImageForm.image_url,
        event_name: newImageForm.event_name,
        category: newImageForm.category || moduleMeta?.title || 'Community',
        module_id: categoryId,
      });
      showToast('Photo added to community gallery!');
      setGalleryModal(false);
      setNewImageForm({ event_name: '', image_url: '', category: '' });
      await loadCategoryData();
    } catch (err: any) {
      alert('Failed to add gallery photo');
    }
  };

  const handleDeleteGalleryImage = async (id: number) => {
    if (!confirm('Remove this photo from the community gallery?')) return;
    try {
      await apiClient.delete(`/hub-gallery/${id}`);
      showToast('Photo removed');
      await loadCategoryData();
    } catch (e) {
      alert('Failed to delete photo');
    }
  };

  // T-Shirt Product Handlers
  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) return alert('Name and Price required');
    try {
      const sizesArray = typeof productForm.sizes === 'string' 
        ? productForm.sizes.split(',').map(s => s.trim()).filter(Boolean)
        : productForm.sizes;

      await apiClient.post(`/community-tshirts/${categoryId}/products`, {
        name: productForm.name,
        price: Number(productForm.price),
        sizes: sizesArray,
        description: productForm.description,
        image_url: productForm.image_url,
      });
      showToast('Product updated successfully!');
      setProductModal(false);
      await loadCategoryData();
    } catch (e) {
      alert('Failed to save product');
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await apiClient.patch(`/community-tshirts/orders/${orderId}`, { status });
      showToast(`Order status updated to ${status}`);
      await loadCategoryData();
    } catch (e) {
      alert('Failed to update order status');
    }
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'about', label: 'About Content', icon: Info },
    { id: 'activities', label: 'Semester Activities', icon: Calendar },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'members', label: 'Registered Members', icon: Users },
    { id: 'gallery', label: 'Gallery & Media', icon: ImageIcon },
    { id: 'tshirts', label: 'T-Shirts & Orders', icon: ShoppingBag },
    { id: 'suggestions', label: 'Suggestion Box', icon: MessageSquare },
  ];

  if (loading && !moduleMeta) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold">Connecting to {categoryId} dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumbs & Header */}
      <div>
        <button
          onClick={() => navigate('/admin/community-management')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm mb-4"
        >
          <ArrowLeft size={16} /> Back to Community Management
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl"
              style={{ backgroundColor: moduleMeta?.theme_color || '#3b82f6' }}
            >
              <i className={`${moduleMeta?.icon_class} text-2xl`}></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 uppercase">{moduleMeta?.title || categoryId} COMMAND CENTER</h2>
              <p className="text-slate-500 text-sm mt-0.5">Admin Level Access • Manage {categoryId} resources, gallery, attire & members.</p>
            </div>
          </div>
          <a
            href={`/community/${categoryId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ExternalLink size={16} /> Public Preview
          </a>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/70 border border-slate-200 rounded-2xl w-fit max-w-full overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {/* Tab Header Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          <div>
            <h3 className="font-black text-slate-800 uppercase tracking-tight">
              Manage {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-xs text-slate-500 font-medium">Administration for {moduleMeta?.title || categoryId}</p>
          </div>
          {activeTab === 'activities' || activeTab === 'announcements' || activeTab === 'members' ? (
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-3 py-2 border rounded-md text-sm mr-2" />
              <button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                <Plus size={18} />
                Add {activeTab === 'members' ? 'Member' : 'New ' + (activeTab.slice(0, -1))}
              </button>
            </div>
          ) : activeTab === 'gallery' ? (
            <button onClick={() => setGalleryModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              <Plus size={18} /> Add Community Photo
            </button>
          ) : activeTab === 'tshirts' ? (
            <button onClick={() => setProductModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              <Plus size={18} /> Manage Merchandise / Price
            </button>
          ) : null}
        </div>

        <div className="p-6">
          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="space-y-6 max-w-2xl">
              <p className="text-sm text-slate-500 font-medium">
                Manage the biography, image, and PDF history document displayed on the public About tab.
              </p>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">Biography / Description</label>
                <textarea
                  rows={8}
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
                  placeholder="Enter a biography or description for this community..."
                  value={aboutForm.biography}
                  onChange={(e) => setAboutForm(v => ({ ...v, biography: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">Saint / Community Image URL</label>
                <input
                  type="url"
                  className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="https://... (direct image link)"
                  value={aboutForm.saint_image_url}
                  onChange={(e) => setAboutForm(v => ({ ...v, saint_image_url: e.target.value }))}
                />
                {aboutForm.saint_image_url && (
                  <img src={aboutForm.saint_image_url} alt="Preview" className="mt-3 w-40 h-40 object-cover rounded-xl border shadow-sm" />
                )}
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-1">History PDF URL</label>
                <input
                  type="url"
                  className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="https://... (link to PDF document)"
                  value={aboutForm.history_pdf_url}
                  onChange={(e) => setAboutForm(v => ({ ...v, history_pdf_url: e.target.value }))}
                />
                {aboutForm.history_pdf_url && (
                  <a href={aboutForm.history_pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 text-sm text-red-600 font-bold hover:underline">
                    <FilePdf size={16} /> Preview PDF
                  </a>
                )}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveAbout}
                  disabled={aboutSaving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-60"
                >
                  {aboutSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {aboutSaving ? 'Saving...' : 'Save About Content'}
                </button>
              </div>
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <div>
              {galleryImages.length === 0 ? (
                <div className="text-center py-16">
                  <ImageIcon size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="font-bold text-slate-600">No community gallery photos yet</p>
                  <p className="text-xs text-slate-400 mt-1">Upload pictures to showcase your events and activities.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map(img => (
                    <div key={img.id} className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-50">
                      <img src={img.image_url} alt={img.event_name} className="w-full h-44 object-cover" />
                      <div className="p-3">
                        <p className="text-xs font-bold text-slate-800 truncate">{img.event_name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{img.category || 'General'}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteGalleryImage(img.id)}
                        className="absolute top-2 right-2 p-2 bg-rose-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition shadow-md"
                        title="Delete photo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* T-SHIRTS & ORDERS TAB */}
          {activeTab === 'tshirts' && (
            <div className="space-y-6">
              <div className="flex gap-2 border-b pb-3">
                <button
                  onClick={() => setTshirtTab('products')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${tshirtTab === 'products' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Merchandise Catalog ({products.length})
                </button>
                <button
                  onClick={() => setTshirtTab('orders')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${tshirtTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Customer Orders ({orders.length})
                </button>
              </div>

              {tshirtTab === 'products' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(prod => (
                    <div key={prod.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 flex flex-col justify-between">
                      <div>
                        {prod.image_url ? (
                          <img src={prod.image_url} alt={prod.name} className="w-full h-40 object-cover rounded-xl mb-3" />
                        ) : (
                          <div className="w-full h-40 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 mb-3">
                            <ShoppingBag size={32} />
                          </div>
                        )}
                        <h4 className="font-black text-slate-800">{prod.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{prod.description || 'Community attire'}</p>
                        <p className="text-base font-black text-blue-600 mt-2">KES {prod.price.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => {
                          setProductForm({
                            name: prod.name,
                            price: prod.price,
                            sizes: Array.isArray(prod.sizes) ? prod.sizes.join(', ') : (prod.sizes || 'S, M, L, XL, XXL'),
                            description: prod.description || '',
                            image_url: prod.image_url || '',
                          });
                          setProductModal(true);
                        }}
                        className="mt-4 w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                      >
                        Edit Product Details
                      </button>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-slate-500 font-bold text-sm">No products listed for this community yet.</p>
                      <button onClick={() => setProductModal(true)} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
                        Add First Product
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b text-[10px] font-black uppercase text-slate-400">
                        <th className="py-3 px-3">Recipient</th>
                        <th className="py-3 px-3">Phone</th>
                        <th className="py-3 px-3">Size & Qty</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} className="border-b hover:bg-slate-50 text-xs">
                          <td className="py-3 px-3 font-bold text-slate-800">{order.recipient_name}</td>
                          <td className="py-3 px-3 text-slate-600">{order.phone}</td>
                          <td className="py-3 px-3 text-slate-700 font-medium">Size {order.size} (Qty: {order.quantity})</td>
                          <td className="py-3 px-3 font-bold text-emerald-600">KES {order.total_amount?.toLocaleString()}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'processing' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="text-[11px] p-1 border rounded-lg bg-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <p className="text-center py-10 text-slate-400 text-xs font-semibold">No orders recorded for this community.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SUGGESTIONS TAB */}
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Review constructive ideas and feedback submitted by members for {moduleMeta?.title || categoryId}.
              </p>
              {suggestions.length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-600 font-bold text-sm">No suggestions submitted yet</p>
                  <p className="text-slate-400 text-xs mt-0.5">Suggestions from the community page will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map(s => (
                    <div key={s.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.name ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                            {s.name ? s.name : 'Anonymous Member'}
                          </span>
                          {s.category && (
                            <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                              #{s.category}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{s.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MEMBERS / ACTIVITIES / ANNOUNCEMENTS */}
          {(activeTab === 'activities' || activeTab === 'announcements' || activeTab === 'members') && (
            <>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
                  <p className="text-slate-400 text-sm">Synchronizing table data...</p>
                </div>
              ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    {activeTab === 'activities' && <Calendar size={32} />}
                    {activeTab === 'announcements' && <Megaphone size={32} />}
                    {activeTab === 'members' && <Users size={32} />}
                  </div>
                  <h4 className="text-slate-800 font-bold italic">No records found</h4>
                  <p className="text-slate-500 text-sm mt-1">Click the "Add" button to populate this section.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {activeTab === 'members' ? (
                    <>
                      {enrollmentStats && (
                        <div className="grid grid-cols-4 gap-4 mb-6">
                          {[
                            { label: 'Total', value: enrollmentStats.total, color: 'blue' },
                            { label: 'Approved', value: enrollmentStats.approved, color: 'emerald' },
                            { label: 'Pending', value: enrollmentStats.pending, color: 'amber' },
                            { label: 'Rejected', value: enrollmentStats.rejected, color: 'rose' },
                          ].map((stat) => (
                            <div key={stat.label} className="rounded-xl p-3 text-center bg-slate-50 border border-slate-200">
                              <p className="text-xl font-black text-slate-800">{stat.value}</p>
                              <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</th>
                            {['charismatic', 'dancers', 'youth'].includes(categoryId || '') ? (
                              <>
                                <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Email</th>
                              </>
                            ) : (
                              <>
                                <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Voice</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Level</th>
                              </>
                            )}
                            <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                            <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.filter(m => {
                            const name = m.fullName || m.full_name || '';
                            return name.toLowerCase().includes(searchTerm.toLowerCase());
                          }).map((member) => (
                            <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-4 font-bold text-slate-700">{member.fullName || member.full_name}</td>
                              {['charismatic', 'dancers', 'youth'].includes(categoryId || '') ? (
                                <>
                                  <td className="py-4 px-4 text-sm text-slate-600">{member.phoneNumber || member.phone || 'N/A'}</td>
                                  <td className="py-4 px-4 text-sm text-slate-600">{member.email || 'N/A'}</td>
                                </>
                              ) : (
                                <>
                                  <td className="py-4 px-4 text-sm text-slate-600 capitalize">{member.voice_type || 'N/A'}</td>
                                  <td className="py-4 px-4 text-sm text-slate-600 capitalize">{member.music_level || 'N/A'}</td>
                                </>
                              )}
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                                  member.status === 'Pending' ? 'bg-amber-100 text-amber-700' : member.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                }`}>
                                  {member.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {member.status !== 'Approved' && (
                                    <button onClick={async (e) => { e.stopPropagation(); try { await updateTableRecord('enrollments', member.id, { status: 'Approved' }); showToast('Member approved'); await loadCategoryData(); } catch { alert('Approve failed'); } }} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg" title="Approve">
                                      <CheckCircle size={18} />
                                    </button>
                                  )}
                                  {member.status !== 'Rejected' && (
                                    <button onClick={async (e) => { e.stopPropagation(); try { await updateTableRecord('enrollments', member.id, { status: 'Rejected' }); showToast('Member rejected'); await loadCategoryData(); } catch { alert('Reject failed'); } }} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg" title="Reject">
                                      <XCircle size={18} />
                                    </button>
                                  )}
                                  <button onClick={(e) => { e.stopPropagation(); handleDelete(member.id); }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" title="Delete">
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <div className="space-y-4">
                      {data.map((item) => (
                        <div key={item.id} onClick={() => openEditModal(item)} className="p-5 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/10 transition-all flex items-start justify-between gap-4 group cursor-pointer">
                          <div className="flex gap-4">
                            <div className={`p-3 rounded-xl shrink-0 ${activeTab === 'activities' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                              {activeTab === 'activities' ? <Calendar size={20} /> : <Megaphone size={20} />}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-lg uppercase tracking-tight">{item.title}</h4>
                              <p className="text-slate-500 text-sm mt-1 leading-relaxed">{item.description || item.content}</p>
                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                  <Clock size={14} /> {item.activity_date || item.announcement_date ? new Date(item.activity_date || item.announcement_date).toLocaleDateString() : 'N/A'}
                                </div>
                                {item.location && (
                                  <div className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest">{item.location}</div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); openEditModal(item); }} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"><Edit2 size={18} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal for Activities / Announcements / Members */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-4">{editingItem ? 'Edit' : 'Add'} {activeTab === 'activities' ? 'Activity' : activeTab === 'announcements' ? 'Announcement' : 'Member'}</h3>
            <div className="space-y-3">
              {(activeTab === 'activities' || activeTab === 'announcements') && (
                <>
                  <div>
                    <label className="text-sm font-bold">Title</label>
                    <input value={formValues.title || ''} onChange={(e) => setFormValues(v => ({ ...v, title: e.target.value }))} className="w-full border px-3 py-2 rounded mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-bold">Description / Content</label>
                    <textarea value={formValues.description || formValues.content || ''} onChange={(e) => setFormValues(v => ({ ...v, description: e.target.value, content: e.target.value }))} className="w-full border px-3 py-2 rounded mt-1" rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-bold">Venue / Location</label>
                      <input value={formValues.location || ''} onChange={(e) => setFormValues(v => ({ ...v, location: e.target.value }))} className="w-full border px-3 py-2 rounded mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-bold">Date</label>
                      <input type="date" value={formValues.activity_date?.slice?.(0, 10) || formValues.announcement_date?.slice?.(0, 10) || ''} onChange={(e) => setFormValues(v => ({ ...v, activity_date: e.target.value, announcement_date: e.target.value }))} className="w-full border px-3 py-2 rounded mt-1" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'members' && (
                <>
                  <div>
                    <label className="text-sm font-bold">Full name</label>
                    <input value={formValues.full_name || formValues.fullName || ''} onChange={(e) => setFormValues(v => ({ ...v, full_name: e.target.value }))} className="w-full border px-3 py-2 rounded mt-1" />
                  </div>
                  {['charismatic', 'dancers', 'youth'].includes(categoryId || '') ? (
                    <>
                      <div>
                        <label className="text-sm font-bold">Phone Number</label>
                        <input value={formValues.phone || formValues.phoneNumber || ''} onChange={(e) => setFormValues(v => ({ ...v, phone: e.target.value }))} className="w-full border px-3 py-2 rounded mt-1" placeholder="e.g. 0712345678" />
                      </div>
                      <div>
                        <label className="text-sm font-bold">Email Address (optional)</label>
                        <input type="email" value={formValues.email || ''} onChange={(e) => setFormValues(v => ({ ...v, email: e.target.value }))} className="w-full border px-3 py-2 rounded mt-1" placeholder="e.g. email@example.com" />
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-bold">Voice Type (optional)</label>
                        <select value={formValues.voice_type || ''} onChange={(e) => setFormValues(v => ({ ...v, voice_type: e.target.value }))} className="w-full border px-3 py-2 rounded mt-1">
                          <option value="">Select...</option>
                          <option value="Soprano">Soprano</option>
                          <option value="Alto">Alto</option>
                          <option value="Tenor">Tenor</option>
                          <option value="Bass">Bass</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-bold">Music Level</label>
                        <select value={formValues.music_level || 'Beginner'} onChange={(e) => setFormValues(v => ({ ...v, music_level: e.target.value }))} className="w-full border px-3 py-2 rounded mt-1">
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-bold">Status</label>
                    <select value={formValues.status || 'Pending'} onChange={(e) => setFormValues(v => ({ ...v, status: e.target.value }))} className="w-full border px-3 py-2 rounded mt-1">
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-bold">Attachment / Image (optional)</label>
                <input type="file" onChange={handleFileChange} className="w-full mt-1" />
                {formValues.image_url && <img src={formValues.image_url} alt="preview" className="w-32 h-20 object-cover mt-2 rounded" />}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button onClick={closeModal} className="px-4 py-2 rounded bg-slate-100 font-bold text-xs">Cancel</button>
                <button disabled={uploading} onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white font-bold text-xs">{uploading ? 'Uploading...' : (editingItem ? 'Save Changes' : 'Create')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Gallery Add */}
      {galleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-4">Add Photo to {moduleMeta?.title || categoryId} Gallery</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Event / Caption Name</label>
                <input
                  type="text"
                  placeholder="e.g. Easter Choir Rehearsal"
                  value={newImageForm.event_name}
                  onChange={(e) => setNewImageForm(v => ({ ...v, event_name: e.target.value }))}
                  className="w-full border p-2 rounded-xl text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Category Tag (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Concerts, Sunday Mass"
                  value={newImageForm.category}
                  onChange={(e) => setNewImageForm(v => ({ ...v, category: e.target.value }))}
                  className="w-full border p-2 rounded-xl text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Direct Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newImageForm.image_url}
                  onChange={(e) => setNewImageForm(v => ({ ...v, image_url: e.target.value }))}
                  className="w-full border p-2 rounded-xl text-xs mt-1"
                />
              </div>
              {newImageForm.image_url && (
                <img src={newImageForm.image_url} alt="preview" className="w-full h-36 object-cover rounded-xl border mt-2" />
              )}
              <div className="flex justify-end gap-2 pt-3">
                <button onClick={() => setGalleryModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Cancel</button>
                <button onClick={handleAddGalleryImage} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Upload Photo</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for T-Shirt Product */}
      {productModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-4">Manage {moduleMeta?.title || categoryId} T-Shirt Product</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Official Choir Polo T-Shirt"
                  value={productForm.name}
                  onChange={(e) => setProductForm(v => ({ ...v, name: e.target.value }))}
                  className="w-full border p-2 rounded-xl text-xs mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Price (KES)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm(v => ({ ...v, price: Number(e.target.value) }))}
                    className="w-full border p-2 rounded-xl text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Available Sizes (comma separated)</label>
                  <input
                    type="text"
                    value={productForm.sizes}
                    onChange={(e) => setProductForm(v => ({ ...v, sizes: e.target.value }))}
                    className="w-full border p-2 rounded-xl text-xs mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={productForm.image_url}
                  onChange={(e) => setProductForm(v => ({ ...v, image_url: e.target.value }))}
                  className="w-full border p-2 rounded-xl text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm(v => ({ ...v, description: e.target.value }))}
                  className="w-full border p-2 rounded-xl text-xs mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button onClick={() => setProductModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Cancel</button>
                <button onClick={handleSaveProduct} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Save Product</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
