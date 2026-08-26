import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient, createTableRecord, updateTableRecord, deleteTableRecord, uploadFile } from '../../../api/axiosInstance';
import { useAuth } from '../../../context/AuthContext';
import { normalizeRoles, getAllowedCommunityModules } from '../../../utils/adminAccess';
import { ArtDeco404 } from '../components/ArtDeco404';
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
  CheckCircle2,
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
  X,
  Music,
  Shirt,
  PackageCheck,
  DollarSign,
  Copy,
  Printer,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import PageLoader from '../../../assets/Layouts/PageLoader';

type TabType = 'about' | 'activities' | 'announcements' | 'schedules' | 'members' | 'music-class' | 'gallery' | 'tshirts' | 'suggestions';

interface GalleryItem {
  id: number;
  image_url: string;
  event_name: string;
  category?: string;
}

interface ProductItem {
  id: number;
  module_id?: string;
  name: string;
  price: number;
  sizes?: string[] | string;
  image_url?: string;
  description?: string;
  collection_date?: string;
  is_active?: boolean;
}

interface OrderItem {
  id: number;
  module_id?: string;
  product_id?: number;
  product_name?: string;
  member_id?: string;
  recipient_name: string;
  phone: string;
  size: string;
  quantity: number;
  total_amount: number;
  status: string;
  payment_ref?: string;
  mpesa_code?: string;
  rejection_reason?: string;
  confirmed_at?: string;
  confirmed_by?: string;
  completed_at?: string;
  completed_by?: string;
  cancelled_at?: string;
  cancelled_by?: string;
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
  const { user } = useAuth();
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
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, totalRevenue: 0 });
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [productModal, setProductModal] = useState(false);
  const [productForm, setProductForm] = useState<{ id?: number; name: string; price: number | string; sizes: string; description: string; image_url: string; collection_date: string }>({
    name: '',
    price: 1200,
    sizes: 'S, M, L, XL, XXL',
    description: '',
    image_url: '',
    collection_date: ''
  });
  const [cancelOrderModal, setCancelOrderModal] = useState<OrderItem | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderItem | null>(null);
  const [orderRejectionReason, setOrderRejectionReason] = useState('');
  const [orderActionLoading, setOrderActionLoading] = useState<number | null>(null);

  // Community-specific Suggestions state
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  // Choir music-class opt-ins (name + phone only)
  const [musicSignups, setMusicSignups] = useState<{ full_name: string; phone: string }[]>([]);

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
          
          const params: Record<string, string> = {};
          if (orderStatusFilter && orderStatusFilter !== 'all') params.status = orderStatusFilter;
          if (orderSearch?.trim()) params.search = orderSearch.trim();

          const ordRes = await apiClient.get(`/community-tshirts/${categoryId}/admin/orders`, { params }).catch(() => {
            return apiClient.get(`/community-tshirts/${categoryId}/orders`);
          });

          if (ordRes.data?.data && Array.isArray(ordRes.data.data)) {
            setOrders(ordRes.data.data);
            if (ordRes.data.stats) setOrderStats(ordRes.data.stats);
          } else {
            const rawOrders = Array.isArray(ordRes.data) ? ordRes.data : [];
            setOrders(rawOrders);
            setOrderStats({
              total: rawOrders.length,
              pending: rawOrders.filter((o: any) => o.status === 'pending' || o.status === 'pending_confirmation').length,
              confirmed: rawOrders.filter((o: any) => o.status === 'confirmed').length,
              completed: rawOrders.filter((o: any) => o.status === 'completed' || o.status === 'delivered').length,
              cancelled: rawOrders.filter((o: any) => o.status === 'cancelled').length,
              totalRevenue: rawOrders.reduce((sum: number, o: any) => (['confirmed', 'completed', 'delivered'].includes(o.status) ? sum + (Number(o.total_amount) || 0) : sum), 0)
            });
          }
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

      // Choir music-class opt-ins (name + phone only)
      if (activeTab === 'music-class') {
        try {
          const res = await apiClient.get(`/community-enrollment/${categoryId}/music-class`);
          setMusicSignups(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (e) {
          console.error('Failed to load music class signups', e);
          setMusicSignups([]);
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

      const payload = {
        name: productForm.name,
        price: Number(productForm.price),
        sizes: sizesArray,
        description: productForm.description,
        image_url: productForm.image_url,
        collection_date: productForm.collection_date || null
      };

      if (productForm.id) {
        await apiClient.put(`/community-tshirts/${categoryId}/products/${productForm.id}`, payload);
        showToast('Product updated successfully!');
      } else {
        await apiClient.post(`/community-tshirts/${categoryId}/products`, payload);
        showToast('Product created successfully!');
      }

      setProductModal(false);
      setProductForm({ name: '', price: 1200, sizes: 'S, M, L, XL, XXL', description: '', image_url: '', collection_date: '' });
      await loadCategoryData();
    } catch (e) {
      alert('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to remove this product from the catalog?')) return;
    try {
      await apiClient.delete(`/community-tshirts/${categoryId}/products/${id}`);
      showToast('Product removed');
      await loadCategoryData();
    } catch (e) {
      alert('Failed to delete product');
    }
  };

  const handleConfirmCommunityOrder = async (orderId: number) => {
    setOrderActionLoading(orderId);
    try {
      await apiClient.patch(`/community-tshirts/orders/${orderId}/confirm`);
      showToast(`Order #${orderId} confirmed!`);
      await loadCategoryData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to confirm order');
    } finally {
      setOrderActionLoading(null);
    }
  };

  const handleCompleteCommunityOrder = async (orderId: number) => {
    setOrderActionLoading(orderId);
    try {
      await apiClient.patch(`/community-tshirts/orders/${orderId}/complete`);
      showToast(`Order #${orderId} marked as delivered!`);
      await loadCategoryData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to complete order');
    } finally {
      setOrderActionLoading(null);
    }
  };

  const handleCancelCommunityOrder = async () => {
    if (!cancelOrderModal) return;
    setOrderActionLoading(cancelOrderModal.id);
    try {
      await apiClient.patch(`/community-tshirts/orders/${cancelOrderModal.id}/cancel`, {
        reason: orderRejectionReason
      });
      showToast(`Order #${cancelOrderModal.id} cancelled`);
      setCancelOrderModal(null);
      setOrderRejectionReason('');
      await loadCategoryData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setOrderActionLoading(null);
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
      { id: 'members', label: isMentorshipAdmin ? 'Enrolled Mentees & Mentors' : 'Join Requests', icon: Users },
      ...(isChoirAdmin ? [{ id: 'music-class' as TabType, label: 'Music Class', icon: Music }] : []),
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

  // ── Role-based module guard: group officials may only open their own community ──
  const allowedModules = getAllowedCommunityModules(normalizeRoles(user?.role));
  if (allowedModules !== null && !allowedModules.includes(categoryId || '')) {
    return <ArtDeco404 />;
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
          MAIN CONTENT: RESPONSIVE TABS + CONTENT PANEL (LIGHT THEME)
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row gap-0 min-h-[600px] bg-white border border-slate-200/90 rounded-b-3xl overflow-hidden shadow-xl">

        {/* ── Sidebar / Mobile Horizontal Tab Navigation ── */}
        <div className="w-full lg:w-56 shrink-0 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible py-2 px-2 lg:px-0 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-2.5 px-3.5 lg:px-4 py-2.5 lg:py-3 lg:mx-2 my-0.5 rounded-xl text-left text-xs font-black transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-white shadow-md ring-1 ring-blue-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
                style={isActive ? {
                  background: isChoirAdmin
                    ? 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)'
                    : `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                  boxShadow: `0 4px 14px ${accentColor}44`
                } : {}}
              >
                {isActive && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white animate-pulse hidden lg:block" />
                )}
                <div className={`w-6 h-6 lg:w-7 lg:h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-200/80 text-slate-600 group-hover:text-slate-900 group-hover:bg-slate-300/80'
                }`}>
                  <tab.icon size={13} className="text-current" />
                </div>
                <span className="leading-tight tracking-wide">{tab.label}</span>
                {tab.id === 'members' && Number(enrollmentStats?.pending || 0) > 0 && (
                  <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black">
                    {enrollmentStats.pending}
                  </span>
                )}
              </button>
            );
          })}

          {/* Sidebar footer (desktop only) */}
          <div className="hidden lg:block mt-auto px-4 py-4 border-t border-slate-200">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Admin Panel</p>
            <p className="text-[10px] text-slate-600 font-bold mt-0.5">{moduleMeta?.title || categoryId}</p>
          </div>
        </div>

        {/* ── Tab Content Area ── */}
        <div className="flex-1 overflow-hidden flex flex-col min-w-0 bg-white">

          {/* ── Content Inner Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
                style={{ background: `${accentColor}15`, color: accentColor }}
              >
                {(() => { const tab = tabs.find(t => t.id === activeTab); return tab ? <tab.icon size={16} /> : null; })()}
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 leading-tight">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-[11px] text-slate-500 font-bold">{moduleMeta?.title || categoryId} · Administration Command Center</p>
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
                    className="pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 bg-slate-50 w-36 md:w-48"
                  />
                </div>
              )}
              {activeTab === 'activities' || activeTab === 'announcements' ? (
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                  style={{ background: accentColor }}
                >
                  <Plus size={14} /> Add {activeTab === 'activities' ? 'Activity' : 'Announcement'}
                </button>
              ) : activeTab === 'members' ? (
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                  style={{ background: accentColor }}
                >
                  <Plus size={14} /> Add Member
                </button>
              ) : activeTab === 'schedules' ? (
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                  style={{ background: accentColor }}
                >
                  <Plus size={14} /> Add Session
                </button>
              ) : activeTab === 'gallery' ? (
                <button
                  onClick={() => setGalleryModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                  style={{ background: accentColor }}
                >
                  <Plus size={14} /> Add Photo
                </button>
              ) : activeTab === 'tshirts' ? (
                <button
                  onClick={() => setProductModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                  style={{ background: accentColor }}
                >
                  <Plus size={14} /> Manage Product
                </button>
              ) : null}
            </div>
          </div>

          {/* ── Tab Content ── */}
          <div className="flex-1 overflow-y-auto p-6 bg-white text-slate-800">


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

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 space-y-6 shadow-sm">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5 uppercase tracking-wide">Biography / Description</label>
                  <textarea
                    rows={8}
                    className="w-full border border-slate-200 bg-white px-4 py-3 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 resize-y shadow-xs"
                    style={{ '--tw-ring-color': `${accentColor}55` } as React.CSSProperties}
                    placeholder="Enter a biography or description for this community..."
                    value={aboutForm.biography}
                    onChange={(e) => setAboutForm(v => ({ ...v, biography: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5 uppercase tracking-wide">Saint / Community Image URL</label>
                  <input
                    type="url"
                    className="w-full border border-slate-200 bg-white px-4 py-2.5 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 shadow-xs"
                    style={{ '--tw-ring-color': `${accentColor}55` } as React.CSSProperties}
                    placeholder="https://... (direct image link)"
                    value={aboutForm.saint_image_url}
                    onChange={(e) => setAboutForm(v => ({ ...v, saint_image_url: e.target.value }))}
                  />
                  {aboutForm.saint_image_url && (
                    <img src={aboutForm.saint_image_url} alt="Preview" className="mt-3 w-40 h-40 object-cover rounded-xl border-2 border-slate-200 shadow-md" />
                  )}
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5 uppercase tracking-wide">History PDF URL</label>
                  <input
                    type="url"
                    className="w-full border border-slate-200 bg-white px-4 py-2.5 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 shadow-xs"
                    style={{ '--tw-ring-color': `${accentColor}55` } as React.CSSProperties}
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
              {/* Sub-nav Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex gap-2">
                  <button
                    onClick={() => setTshirtTab('products')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                      tshirtTab === 'products'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Shirt size={14} /> Merchandise Catalog ({products.length})
                  </button>
                  <button
                    onClick={() => setTshirtTab('orders')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                      tshirtTab === 'orders'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ShoppingBag size={14} /> Member Orders ({orders.length})
                  </button>
                </div>

                {tshirtTab === 'products' && (
                  <button
                    onClick={() => {
                      setProductForm({
                        name: '',
                        price: 1200,
                        sizes: 'S, M, L, XL, XXL',
                        description: '',
                        image_url: '',
                        collection_date: ''
                      });
                      setProductModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                    style={{ background: accentColor }}
                  >
                    <Plus size={14} /> Add Product
                  </button>
                )}
              </div>

              {tshirtTab === 'products' ? (
                /* ── Product Catalog ── */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(prod => (
                    <div key={prod.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                      <div>
                        {prod.image_url ? (
                          <div className="relative rounded-2xl overflow-hidden mb-4 border border-slate-100 bg-slate-50">
                            <img src={prod.image_url} alt={prod.name} className="w-full h-48 object-cover group-hover:scale-102 transition-transform duration-300" />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-indigo-700 shadow-xs">
                              Sample
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-indigo-50/60 to-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 mb-4 border border-slate-100">
                            <Shirt size={36} className="text-slate-300 mb-2" />
                            <span className="text-[11px] font-bold text-slate-400">No Image Preview Set</span>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-black text-slate-900 text-base">{prod.name}</h4>
                          <span className="text-sm font-black text-indigo-700 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-100 whitespace-nowrap">
                            KES {prod.price.toLocaleString()}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {prod.description || 'Official community uniform / ministry attire.'}
                        </p>

                        {/* Sizes */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Sizes:</span>
                          {(Array.isArray(prod.sizes) ? prod.sizes : (prod.sizes || 'S, M, L, XL, XXL').split(',')).map((s: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black uppercase border border-slate-200/60">
                              {s.trim()}
                            </span>
                          ))}
                        </div>

                        {/* Collection Date */}
                        {prod.collection_date && (
                          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 text-xs font-bold">
                            <Calendar size={13} className="text-amber-600 shrink-0" />
                            <span>Collection: {new Date(prod.collection_date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setProductForm({
                              id: prod.id,
                              name: prod.name,
                              price: prod.price,
                              sizes: Array.isArray(prod.sizes) ? prod.sizes.join(', ') : (prod.sizes || 'S, M, L, XL, XXL'),
                              description: prod.description || '',
                              image_url: prod.image_url || '',
                              collection_date: prod.collection_date ? prod.collection_date.split('T')[0] : ''
                            });
                            setProductModal(true);
                          }}
                          className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit2 size={13} /> Edit Details
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {products.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-slate-50/70 rounded-3xl border border-slate-200">
                      <Shirt size={40} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-700 font-bold text-sm">No merchandise products configured yet.</p>
                      <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">Add your community's official T-shirt or polo so members can order it from their dashboard.</p>
                      <button
                        onClick={() => {
                          setProductForm({
                            name: `${moduleMeta?.title || 'Community'} Official T-Shirt`,
                            price: 1200,
                            sizes: 'S, M, L, XL, XXL',
                            description: '',
                            image_url: '',
                            collection_date: ''
                          });
                          setProductModal(true);
                        }}
                        className="mt-4 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition shadow-md cursor-pointer"
                      >
                        Add First Product
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Orders Board ── */
                <div className="space-y-4">
                  {/* Order KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-black uppercase text-slate-400">Total Orders</span>
                      <p className="text-xl font-black text-slate-900 mt-1">{orderStats.total}</p>
                    </div>
                    <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200">
                      <span className="text-[10px] font-black uppercase text-amber-700">Pending Review</span>
                      <p className="text-xl font-black text-amber-700 mt-1">{orderStats.pending}</p>
                    </div>
                    <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200">
                      <span className="text-[10px] font-black uppercase text-blue-700">Confirmed</span>
                      <p className="text-xl font-black text-blue-700 mt-1">{orderStats.confirmed}</p>
                    </div>
                    <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200">
                      <span className="text-[10px] font-black uppercase text-emerald-700">Delivered</span>
                      <p className="text-xl font-black text-emerald-700 mt-1">{orderStats.completed}</p>
                    </div>
                  </div>

                  {/* Filter tabs & Search */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'pending', label: 'Pending' },
                        { id: 'confirmed', label: 'Confirmed' },
                        { id: 'completed', label: 'Delivered' },
                        { id: 'cancelled', label: 'Cancelled' },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setOrderStatusFilter(tab.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                            orderStatusFilter === tab.id
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full sm:w-56">
                      <input
                        type="text"
                        placeholder="Search orders..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 bg-white focus:outline-none focus:border-blue-500"
                      />
                      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr className="text-[10px] font-black uppercase tracking-wider">
                          <th className="py-3 px-4">Ref / Date</th>
                          <th className="py-3 px-4">Recipient</th>
                          <th className="py-3 px-4">Phone / M-Pesa</th>
                          <th className="py-3 px-4">Size &amp; Qty</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {orders.map(order => {
                          const isPending = order.status === 'pending' || order.status === 'pending_confirmation';
                          const isConfirmed = order.status === 'confirmed';
                          const isDelivered = order.status === 'completed' || order.status === 'delivered';
                          const isCancelled = order.status === 'cancelled';

                          return (
                            <tr key={order.id} className="hover:bg-slate-50/70 transition-colors font-medium">
                              <td className="py-3 px-4">
                                <div className="font-mono font-bold text-slate-900">#{order.id}</div>
                                <div className="text-[10px] text-slate-400">
                                  {order.created_at ? new Date(order.created_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }) : '—'}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-900">{order.recipient_name}</td>
                              <td className="py-3 px-4">
                                <div className="font-mono text-slate-800">{order.phone}</div>
                                {order.mpesa_code && (
                                  <span className="font-mono text-[10px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 inline-block mt-0.5">
                                    {order.mpesa_code}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-black px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md text-[11px]">{order.size}</span>
                                <span className="ml-1 text-slate-500 font-semibold">&times; {order.quantity}</span>
                              </td>
                              <td className="py-3 px-4 font-black text-slate-900">
                                KES {Number(order.total_amount || 0).toLocaleString()}
                              </td>
                              <td className="py-3 px-4">
                                {isPending && <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1"><Clock size={10} /> Pending</span>}
                                {isConfirmed && <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1"><CheckCircle2 size={10} /> Confirmed</span>}
                                {isDelivered && <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1"><PackageCheck size={10} /> Delivered</span>}
                                {isCancelled && <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1"><XCircle size={10} /> Cancelled</span>}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {isPending && (
                                    <button
                                      onClick={() => handleConfirmCommunityOrder(order.id)}
                                      disabled={orderActionLoading === order.id}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                      title="Confirm Payment"
                                    >
                                      <Check size={11} /> Confirm
                                    </button>
                                  )}
                                  {isConfirmed && (
                                    <button
                                      onClick={() => handleCompleteCommunityOrder(order.id)}
                                      disabled={orderActionLoading === order.id}
                                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                      title="Mark as Delivered"
                                    >
                                      <PackageCheck size={11} /> Done
                                    </button>
                                  )}
                                  {(isPending || isConfirmed) && (
                                    <button
                                      onClick={() => setCancelOrderModal(order)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                      title="Cancel Order"
                                    >
                                      <XCircle size={14} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setSelectedOrderDetail(order)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                    title="View Details / Receipt"
                                  >
                                    <Eye size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {orders.length === 0 && (
                      <div className="text-center py-12 text-slate-400">
                        <ShoppingBag size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-500">No orders recorded for this community.</p>
                      </div>
                    )}
                  </div>
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

          {/* MUSIC CLASS (choir only) — members who opted in on the join form */}
          {activeTab === 'music-class' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 font-medium">
                Members who asked to join music classes on the choir join form. Reach out directly to arrange sessions.
              </p>
              {loading ? (
                <PageLoader message="Loading sign-ups" />
              ) : musicSignups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-500">
                    <Music size={28} />
                  </div>
                  <h4 className="text-slate-300 font-bold italic">No music class sign-ups yet</h4>
                  <p className="text-slate-500 text-sm mt-1">Members who tick "Join Music Classes" on the form will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-400 font-bold">{musicSignups.length} member{musicSignups.length !== 1 ? 's' : ''} interested</p>
                  {musicSignups.map((s, i) => (
                    <div
                      key={`${s.phone}-${i}`}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-800 bg-slate-800/70 hover:bg-slate-800 transition"
                    >
                      <span className="flex items-center gap-2.5 text-sm font-bold text-slate-200 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 font-black">
                          {(s.full_name || '?').charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate">{s.full_name}</span>
                      </span>
                      <a
                        href={`tel:${String(s.phone).replace(/[^+0-9]/g, '')}`}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-indigo-950 px-2.5 py-1.5 rounded-lg hover:bg-indigo-900 transition-colors shrink-0"
                        title={`Call ${s.full_name}`}
                      >
                        {s.phone}
                      </a>
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
                        <div className="flex flex-wrap items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
                          <span className="text-xs font-black uppercase tracking-wider text-blue-700">Filter Choir:</span>
                          <select
                            value={choirVoiceFilter}
                            onChange={(e: any) => setChoirVoiceFilter(e.target.value)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
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
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
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
                            <div key={stat.label} className="rounded-xl p-3 text-center bg-slate-50 border border-slate-200 shadow-xs">
                              <p className="text-xl font-black text-slate-900">{stat.value}</p>
                              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                            <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest">Full Name</th>
                            {['charismatic', 'dancers', 'youth', 'st-francis'].includes(categoryId || '') ? (
                              <>
                                <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest">Phone</th>
                                <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest">Email</th>
                              </>
                            ) : (
                              <>
                                <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest">Voice Section</th>
                                <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest">Gender</th>
                              </>
                            )}
                            <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                            <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
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
                            <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-slate-800">
                              <td className="py-3.5 px-4 font-extrabold text-slate-900">{member.fullName || member.full_name}</td>
                              {['charismatic', 'dancers', 'youth', 'st-francis'].includes(categoryId || '') ? (
                                <>
                                  <td className="py-3.5 px-4 text-sm text-slate-600 font-semibold">{member.phoneNumber || member.phone || 'N/A'}</td>
                                  <td className="py-3.5 px-4 text-sm text-slate-600 font-semibold">{member.email || 'N/A'}</td>
                                </>
                              ) : (
                                <>
                                  <td className="py-3.5 px-4 text-sm font-bold">
                                    {categoryId === 'choir' ? (
                                      <select
                                        value={member.voice_type || ''}
                                        onChange={async (e) => {
                                          const v = e.target.value;
                                          if (!v) return;
                                          try {
                                            await updateTableRecord('enrollments', member.id, { voice_type: v });
                                            showToast(`Voice section saved: ${v}`);
                                            await loadCategoryData();
                                          } catch {
                                            alert('Could not save voice section');
                                          }
                                        }}
                                        className={`px-2 py-1 rounded-md border text-xs font-black uppercase cursor-pointer ${
                                          (member.voice_type || '').toLowerCase().includes('soprano') ? 'bg-pink-100 text-pink-800 border-pink-200' :
                                          (member.voice_type || '').toLowerCase().includes('alto') ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                          (member.voice_type || '').toLowerCase().includes('tenor') ? 'bg-sky-100 text-sky-800 border-sky-200' :
                                          (member.voice_type || '').toLowerCase().includes('bass') ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                                          'bg-white text-slate-500 border-slate-300'
                                        }`}
                                        title="Set this member's voice section"
                                      >
                                        <option value="">Set voice…</option>
                                        <option value="Soprano">Soprano</option>
                                        <option value="Alto">Alto</option>
                                        <option value="Tenor">Tenor</option>
                                        <option value="Bass">Bass</option>
                                      </select>
                                    ) : (
                                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase ${
                                        (member.voice_type || '').toLowerCase().includes('soprano') ? 'bg-pink-100 text-pink-800 border border-pink-200' :
                                        (member.voice_type || '').toLowerCase().includes('alto') ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                        (member.voice_type || '').toLowerCase().includes('tenor') ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                                        (member.voice_type || '').toLowerCase().includes('bass') ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                                      }`}>
                                        {member.voice_type || 'General'}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-sm text-slate-700 font-semibold capitalize">{member.gender || 'N/A'}</td>
                                </>
                              )}
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                  member.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' : member.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}>
                                  {member.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {member.status !== 'Approved' && (
                                    <button onClick={async (e) => { e.stopPropagation(); try { await updateTableRecord('enrollments', member.id, { status: 'Approved' }); showToast('Member approved'); await loadCategoryData(); } catch { alert('Approve failed'); } }} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer" title="Approve">
                                      <CheckCircle size={18} />
                                    </button>
                                  )}
                                  {member.status !== 'Rejected' && (
                                    <button onClick={async (e) => { e.stopPropagation(); try { await updateTableRecord('enrollments', member.id, { status: 'Rejected' }); showToast('Member rejected'); await loadCategoryData(); } catch { alert('Reject failed'); } }} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer" title="Reject">
                                      <XCircle size={18} />
                                    </button>
                                  )}
                                  <button onClick={(e) => { e.stopPropagation(); handleDelete(member.id); }} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer" title="Delete">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 text-slate-900 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black mb-4 text-slate-900">{editingItem ? 'Edit' : 'Add'} {activeTab === 'activities' ? 'Activity' : activeTab === 'announcements' ? 'Announcement' : activeTab === 'schedules' ? 'Practice Schedule' : 'Member'}</h3>
            <div className="space-y-3.5">
              {activeTab === 'schedules' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Day of Week *</label>
                      <select value={formValues.day || (isStFrancisAdmin ? 'Sunday' : isDancersAdmin ? 'Saturday' : isCharismaticAdmin ? 'Thursday' : 'Tuesday')} onChange={(e) => setFormValues(v => ({ ...v, day: e.target.value }))} className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl mt-1 text-xs font-bold focus:outline-none focus:border-blue-500">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">{isStFrancisAdmin ? 'Venue / Meeting Point *' : 'Venue / Room *'}</label>
                      <input value={formValues.location || ''} onChange={(e) => setFormValues(v => ({ ...v, location: e.target.value }))} placeholder={isStFrancisAdmin ? 'e.g. LH 21 / Neighborhood Block' : 'e.g. School Compound / Main Hall'} className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl mt-1 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Start Time *</label>
                      <input type="text" value={formValues.start_time || ''} onChange={(e) => setFormValues(v => ({ ...v, start_time: e.target.value }))} placeholder={isStFrancisAdmin ? 'e.g. 17:00 or 5:00 PM' : 'e.g. 16:00 or 4:00 PM'} className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl mt-1 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">End Time</label>
                      <input type="text" value={formValues.end_time || ''} onChange={(e) => setFormValues(v => ({ ...v, end_time: e.target.value }))} placeholder="e.g. 18:30 or 6:30 PM" className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl mt-1 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                </>
              )}
              {(activeTab === 'activities' || activeTab === 'announcements') && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Title</label>
                    <input value={formValues.title || ''} onChange={(e) => setFormValues(v => ({ ...v, title: e.target.value }))} className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl mt-1 text-xs font-medium focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Description / Content</label>
                    <textarea value={formValues.description || formValues.content || ''} onChange={(e) => setFormValues(v => ({ ...v, description: e.target.value, content: e.target.value }))} className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl mt-1 text-xs font-medium focus:outline-none focus:border-blue-500" rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Venue / Location</label>
                      <input value={formValues.location || ''} onChange={(e) => setFormValues(v => ({ ...v, location: e.target.value }))} className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl mt-1 text-xs font-medium focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">Date</label>
                      <input type="date" value={formValues.activity_date?.slice?.(0, 10) || formValues.announcement_date?.slice?.(0, 10) || ''} onChange={(e) => setFormValues(v => ({ ...v, activity_date: e.target.value, announcement_date: e.target.value }))} className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl mt-1 text-xs font-medium focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'members' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Full name</label>
                    <input value={formValues.full_name || formValues.fullName || ''} onChange={(e) => setFormValues(v => ({ ...v, full_name: e.target.value }))} className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl mt-1 text-xs font-medium focus:outline-none focus:border-blue-500" />
                  </div>
                  {['charismatic', 'dancers', 'youth'].includes(categoryId || '') ? (
                    <>
                      <div>
                        <label className="text-xs font-bold text-slate-700">Phone Number</label>
                        <input value={formValues.phone || formValues.phoneNumber || ''} onChange={(e) => setFormValues(v => ({ ...v, phone: e.target.value }))} className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl mt-1 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500" placeholder="e.g. 0712345678" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700">Email Address (optional)</label>
                        <input type="email" value={formValues.email || ''} onChange={(e) => setFormValues(v => ({ ...v, email: e.target.value }))} className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl mt-1 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500" placeholder="e.g. email@example.com" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700">Voice Section (SATB)</label>
                          <select value={formValues.voice_type || ''} onChange={(e) => setFormValues(v => ({ ...v, voice_type: e.target.value }))} className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl mt-1 text-xs font-bold focus:outline-none focus:border-blue-500">
                            <option value="">Select Voice...</option>
                            <option value="Soprano">Soprano (High Female)</option>
                            <option value="Alto">Alto (Low Female)</option>
                            <option value="Tenor">Tenor (High Male)</option>
                            <option value="Bass">Bass (Deep Male)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700">Gender (Gent / Lady)</label>
                          <select value={formValues.gender || ''} onChange={(e) => setFormValues(v => ({ ...v, gender: e.target.value }))} className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl mt-1 text-xs font-bold focus:outline-none focus:border-blue-500">
                            <option value="">Select Gender...</option>
                            <option value="Male">Gent (Male)</option>
                            <option value="Female">Lady (Female)</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="text-xs font-bold text-slate-700">Phone Number</label>
                        <input value={formValues.phone || formValues.phoneNumber || ''} onChange={(e) => setFormValues(v => ({ ...v, phone: e.target.value }))} className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl mt-1 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500" placeholder="e.g. 0712345678" />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select value={formValues.status || 'Pending'} onChange={(e) => setFormValues(v => ({ ...v, status: e.target.value }))} className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl mt-1 text-xs font-bold focus:outline-none focus:border-blue-500">
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700">Attachment / Image (optional)</label>
                <input type="file" onChange={handleFileChange} className="w-full mt-1 text-xs text-slate-600" />
                {formValues.image_url && <img src={formValues.image_url} alt="preview" className="w-32 h-20 object-cover mt-2 rounded-xl border border-slate-200" />}
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-2 border-t border-slate-100">
                <button onClick={closeModal} className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs text-slate-600 hover:bg-slate-200 transition cursor-pointer">Cancel</button>
                <button
                  disabled={uploading}
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl text-white font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-60"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-slate-900 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add Photo to Gallery</h3>
                <p className="text-xs text-slate-500 font-medium">{moduleMeta?.title || categoryId} • Community Gallery</p>
              </div>
              <button onClick={() => setGalleryModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition text-slate-600 cursor-pointer"><X size={14} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Event / Caption Name</label>
                <input
                  type="text"
                  placeholder="e.g. Easter Choir Rehearsal"
                  value={newImageForm.event_name}
                  onChange={(e) => setNewImageForm(v => ({ ...v, event_name: e.target.value }))}
                  className="w-full border border-slate-200 bg-slate-50 text-slate-800 p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Category Tag (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Concerts, Sunday Mass"
                  value={newImageForm.category}
                  onChange={(e) => setNewImageForm(v => ({ ...v, category: e.target.value }))}
                  className="w-full border border-slate-200 bg-slate-50 text-slate-800 p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Direct Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newImageForm.image_url}
                  onChange={(e) => setNewImageForm(v => ({ ...v, image_url: e.target.value }))}
                  className="w-full border border-slate-200 bg-slate-50 text-slate-800 p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 font-medium"
                />
              </div>
              {newImageForm.image_url && (
                <img src={newImageForm.image_url} alt="preview" className="w-full h-36 object-cover rounded-xl border border-slate-200 mt-2" />
              )}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button onClick={() => setGalleryModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer">Cancel</button>
                <button onClick={handleAddGalleryImage} className="px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer" style={{ background: accentColor }}>Upload Photo</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for T-Shirt Product Add/Edit */}
      {productModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-slate-900 animate-scale-up">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">{productForm.id ? 'Edit Merchandise Product' : 'Add New Merchandise'}</h3>
                <p className="text-xs text-slate-500 font-medium">{moduleMeta?.title || categoryId} • Community Uniform &amp; Attire</p>
              </div>
              <button onClick={() => setProductModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition text-slate-600 cursor-pointer"><X size={14} /></button>
            </div>
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700">Product Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Official Choir Polo T-Shirt"
                  value={productForm.name}
                  onChange={(e) => setProductForm(v => ({ ...v, name: e.target.value }))}
                  className="w-full border border-slate-200 bg-slate-50 text-slate-900 p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Price (KES) *</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm(v => ({ ...v, price: Number(e.target.value) }))}
                    className="w-full border border-slate-200 bg-slate-50 text-slate-900 p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Expected Collection Date</label>
                  <input
                    type="date"
                    value={productForm.collection_date}
                    onChange={(e) => setProductForm(v => ({ ...v, collection_date: e.target.value }))}
                    className="w-full border border-slate-200 bg-slate-50 text-slate-900 p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Sizes Available (comma separated)</label>
                <input
                  type="text"
                  placeholder="S, M, L, XL, XXL"
                  value={productForm.sizes}
                  onChange={(e) => setProductForm(v => ({ ...v, sizes: e.target.value }))}
                  className="w-full border border-slate-200 bg-slate-50 text-slate-900 p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">T-Shirt Sample Image URL</label>
                <input
                  type="url"
                  placeholder="https://... (direct link to sample photo)"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm(v => ({ ...v, image_url: e.target.value }))}
                  className="w-full border border-slate-200 bg-slate-50 text-slate-900 p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 font-medium"
                />
                {productForm.image_url && (
                  <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-50">
                    <img src={productForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description / Fabric Info</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 100% combed cotton, embroidered crest, unisex sizing."
                  value={productForm.description}
                  onChange={(e) => setProductForm(v => ({ ...v, description: e.target.value }))}
                  className="w-full border border-slate-200 bg-slate-50 text-slate-900 p-2.5 rounded-xl text-xs mt-1 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button onClick={() => setProductModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer">Cancel</button>
                <button onClick={handleSaveProduct} className="px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer" style={{ background: accentColor }}>
                  {productForm.id ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Cancel Order */}
      {cancelOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-slate-900 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <XCircle size={18} />
                <h3 className="font-black text-slate-900">Cancel Order #{cancelOrderModal.id}</h3>
              </div>
              <button onClick={() => setCancelOrderModal(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X size={14} /></button>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Cancel the order for <strong>{cancelOrderModal.recipient_name}</strong>? Their order status will change to <em>Cancelled</em>.
            </p>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-700 block mb-1">Reason for Cancellation</label>
              <textarea
                rows={3}
                placeholder="e.g. M-Pesa transaction code not verified, out of stock, or member requested cancellation."
                value={orderRejectionReason}
                onChange={(e) => setOrderRejectionReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <button onClick={() => setCancelOrderModal(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200">Go Back</button>
              <button
                onClick={handleCancelCommunityOrder}
                disabled={orderActionLoading === cancelOrderModal.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {orderActionLoading === cancelOrderModal.id ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Order Detail / Receipt */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-slate-900 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Shirt size={16} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Order #{selectedOrderDetail.id} Details</h3>
                  <p className="text-[10px] text-slate-500">{moduleMeta?.title || categoryId} Attire</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrderDetail(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X size={14} /></button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Recipient</span>
                <span className="font-black text-slate-900">{selectedOrderDetail.recipient_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Phone</span>
                <span className="font-mono font-bold text-slate-900">{selectedOrderDetail.phone}</span>
              </div>
              {selectedOrderDetail.mpesa_code && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">M-Pesa Ref</span>
                  <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{selectedOrderDetail.mpesa_code}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Specification</span>
                <span className="font-bold text-slate-900">Size {selectedOrderDetail.size} &times; {selectedOrderDetail.quantity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Status</span>
                <span className="font-black uppercase text-indigo-600 text-[10px]">{selectedOrderDetail.status}</span>
              </div>
              {selectedOrderDetail.rejection_reason && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs mt-2">
                  <span className="font-bold block text-[10px] uppercase text-rose-800 mb-0.5">Cancellation Reason</span>
                  {selectedOrderDetail.rejection_reason}
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-2">
                <span className="font-black text-slate-500 uppercase text-[10px]">Total Amount</span>
                <span className="text-lg font-black text-slate-900">KES {Number(selectedOrderDetail.total_amount || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-5 pt-3 border-t border-slate-100">
              <button onClick={() => window.print()} className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer">
                <Printer size={13} /> Print
              </button>
              <button onClick={() => setSelectedOrderDetail(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  </div>
  );
}
