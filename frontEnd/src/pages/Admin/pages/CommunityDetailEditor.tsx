import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient, createTableRecord, updateTableRecord, deleteTableRecord, uploadFile } from '../../../api/axiosInstance';
import { 
  ArrowLeft,
  Calendar,
  Megaphone,
  UserCheck,
  Users,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

type TabType = 'activities' | 'announcements' | 'officials' | 'members';

export default function CommunityDetailEditor() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('activities');
  const [moduleMeta, setModuleMeta] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCategoryData();
  }, [categoryId, activeTab]);

  const loadCategoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Module Meta if not already loaded or category changed
      if (!moduleMeta || moduleMeta.id !== categoryId) {
        const modulesResponse = await apiClient.get('/api/hub_modules');
        const modules = Array.isArray(modulesResponse.data) ? modulesResponse.data : (modulesResponse.data?.data || []);
        const meta = modules.find((m: any) => m.id === categoryId);
        setModuleMeta(meta);
      }

      // 2. Fetch specific tab data
      let tableName = '';
      switch (activeTab) {
        case 'activities': tableName = 'hub_activities'; break;
        case 'announcements': tableName = 'hub_announcements'; break;
        case 'officials': tableName = 'hub_officials'; break;
        case 'members': tableName = 'enrollments'; break;
      }

      const response = await apiClient.get(`/api/${tableName}`);
      const items = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      // Filter by module_id (or class_id for members)
      const filtered = items.filter((item: any) => 
        (item.module_id === categoryId) || (item.class_id === categoryId)
      );
      setData(filtered);
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
      // Basic validation
      if (activeTab === 'activities') {
        if (!formValues.title) return alert('Title required');
      }
      if (activeTab === 'announcements') {
        if (!formValues.title) return alert('Title required');
      }
      if (activeTab === 'officials') {
        if (!formValues.name) return alert('Name required');
      }
      if (activeTab === 'members') {
        if (!formValues.full_name) return alert('Full name required');
      }

      // Handle file upload first
      if (formValues._files && formValues._files.length) {
        setUploading(true);
        const res = await uploadFile(formValues._files as File[]);
        const uploaded = res.data || [];
        // attach first file url
        if (uploaded[0]) {
          const uploadedUrl = uploaded[0].url || uploaded[0].secure_url || uploaded[0].path;
          const uploadedId = uploaded[0].public_id || uploaded[0].id;
          // Map to correct column based on tab
          if (activeTab === 'officials') {
            formValues.photo_url = uploadedUrl;
          } else {
            formValues.image_url = uploadedUrl;
          }
          formValues.public_id = uploadedId;
        }
        setUploading(false);
      }

      const tableName = activeTab === 'activities' ? 'hub_activities' : activeTab === 'announcements' ? 'hub_announcements' : activeTab === 'officials' ? 'hub_officials' : 'enrollments';

      // Build properly mapped payload based on table
      let payload: any = { module_id: categoryId };

      if (activeTab === 'activities') {
        // hub_activities: id, module_id, title, description, activity_date, location, status
        payload = {
          module_id: categoryId,
          title: formValues.title,
          description: formValues.description,
          activity_date: formValues.activity_date || null,
          location: formValues.location || '',
          status: formValues.status || 'Upcoming'
        };
      } else if (activeTab === 'announcements') {
        // hub_announcements: id, module_id, title, content, announcement_date
        payload = {
          module_id: categoryId,
          title: formValues.title,
          content: formValues.description || formValues.content, // Map description -> content
          announcement_date: formValues.announcement_date || new Date().toISOString()
        };
      } else if (activeTab === 'officials') {
        // hub_officials: id, module_id, name, role, email, phone_number, photo_url
        payload = {
          module_id: categoryId,
          name: formValues.name,
          role: formValues.role || '',
          email: formValues.email || '',
          phone_number: formValues.whatsapp || formValues.contact || formValues.phone_number || '', // Map whatsapp/contact -> phone_number
          photo_url: formValues.photo_url || ''
        };
      } else if (activeTab === 'members') {
        // enrollments: id, module_id (as class_id), full_name, voice_type, music_level, status
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

      // invalidate simple API cache used by ApiService
      try {
        localStorage.removeItem('csa_cache_hub_activities');
        localStorage.removeItem('csa_cache_hub_announcements');
        localStorage.removeItem('csa_cache_hub_officials');
        localStorage.removeItem('csa_cache_enrollments');
      } catch {}

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
      const tableName = activeTab === 'activities' ? 'hub_activities' : activeTab === 'announcements' ? 'hub_announcements' : activeTab === 'officials' ? 'hub_officials' : 'enrollments';
      await deleteTableRecord(tableName, id as any);
      showToast('Deleted');
      try {
        localStorage.removeItem('csa_cache_hub_activities');
        localStorage.removeItem('csa_cache_hub_announcements');
        localStorage.removeItem('csa_cache_hub_officials');
        localStorage.removeItem('csa_cache_enrollments');
      } catch {}
      await loadCategoryData();
    } catch (err: any) {
      console.error('Delete failed', err);
      alert('Delete failed');
    }
  };

  const showToast = (msg: string) => {
    try { (window as any).toast && (window as any).toast(msg); } catch {}
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'activities', label: 'Semester Activities', icon: Calendar },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'officials', label: 'Officials Management', icon: UserCheck },
    { id: 'members', label: 'Registered Members', icon: Users },
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
              <h2 className="text-2xl font-black text-slate-800 uppercase">{moduleMeta?.title} COMMAND CENTER</h2>
              <p className="text-slate-500 text-sm mt-0.5">Admin Level Access • Manage {categoryId} resources and growth.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <ExternalLink size={16} /> Public Preview
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-slate-100/50 border border-slate-200 rounded-2xl w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <tab.icon size={18} />
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
            <p className="text-xs text-slate-500 font-medium">Results for {categoryId} category</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-3 py-2 border rounded-md text-sm mr-2" />
            <button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              <Plus size={18} />
              Add {activeTab === 'members' ? 'Member' : 'New ' + (activeTab.slice(0, -1))}
            </button>
          </div>
        </div>

        <div className="p-6">
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
                   {activeTab === 'officials' && <UserCheck size={32} />}
                   {activeTab === 'members' && <Users size={32} />}
                </div>
                <h4 className="text-slate-800 font-bold italic">No records found</h4>
                <p className="text-slate-500 text-sm mt-1">Start by clicking the "Add" button to populate this section.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === 'members' ? (
                /* Members Table */
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</th>
                      {['charismatic', 'dancers', 'youth'].includes(categoryId || '') ? (
                        <>
                          <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone Number</th>
                          <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</th>
                          <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Registration Date</th>
                        </>
                      ) : (
                        <>
                          <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Voice Type</th>
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
                      <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                              {(member.fullName || member.full_name || 'N/A')?.substring(0, 2)}
                            </div>
                            <span className="font-bold text-slate-700">{member.fullName || member.full_name}</span>
                          </div>
                        </td>
                        {['charismatic', 'dancers', 'youth'].includes(categoryId || '') ? (
                          <>
                            <td className="py-4 px-4 text-sm text-slate-600 font-medium">{member.phoneNumber || member.phone || 'N/A'}</td>
                            <td className="py-4 px-4 text-sm text-slate-600 font-medium">{member.email || 'N/A'}</td>
                            <td className="py-4 px-4 text-sm text-slate-600 font-medium">
                              {member.registrationDate || member.enrolled_at ? new Date(member.registrationDate || member.enrolled_at).toLocaleDateString() : 'N/A'}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-4 px-4 text-sm text-slate-600 font-medium capitalize">{member.voice_type || 'N/A'}</td>
                            <td className="py-4 px-4 text-sm text-slate-600 font-medium capitalize">{member.music_level || 'N/A'}</td>
                          </>
                        )}
                        <td className="py-4 px-4">
                           <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                             member.status === 'Pending' ? 'bg-amber-100 text-amber-700' : member.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                           }`}>
                             {member.status}
                           </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                              {member.status !== 'Approved' && (
                                <button onClick={async (e) => { e.stopPropagation(); try { await updateTableRecord('enrollments', member.id, { status: 'Approved' }); showToast('Member approved'); await loadCategoryData(); } catch(err){ alert('Approve failed'); } }} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve">
                                  <CheckCircle size={18} />
                                </button>
                              )}
                              {member.status !== 'Rejected' && (
                                <button onClick={async (e) => { e.stopPropagation(); try { await updateTableRecord('enrollments', member.id, { status: 'Rejected' }); showToast('Member rejected'); await loadCategoryData(); } catch(err){ alert('Reject failed'); } }} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors" title="Reject">
                                  <XCircle size={18} />
                                </button>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(member.id); }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                                <Trash2 size={18} />
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeTab === 'officials' ? (
                /* Officials Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {data.map((official) => (
                     <div key={official.id} className="flex flex-col border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group bg-slate-50/20">
                        <div className="h-48 bg-slate-100 relative overflow-hidden">
                           {official.photo_url ? (
                             <img src={official.photo_url} alt={official.name} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <ImageIcon size={48} />
                             </div>
                           )}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); openEditModal(official); }} className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-blue-600 hover:bg-white"><Edit2 size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(official.id); }} className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-rose-600 hover:bg-white"><Trash2 size={14} /></button>
                          </div>
                        </div>
                        <div className="p-4 text-center">
                           <h4 className="font-black text-slate-800 uppercase tracking-tight">{official.name}</h4>
                           <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1">{official.role}</p>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                /* List View for Activities/Announcements */
                <div className="space-y-4">
                  {data.map((item) => (
                    <div key={item.id} onClick={() => openEditModal(item)} className="p-5 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/10 transition-all flex items-start justify-between gap-4 group" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') openEditModal(item); }}>
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
                       <div className="flex items-center gap-1 opacity-10 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(item); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"><Edit2 size={18} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"><Trash2 size={18} /></button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Modal for Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-4">{editingItem ? 'Edit' : 'Add'} {activeTab === 'activities' ? 'Activity' : activeTab === 'announcements' ? 'Announcement' : activeTab === 'officials' ? 'Official' : 'Member'}</h3>
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
                      <input type="date" value={formValues.activity_date?.slice?.(0,10) || formValues.announcement_date?.slice?.(0,10) || ''} onChange={(e) => setFormValues(v => ({ ...v, activity_date: e.target.value, announcement_date: e.target.value }))} className="w-full border px-3 py-2 rounded mt-1" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'officials' && (
                <>
                  <div>
                    <label className="text-sm font-bold">Full name</label>
                    <input value={formValues.name || ''} onChange={(e) => setFormValues(v => ({ ...v, name: e.target.value }))} className="w-full border px-3 py-2 rounded mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-bold">Position / Role</label>
                    <input value={formValues.role || ''} onChange={(e) => setFormValues(v => ({ ...v, role: e.target.value }))} className="w-full border px-3 py-2 rounded mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-bold">Email (optional)</label>
                    <input type="email" value={formValues.email || ''} onChange={(e) => setFormValues(v => ({ ...v, email: e.target.value }))} className="w-full border px-3 py-2 rounded mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-bold">WhatsApp / Phone Number</label>
                    <input value={formValues.whatsapp || formValues.contact || formValues.phone_number || ''} onChange={(e) => setFormValues(v => ({ ...v, whatsapp: e.target.value, contact: e.target.value, phone_number: e.target.value }))} className="w-full border px-3 py-2 rounded mt-1" placeholder="+254..." />
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
                <button onClick={closeModal} className="px-4 py-2 rounded bg-slate-100">Cancel</button>
                <button disabled={uploading} onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white">{uploading ? 'Uploading...' : (editingItem ? 'Save Changes' : 'Create')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
