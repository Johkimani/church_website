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
import PageLoader from '../../../assets/Layouts/PageLoader';

type TabType = 'about' | 'activities' | 'announcements' | 'schedules' | 'members' | 'gallery' | 'tshirts' | 'suggestions';

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
  const [choirVoiceFilter, setChoirVoiceFilter] = useState<'all' | 'soprano' | 'alto' | 'tenor' | 'bass'>('all');
  const [choirGenderFilter, setChoirGenderFilter] = useState<'all' | 'male' | 'female'>('all');
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

      if (activeTab === 'schedules') {
        try {
          const res = await apiClient.get(`/practice-schedules/${categoryId}`);
          setData(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
          console.error('Failed to load practice schedules', e);
          setData([]);
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

      if (activeTab === 'schedules') {
        if (!formValues.day || !formValues.start_time || !formValues.location) {
          return alert('Day, Start Time, and Location are required');
        }
        const payload = {
          module_id: categoryId,
          day: formValues.day || 'Saturday',
          start_time: formValues.start_time,
          end_time: formValues.end_time || formValues.start_time,
          location: formValues.location,
          sort_order: Number(formValues.sort_order || 0)
        };
        if (editingItem?.id) {
          await apiClient.put(`/practice-schedules/${editingItem.id}`, payload);
          showToast('Practice schedule updated');
        } else {
          await apiClient.post('/practice-schedules', payload);
          showToast('Practice schedule created');
        }
        closeModal();
        await loadCategoryData();
        return;
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
      if (activeTab === 'schedules') {
        await apiClient.delete(`/practice-schedules/${id}`);
        showToast('Schedule deleted');
        await loadCategoryData();
        return;
      }
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

  const isStFrancisAdmin = categoryId === 'st-francis';
  const isDancersAdmin = categoryId === 'dancers';
  const isChoirAdmin = categoryId === 'choir';
  const isCharismaticAdmin = categoryId === 'charismatic';
  const isMentorshipAdmin = categoryId === 'youth' || categoryId === 'mentorship';

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'about', label: 'About Content', icon: Info },
    {
      id: 'activities',
      label: isStFrancisAdmin
        ? 'Feast Days & Outreaches'
        : isDancersAdmin
        ? 'Ministrations & Masses'
        : isCharismaticAdmin
        ? 'Prayer Vigils & Gatherings'
        : isMentorshipAdmin
        ? 'Workshops & Seminars'
        : 'Activities & Masses',
      icon: Calendar
    },
    {
      id: 'announcements',
      label: isStFrancisAdmin
        ? 'Welfare & Eco Notices'
        : isDancersAdmin
        ? 'Costume & Stage Notices'
        : isCharismaticAdmin
        ? 'Intercession Bulletins'
        : isMentorshipAdmin
        ? 'Cohort & Resource Bulletins'
        : 'Announcements & Costumes',
      icon: Megaphone
    },
    {
      id: 'schedules',
      label: isStFrancisAdmin
        ? 'Fellowship & SCC Schedule'
        : isDancersAdmin
        ? 'Rehearsal & Staging Schedule'
        : isCharismaticAdmin
        ? 'Prayer & Vigil Schedule'
        : isMentorshipAdmin
        ? 'Cohort & Coaching Sessions'
        : 'Practice & Rehearsals',
      icon: Clock
    },
    { id: 'members', label: isMentorshipAdmin ? 'Enrolled Mentees & Mentors' : 'Registered Members', icon: Users },
    { id: 'gallery', label: 'Gallery & Media', icon: ImageIcon },
    {
      id: 'tshirts',
      label: isStFrancisAdmin ? 'Polo Shirts & Uniform Orders' : 'T-Shirts & Orders',
      icon: ShoppingBag
    },
    { id: 'suggestions', label: 'Suggestion Box', icon: MessageSquare },
  ];

  if (loading && !moduleMeta) {
    return <PageLoader message={`Connecting to ${categoryId} dashboard`} fullScreen />;
  }

  // Community accent color (guaranteeing dark vibrant contrast, ignoring white/light overrides)
  const rawThemeColor = moduleMeta?.theme_color;
  const isInvalidWhite = !rawThemeColor || rawThemeColor === '#ffffff' || rawThemeColor === '#fff' || rawThemeColor.toLowerCase() === 'white' || rawThemeColor === '#f8fafc' || rawThemeColor === '#f1f5f9';
  
  const accentColor = !isInvalidWhite
    ? rawThemeColor
    : (isChoirAdmin ? '#1e40af' : isDancersAdmin ? '#db2777' : isCharismaticAdmin ? '#7c3aed' : isStFrancisAdmin ? '#047857' : isMentorshipAdmin ? '#8e44ad' : '#2563eb');

  const accentGradient = isChoirAdmin
    ? 'from-[#1e40af] via-[#1d4ed8] to-[#1e3a8a]'
    : isDancersAdmin
    ? 'from-[#db2777] via-[#be185d] to-[#9d174d]'
    : isCharismaticAdmin
    ? 'from-[#7c3aed] via-[#6d28d9] to-[#4c1d95]'
    : isStFrancisAdmin
    ? 'from-[#047857] via-[#065f46] to-[#064e3b]'
    : isMentorshipAdmin
    ? 'from-[#8e44ad] via-[#7d3c98] to-[#6c3483]'
    : 'from-[#2563eb] via-[#1d4ed8] to-[#1e40af]';

  const adminDesc = isStFrancisAdmin
    ? 'Charity outreach • Eco stewardship • SCC fellowship • Member welfare'
    : isDancersAdmin
    ? 'Ministrations • Costume notices • Choreography schedules • Gallery'
    : isCharismaticAdmin
    ? 'Vigils & gatherings • Intercession bulletins • Prayer schedules • Members'
    : isMentorshipAdmin
    ? 'Cohort sessions • Workshops • Mentor pairings • Resource toolkits'
    : isChoirAdmin
    ? 'Rehearsals • SATB section management • Anthem schedules • Gallery'
    : `Resources • Gallery • Attire orders • Member roster`;

  return (
    <div className="space-y-0 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ══════════════════════════════════════════════════════
          HERO HEADER BANNER
      ══════════════════════════════════════════════════════ */}
      <div className={`relative bg-gradient-to-br ${accentGradient} overflow-hidden`}>
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-5 bg-white" />
        <div className="absolute top-4 right-32 w-20 h-20 rounded-full opacity-10 bg-white" />

        <div className="relative px-6 py-6">
          {/* Back Navigation */}
          <button
            onClick={() => navigate('/admin/community-management')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold text-sm mb-5 group"
          >
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition">
              <ArrowLeft size={14} />
            </div>
            Back to Community Hub
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div className="flex items-center gap-4">
              {/* Community Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border-2 border-white/25 flex items-center justify-center text-white shadow-xl shrink-0">
                {moduleMeta?.icon_class
                  ? <i className={`${moduleMeta.icon_class} text-2xl`}></i>
                  : <Users size={26} />}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50 bg-white/10 px-2 py-0.5 rounded-md">Admin Command Center</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md">● Active</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                  {moduleMeta?.title || categoryId}
                </h1>
                <p className="text-white/55 text-xs mt-1 font-medium">{adminDesc}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`/community/${categoryId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-bold text-white transition-all"
              >
                <Eye size={14} /> Preview Live Page
              </a>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-800 rounded-xl text-sm font-bold hover:bg-white/90 transition-all shadow-lg"
                style={{ color: accentColor }}
              >
                <Plus size={16} /> Add New Record
              </button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {[
              { label: 'Records', value: data.length, show: activeTab !== 'about' && activeTab !== 'gallery' && activeTab !== 'tshirts' && activeTab !== 'suggestions' },
              { label: 'Gallery Photos', value: galleryImages.length, show: activeTab === 'gallery' },
              { label: 'Products', value: products.length, show: activeTab === 'tshirts' },
              { label: 'Suggestions', value: suggestions.length, show: activeTab === 'suggestions' },
            ].filter(s => s.show).map((s, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15">
                <span className="text-white font-black text-base leading-none">{s.value}</span>
                <span className="text-white/60 text-[11px] font-semibold">{s.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15">
              <span className="text-white font-black text-base leading-none">
                {tabs.findIndex(t => t.id === activeTab) + 1}/{tabs.length}
              </span>
              <span className="text-white/60 text-[11px] font-semibold">Active Tab</span>
            </div>
          </div>
        </div>

        {/* Bottom fade border */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}88, ${accentColor}22, ${accentColor}88)` }} />
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT: SIDEBAR TABS + CONTENT PANEL (DARK THEME)
      ══════════════════════════════════════════════════════ */}
      <div className="flex gap-0 min-h-[600px] bg-slate-900 border-x border-b border-slate-800 rounded-b-3xl overflow-hidden shadow-2xl">

        {/* ── Sidebar Tab Navigation ── */}
        <div className="w-52 shrink-0 bg-slate-950/90 border-r border-slate-800 flex flex-col py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-3 px-4 py-3 mx-2 my-0.5 rounded-xl text-left text-xs font-black transition-all ${
                  isActive
                    ? 'text-white shadow-xl ring-1 ring-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                style={isActive ? {
                  background: isChoirAdmin
                    ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                    : `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                  boxShadow: `0 4px 14px ${accentColor}66`
                } : {}}
              >
                {isActive && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                }`}>
                  <tab.icon size={14} className="text-current" />
                </div>
                <span className="leading-tight tracking-wide">{tab.label}</span>
              </button>

            );
          })}

          {/* Sidebar footer */}
          <div className="mt-auto px-4 py-4 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Admin Panel</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{moduleMeta?.title || categoryId}</p>
          </div>
        </div>

        {/* ── Tab Content Area ── */}
        <div className="flex-1 overflow-hidden flex flex-col min-w-0 bg-slate-900">

          {/* ── Content Inner Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                style={{ background: `${accentColor}25`, color: '#38bdf8' }}
              >
                {(() => { const tab = tabs.find(t => t.id === activeTab); return tab ? <tab.icon size={16} /> : null; })()}
              </div>
              <div>
                <h2 className="text-sm font-black text-white leading-tight">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">{moduleMeta?.title || categoryId} · Administration Command Center</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(activeTab === 'activities' || activeTab === 'announcements' || activeTab === 'members') && (
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-2 border border-slate-700 rounded-xl text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500 bg-slate-800 w-36 md:w-48"
                  />
                </div>
              )}
              {activeTab === 'activities' || activeTab === 'announcements' ? (
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md"
                  style={{ background: accentColor }}
                >
                  <Plus size={14} /> Add {activeTab === 'activities' ? 'Activity' : 'Announcement'}
                </button>
              ) : activeTab === 'members' ? (
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md"
                  style={{ background: accentColor }}
                >
                  <Plus size={14} /> Add Member
                </button>
              ) : activeTab === 'schedules' ? (
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md"
                  style={{ background: accentColor }}
                >
                  <Plus size={14} /> Add Session
                </button>
              ) : activeTab === 'gallery' ? (
                <button
                  onClick={() => setGalleryModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md"
                  style={{ background: accentColor }}
                >
                  <Plus size={14} /> Add Photo
                </button>
              ) : activeTab === 'tshirts' ? (
                <button
                  onClick={() => setProductModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md"
                  style={{ background: accentColor }}
                >
                  <Plus size={14} /> Manage Product
                </button>
              ) : null}
            </div>
          </div>

          {/* ── Tab Content ── */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-900 text-slate-100">

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="space-y-5 max-w-2xl">
              <div
                className="rounded-2xl px-5 py-4 flex items-center gap-3 border"
                style={{ background: `${accentColor}10`, borderColor: `${accentColor}30` }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accentColor}20`, color: accentColor }}>
                  <FilePdf size={16} />
                </div>
                <p className="text-xs font-bold leading-relaxed" style={{ color: accentColor }}>
                  Manage the biography, image, and PDF history document displayed on the public About tab.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6 space-y-6 shadow-md">
                <div>
                  <label className="text-xs font-black text-slate-300 block mb-1.5 uppercase tracking-wide">Biography / Description</label>
                  <textarea
                    rows={8}
                    className="w-full border border-slate-700 bg-slate-900 px-4 py-3 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 resize-y"
                    style={{ '--tw-ring-color': `${accentColor}55` } as React.CSSProperties}
                    placeholder="Enter a biography or description for this community..."
                    value={aboutForm.biography}
                    onChange={(e) => setAboutForm(v => ({ ...v, biography: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-300 block mb-1.5 uppercase tracking-wide">Saint / Community Image URL</label>
                  <input
                    type="url"
                    className="w-full border border-slate-700 bg-slate-900 px-4 py-2.5 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': `${accentColor}55` } as React.CSSProperties}
                    placeholder="https://... (direct image link)"
                    value={aboutForm.saint_image_url}
                    onChange={(e) => setAboutForm(v => ({ ...v, saint_image_url: e.target.value }))}
                  />
                  {aboutForm.saint_image_url && (
                    <img src={aboutForm.saint_image_url} alt="Preview" className="mt-3 w-40 h-40 object-cover rounded-xl border-2 border-slate-700 shadow-md" />
                  )}
                </div>
                <div>
                  <label className="text-xs font-black text-slate-300 block mb-1.5 uppercase tracking-wide">History PDF URL</label>
                  <input
                    type="url"
                    className="w-full border border-slate-700 bg-slate-900 px-4 py-2.5 rounded-xl text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': `${accentColor}55` } as React.CSSProperties}
                    placeholder="https://... (link to PDF document)"
                    value={aboutForm.history_pdf_url}
                    onChange={(e) => setAboutForm(v => ({ ...v, history_pdf_url: e.target.value }))}
                  />
                  {aboutForm.history_pdf_url && (
                    <a href={aboutForm.history_pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 text-sm text-red-400 font-bold hover:underline">
                      <FilePdf size={16} /> Preview PDF
                    </a>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveAbout}
                  disabled={aboutSaving}
                  className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-60"
                  style={{ background: accentColor }}
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
                  <ImageIcon size={40} className="mx-auto text-slate-600 mb-3" />
                  <p className="font-bold text-slate-300">No community gallery photos yet</p>
                  <p className="text-xs text-slate-500 mt-1">Upload pictures to showcase your events and activities.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map(img => (
                    <div key={img.id} className="relative rounded-2xl overflow-hidden border border-slate-800 group bg-slate-800/80">
                      <img src={img.image_url} alt={img.event_name} className="w-full h-44 object-cover" />
                      <div className="p-3">
                        <p className="text-xs font-bold text-white truncate">{img.event_name}</p>
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
              <div className="flex gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setTshirtTab('products')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${tshirtTab === 'products' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  Merchandise Catalog ({products.length})
                </button>
                <button
                  onClick={() => setTshirtTab('orders')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${tshirtTab === 'orders' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  Customer Orders ({orders.length})
                </button>
              </div>

              {tshirtTab === 'products' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(prod => (
                    <div key={prod.id} className="border border-slate-800 rounded-2xl p-4 bg-slate-800/70 flex flex-col justify-between">
                      <div>
                        {prod.image_url ? (
                          <img src={prod.image_url} alt={prod.name} className="w-full h-40 object-cover rounded-xl mb-3" />
                        ) : (
                          <div className="w-full h-40 bg-slate-700/60 rounded-xl flex items-center justify-center text-slate-400 mb-3">
                            <ShoppingBag size={32} />
                          </div>
                        )}
                        <h4 className="font-black text-white">{prod.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{prod.description || 'Community attire'}</p>
                        <p className="text-base font-black text-sky-400 mt-2">KES {prod.price.toLocaleString()}</p>
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
                        className="mt-4 w-full py-2 bg-slate-700/80 border border-slate-600 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-600 transition"
                      >
                        Edit Product Details
                      </button>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-slate-400 font-bold text-sm">No products listed for this community yet.</p>
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
                      <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400">
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
                        <tr key={order.id} className="border-b border-slate-800 hover:bg-slate-800/50 text-xs text-slate-200">
                          <td className="py-3 px-3 font-bold text-white">{order.recipient_name}</td>
                          <td className="py-3 px-3 text-slate-400">{order.phone}</td>
                          <td className="py-3 px-3 text-slate-300 font-medium">Size {order.size} (Qty: {order.quantity})</td>
                          <td className="py-3 px-3 font-bold text-emerald-400">KES {order.total_amount?.toLocaleString()}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              order.status === 'delivered' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              order.status === 'shipped' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                              order.status === 'processing' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="text-[11px] p-1.5 border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none"
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
                    <p className="text-center py-10 text-slate-500 text-xs font-semibold">No orders recorded for this community.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SUGGESTIONS TAB */}
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 font-medium">
                Review constructive ideas and feedback submitted by members for {moduleMeta?.title || categoryId}.
              </p>
              {suggestions.length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare size={36} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-slate-300 font-bold text-sm">No suggestions submitted yet</p>
                  <p className="text-slate-500 text-xs mt-0.5">Suggestions from the community page will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map(s => (
                    <div key={s.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-800/70 hover:bg-slate-800 transition">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.name ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-slate-700 text-slate-300'}`}>
                            {s.name ? s.name : 'Anonymous Member'}
                          </span>
                          {s.category && (
                            <span className="text-[11px] text-slate-400 font-medium bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                              #{s.category}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 leading-relaxed whitespace-pre-wrap">{s.suggestion}</p>
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
                <PageLoader message="Synchronizing table data" />
              ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-500">
                    {activeTab === 'activities' && <Calendar size={32} />}
                    {activeTab === 'announcements' && <Megaphone size={32} />}
                    {activeTab === 'members' && <Users size={32} />}
                  </div>
                  <h4 className="text-slate-300 font-bold italic">No records found</h4>
                  <p className="text-slate-500 text-sm mt-1">Click the "Add" button to populate this section.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {activeTab === 'members' ? (
                    <>
                      {/* Choir specific filter bar in admin */}
                      {categoryId === 'choir' && (
                        <div className="flex flex-wrap items-center gap-3 p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 mb-4">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-300">Filter Choir:</span>
                          <select
                            value={choirVoiceFilter}
                            onChange={(e: any) => setChoirVoiceFilter(e.target.value)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                          >
                            <option value="all">All Voices (S-A-T-B)</option>
                            <option value="soprano">Soprano</option>
                            <option value="alto">Alto</option>
                            <option value="tenor">Tenor</option>
                            <option value="bass">Bass</option>
                          </select>

                          <select
                            value={choirGenderFilter}
                            onChange={(e: any) => setChoirGenderFilter(e.target.value)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                          >
                            <option value="all">All Members (Gents & Ladies)</option>
                            <option value="male">Gents (Male)</option>
                            <option value="female">Ladies (Female)</option>
                          </select>
                        </div>
                      )}

                      {enrollmentStats && (
                        <div className="grid grid-cols-4 gap-4 mb-6">
                          {[
                            { label: 'Total', value: enrollmentStats.total, color: 'blue' },
                            { label: 'Approved', value: enrollmentStats.approved, color: 'emerald' },
                            { label: 'Pending', value: enrollmentStats.pending, color: 'amber' },
                            { label: 'Rejected', value: enrollmentStats.rejected, color: 'rose' },
                          ].map((stat) => (
                            <div key={stat.label} className="rounded-xl p-3 text-center bg-slate-800/80 border border-slate-700">
                              <p className="text-xl font-black text-white">{stat.value}</p>
                              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Full Name</th>
                            {['charismatic', 'dancers', 'youth', 'st-francis'].includes(categoryId || '') ? (
                              <>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Phone</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Email</th>
                              </>
                            ) : (
                              <>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Voice Section</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Gender</th>
                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Skill Level</th>
                              </>
                            )}
                            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.filter(m => {
                            const name = (m.fullName || m.full_name || '').toLowerCase();
                            const matchesSearch = name.includes(searchTerm.toLowerCase());
                            if (!matchesSearch) return false;

                            if (categoryId === 'choir') {
                              const v = (m.voice_type || m.voiceType || m.voice || '').toLowerCase();
                              if (choirVoiceFilter !== 'all' && !v.includes(choirVoiceFilter)) return false;
                              const g = (m.gender || '').toLowerCase();
                              if (choirGenderFilter === 'male' && !(g.includes('male') || g.includes('gent') || v.includes('tenor') || v.includes('bass'))) return false;
                              if (choirGenderFilter === 'female' && !(g.includes('female') || g.includes('lady') || v.includes('soprano') || v.includes('alto'))) return false;
                            }
                            return true;
                          }).map((member) => (
                            <tr key={member.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors text-slate-200">
                              <td className="py-4 px-4 font-bold text-white">{member.fullName || member.full_name}</td>
                              {['charismatic', 'dancers', 'youth', 'st-francis'].includes(categoryId || '') ? (
                                <>
                                  <td className="py-4 px-4 text-sm text-slate-400">{member.phoneNumber || member.phone || 'N/A'}</td>
                                  <td className="py-4 px-4 text-sm text-slate-400">{member.email || 'N/A'}</td>
                                </>
                              ) : (
                                <>
                                  <td className="py-4 px-4 text-sm font-bold">
                                    <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${
                                      (member.voice_type || '').toLowerCase().includes('soprano') ? 'bg-pink-950 text-pink-300 border border-pink-800' :
                                      (member.voice_type || '').toLowerCase().includes('alto') ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                      (member.voice_type || '').toLowerCase().includes('tenor') ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                                      (member.voice_type || '').toLowerCase().includes('bass') ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-slate-800 text-slate-300'
                                    }`}>
                                      {member.voice_type || 'General'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-sm text-slate-300 capitalize">{member.gender || 'N/A'}</td>
                                  <td className="py-4 px-4 text-sm text-slate-300 capitalize">{member.music_level || 'Beginner'}</td>
                                </>
                              )}
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                                  member.status === 'Pending' ? 'bg-amber-950 text-amber-300 border border-amber-800' : member.status === 'Approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                                }`}>
                                  {member.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {member.status !== 'Approved' && (
                                    <button onClick={async (e) => { e.stopPropagation(); try { await updateTableRecord('enrollments', member.id, { status: 'Approved' }); showToast('Member approved'); await loadCategoryData(); } catch { alert('Approve failed'); } }} className="p-2 text-emerald-400 hover:bg-emerald-950 rounded-lg transition" title="Approve">
                                      <CheckCircle size={18} />
                                    </button>
                                  )}
                                  {member.status !== 'Rejected' && (
                                    <button onClick={async (e) => { e.stopPropagation(); try { await updateTableRecord('enrollments', member.id, { status: 'Rejected' }); showToast('Member rejected'); await loadCategoryData(); } catch { alert('Reject failed'); } }} className="p-2 text-rose-400 hover:bg-rose-950 rounded-lg transition" title="Reject">
                                      <XCircle size={18} />
                                    </button>
                                  )}
                                  <button onClick={(e) => { e.stopPropagation(); handleDelete(member.id); }} className="p-2 text-rose-400 hover:bg-rose-950 rounded-lg transition" title="Delete">
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : activeTab === 'schedules' ? (
                    <div className="space-y-4">
                      {data.map((item) => (
                        <div key={item.id} onClick={() => openEditModal(item)} className="p-5 border border-slate-800 bg-slate-800/60 rounded-2xl hover:border-purple-500 hover:bg-slate-800 transition-all flex items-start justify-between gap-4 group cursor-pointer text-white">
                          <div className="flex gap-4">
                            <div className="p-3 rounded-xl shrink-0 bg-purple-950 text-purple-300 border border-purple-800">
                              <Clock size={20} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-lg uppercase tracking-tight">{item.day}</h4>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800">
                                  {item.start_time} – {item.end_time || item.start_time}
                                </span>
                              </div>
                              <p className="text-slate-300 text-sm mt-1 leading-relaxed font-medium">
                                Venue: <strong className="text-white">{item.location}</strong>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); openEditModal(item); }} className="p-2 text-slate-400 hover:text-blue-400 rounded-lg"><Edit2 size={18} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 text-slate-400 hover:text-rose-400 rounded-lg"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.map((item) => (
                        <div key={item.id} onClick={() => openEditModal(item)} className="p-5 border border-slate-800 bg-slate-800/60 rounded-2xl hover:border-blue-500 hover:bg-slate-800 transition-all flex items-start justify-between gap-4 group cursor-pointer text-white">
                          <div className="flex gap-4">
                            <div className={`p-3 rounded-xl shrink-0 ${activeTab === 'activities' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-blue-950 text-blue-300 border border-blue-800'}`}>
                              {activeTab === 'activities' ? <Calendar size={20} /> : <Megaphone size={20} />}
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-lg uppercase tracking-tight">{item.title}</h4>
                              <p className="text-slate-300 text-sm mt-1 leading-relaxed">{item.description || item.content}</p>
                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                  <Clock size={14} /> {item.activity_date || item.announcement_date ? new Date(item.activity_date || item.announcement_date).toLocaleDateString() : 'N/A'}
                                </div>
                                {item.location && (
                                  <div className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded text-[9px] font-black uppercase tracking-widest">{item.location}</div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); openEditModal(item); }} className="p-2 text-slate-400 hover:text-blue-400 rounded-lg"><Edit2 size={18} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 text-slate-400 hover:text-rose-400 rounded-lg"><Trash2 size={18} /></button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4">{editingItem ? 'Edit' : 'Add'} {activeTab === 'activities' ? 'Activity' : activeTab === 'announcements' ? 'Announcement' : activeTab === 'schedules' ? 'Practice Schedule' : 'Member'}</h3>
            <div className="space-y-3">
              {activeTab === 'schedules' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-bold text-slate-300">Day of Week *</label>
                      <select value={formValues.day || (isStFrancisAdmin ? 'Sunday' : isDancersAdmin ? 'Saturday' : isCharismaticAdmin ? 'Thursday' : 'Tuesday')} onChange={(e) => setFormValues(v => ({ ...v, day: e.target.value }))} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-300">{isStFrancisAdmin ? 'Venue / Meeting Point *' : 'Venue / Room *'}</label>
                      <input value={formValues.location || ''} onChange={(e) => setFormValues(v => ({ ...v, location: e.target.value }))} placeholder={isStFrancisAdmin ? 'e.g. LH 21 / Neighborhood Block' : 'e.g. School Compound / Main Hall'} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1 placeholder:text-slate-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-bold text-slate-300">Start Time *</label>
                      <input type="text" value={formValues.start_time || ''} onChange={(e) => setFormValues(v => ({ ...v, start_time: e.target.value }))} placeholder={isStFrancisAdmin ? 'e.g. 17:00 or 5:00 PM' : 'e.g. 16:00 or 4:00 PM'} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1 placeholder:text-slate-500" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-300">End Time</label>
                      <input type="text" value={formValues.end_time || ''} onChange={(e) => setFormValues(v => ({ ...v, end_time: e.target.value }))} placeholder="e.g. 18:30 or 6:30 PM" className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1 placeholder:text-slate-500" />
                    </div>
                  </div>
                  {isStFrancisAdmin && (
                    <div>
                      <label className="text-sm font-bold text-slate-300">Session Type / Focus</label>
                      <select value={formValues.targetSection || ''} onChange={(e) => setFormValues(v => ({ ...v, targetSection: e.target.value }))} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1">
                        <option value="">Select session focus...</option>
                        <option value="Community Fellowship & SCC Prayer">Community Fellowship & SCC Prayer</option>
                        <option value="Laudato Si' Eco-Care & Tree Planting">Laudato Si' Eco-Care & Tree Planting</option>
                        <option value="Charity Drive & Food Basket Distribution">Charity Drive & Food Basket Distribution</option>
                        <option value="Hospital & Elderly Visitation Ministry">Hospital & Elderly Visitation Ministry</option>
                        <option value="Member Welfare & Emergency Fund Meeting">Member Welfare & Emergency Fund Meeting</option>
                        <option value="Neighborhood Jumuiya Block Prayer">Neighborhood Jumuiya Block Prayer</option>
                      </select>
                    </div>
                  )}
                  {isMentorshipAdmin && (
                    <div>
                      <label className="text-sm font-bold text-slate-300">Mentorship Track / Focus</label>
                      <select value={formValues.targetSection || ''} onChange={(e) => setFormValues(v => ({ ...v, targetSection: e.target.value }))} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1">
                        <option value="">Select mentorship track...</option>
                        <option value="Group Cohort Sessions & Life Skills">Group Cohort Sessions & Life Skills</option>
                        <option value="Career Workshops, Mock Interviews & Seminars">Career Workshops, Mock Interviews & Seminars</option>
                        <option value="One-on-One Mentor Check-ins & Academic Coaching">One-on-One Mentor Check-ins & Academic Coaching</option>
                        <option value="Spiritual Formation & Vocation Discernment">Spiritual Formation & Vocation Discernment</option>
                        <option value="Personal Finance & Leadership Masterclass">Personal Finance & Leadership Masterclass</option>
                      </select>
                    </div>
                  )}
                </>
              )}
              {(activeTab === 'activities' || activeTab === 'announcements') && (
                <>
                  <div>
                    <label className="text-sm font-bold text-slate-300">Title</label>
                    <input value={formValues.title || ''} onChange={(e) => setFormValues(v => ({ ...v, title: e.target.value }))} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-300">Description / Content</label>
                    <textarea value={formValues.description || formValues.content || ''} onChange={(e) => setFormValues(v => ({ ...v, description: e.target.value, content: e.target.value }))} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1" rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-bold text-slate-300">Venue / Location</label>
                      <input value={formValues.location || ''} onChange={(e) => setFormValues(v => ({ ...v, location: e.target.value }))} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-300">Date</label>
                      <input type="date" value={formValues.activity_date?.slice?.(0, 10) || formValues.announcement_date?.slice?.(0, 10) || ''} onChange={(e) => setFormValues(v => ({ ...v, activity_date: e.target.value, announcement_date: e.target.value }))} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'members' && (
                <>
                  <div>
                    <label className="text-sm font-bold text-slate-300">Full name</label>
                    <input value={formValues.full_name || formValues.fullName || ''} onChange={(e) => setFormValues(v => ({ ...v, full_name: e.target.value }))} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1" />
                  </div>
                  {['charismatic', 'dancers', 'youth'].includes(categoryId || '') ? (
                    <>
                      <div>
                        <label className="text-sm font-bold text-slate-300">Phone Number</label>
                        <input value={formValues.phone || formValues.phoneNumber || ''} onChange={(e) => setFormValues(v => ({ ...v, phone: e.target.value }))} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1" placeholder="e.g. 0712345678" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-300">Email Address (optional)</label>
                        <input type="email" value={formValues.email || ''} onChange={(e) => setFormValues(v => ({ ...v, email: e.target.value }))} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1" placeholder="e.g. email@example.com" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-bold text-slate-300">Voice Section (SATB)</label>
                          <select value={formValues.voice_type || ''} onChange={(e) => setFormValues(v => ({ ...v, voice_type: e.target.value }))} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1">
                            <option value="">Select Voice...</option>
                            <option value="Soprano">Soprano (High Female)</option>
                            <option value="Alto">Alto (Low Female)</option>
                            <option value="Tenor">Tenor (High Male)</option>
                            <option value="Bass">Bass (Deep Male)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-300">Gender (Gent / Lady)</label>
                          <select value={formValues.gender || ''} onChange={(e) => setFormValues(v => ({ ...v, gender: e.target.value }))} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1">
                            <option value="">Select Gender...</option>
                            <option value="Male">Gent (Male)</option>
                            <option value="Female">Lady (Female)</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="text-sm font-bold text-slate-300">Phone Number</label>
                          <input value={formValues.phone || formValues.phoneNumber || ''} onChange={(e) => setFormValues(v => ({ ...v, phone: e.target.value }))} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1" placeholder="e.g. 0712345678" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-300">Music Skill Level</label>
                          <select value={formValues.music_level || 'Beginner'} onChange={(e) => setFormValues(v => ({ ...v, music_level: e.target.value }))} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1">
                            <option value="Beginner">Beginner (Solfa Learner)</option>
                            <option value="Intermediate">Intermediate (Sight-reader)</option>
                            <option value="Advanced">Advanced (Soloist / Trainer)</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-sm font-bold text-slate-300">Status</label>
                    <select value={formValues.status || 'Pending'} onChange={(e) => setFormValues(v => ({ ...v, status: e.target.value }))} className="w-full border border-slate-700 bg-slate-800 text-white px-3 py-2 rounded-xl mt-1">
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-bold text-slate-300">Attachment / Image (optional)</label>
                <input type="file" onChange={handleFileChange} className="w-full mt-1 text-slate-300" />
                {formValues.image_url && <img src={formValues.image_url} alt="preview" className="w-32 h-20 object-cover mt-2 rounded-xl border border-slate-700" />}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button onClick={closeModal} className="px-4 py-2 rounded-xl bg-slate-800 font-bold text-xs text-slate-300 hover:bg-slate-700 transition">Cancel</button>
                <button
                  disabled={uploading}
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl text-white font-bold text-xs transition-all shadow-md disabled:opacity-60"
                  style={{ background: accentColor }}
                >
                  {uploading ? 'Uploading...' : (editingItem ? 'Save Changes' : 'Create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Gallery Add */}
      {galleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-white">Add Photo to Gallery</h3>
                <p className="text-xs text-slate-400 font-medium">{moduleMeta?.title || categoryId} • Community Gallery</p>
              </div>
              <button onClick={() => setGalleryModal(false)} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition text-slate-300"><X size={14} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">Event / Caption Name</label>
                <input
                  type="text"
                  placeholder="e.g. Easter Choir Rehearsal"
                  value={newImageForm.event_name}
                  onChange={(e) => setNewImageForm(v => ({ ...v, event_name: e.target.value }))}
                  className="w-full border border-slate-700 bg-slate-800 text-white p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-slate-500 placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300">Category Tag (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Concerts, Sunday Mass"
                  value={newImageForm.category}
                  onChange={(e) => setNewImageForm(v => ({ ...v, category: e.target.value }))}
                  className="w-full border border-slate-700 bg-slate-800 text-white p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-slate-500 placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300">Direct Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newImageForm.image_url}
                  onChange={(e) => setNewImageForm(v => ({ ...v, image_url: e.target.value }))}
                  className="w-full border border-slate-700 bg-slate-800 text-white p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-slate-500 placeholder:text-slate-500"
                />
              </div>
              {newImageForm.image_url && (
                <img src={newImageForm.image_url} alt="preview" className="w-full h-36 object-cover rounded-xl border border-slate-700 mt-2" />
              )}
              <div className="flex justify-end gap-2 pt-3">
                <button onClick={() => setGalleryModal(false)} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-700 transition">Cancel</button>
                <button onClick={handleAddGalleryImage} className="px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md transition" style={{ background: accentColor }}>Upload Photo</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for T-Shirt Product */}
      {productModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-white">Manage Merchandise</h3>
                <p className="text-xs text-slate-400 font-medium">{moduleMeta?.title || categoryId} • Attire & Orders</p>
              </div>
              <button onClick={() => setProductModal(false)} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition text-slate-300"><X size={14} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Official Choir Polo T-Shirt"
                  value={productForm.name}
                  onChange={(e) => setProductForm(v => ({ ...v, name: e.target.value }))}
                  className="w-full border border-slate-700 bg-slate-800 text-white p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-slate-500 placeholder:text-slate-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Price (KES)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm(v => ({ ...v, price: Number(e.target.value) }))}
                    className="w-full border border-slate-700 bg-slate-800 text-white p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Sizes (comma separated)</label>
                  <input
                    type="text"
                    value={productForm.sizes}
                    onChange={(e) => setProductForm(v => ({ ...v, sizes: e.target.value }))}
                    className="w-full border border-slate-700 bg-slate-800 text-white p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={productForm.image_url}
                  onChange={(e) => setProductForm(v => ({ ...v, image_url: e.target.value }))}
                  className="w-full border border-slate-700 bg-slate-800 text-white p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-slate-500 placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm(v => ({ ...v, description: e.target.value }))}
                  className="w-full border border-slate-700 bg-slate-800 text-white p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-slate-500 placeholder:text-slate-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button onClick={() => setProductModal(false)} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-700 transition">Cancel</button>
                <button onClick={handleSaveProduct} className="px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md transition" style={{ background: accentColor }}>Save Product</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  </div>
  );
}
