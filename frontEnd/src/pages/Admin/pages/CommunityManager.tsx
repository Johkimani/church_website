import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/axiosInstance';
import {
  Users,
  Settings2,
  Plus,
  Search,
  ExternalLink,
  Loader2,
  RefreshCcw,
  LayoutGrid
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ClickableCard from '../../../components/ClickableCard';

const COMMUNITY_IMAGES: Record<string, string> = {
  choir: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600",
  dancers: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600",
  charismatic: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=600",
  "st-francis": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600",
  youth: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=600",
  mentorship: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=600"
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&q=80&w=600";

export default function CommunityManager() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/hub_modules');
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      
      const allowedIds = ['choir', 'dancers', 'st-francis', 'charismatic', 'youth', 'mentorship'];
      setModules(Array.isArray(data) ? data.filter((m: any) => allowedIds.includes(m.id)) : []);
    } catch (err: any) {
      console.error('[CommunityManager] load error:', err);
      setError(err?.message || 'Failed to load community modules');
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = modules.filter(m => 
    m.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
         <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
         <p className="text-slate-500 font-bold">Loading community modules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Community Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage all church ministries, groups, and sacramental modules.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadModules}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            title="Refresh"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            <Plus size={20} />
            Create Module
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <LayoutGrid size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Modules</p>
              <p className="text-2xl font-black text-slate-800">{modules.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Enrollment</p>
              <p className="text-2xl font-black text-slate-800">42</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
              <Settings2 size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Updates</p>
              <p className="text-2xl font-black text-slate-800">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by module name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredModules.length > 0 ? filteredModules.map((module) => (
          <ClickableCard
            key={module.id}
            to={`/admin/community-management/${module.id}`}
            ariaLabel={`Manage ${module.title}`}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col group"
          >
            {/* Card Image Banner */}
            <div className="h-48 w-full overflow-hidden relative bg-slate-100">
              <img 
                src={COMMUNITY_IMAGES[module.id] || DEFAULT_IMAGE} 
                alt={module.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
            </div>

            {/* Card Content */}
            <div className="p-6 flex-grow flex flex-col justify-between">
              <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase group-hover:text-blue-600 transition-colors">
                {module.title}
              </h3>
            </div>
            
            {/* Card Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
               <Link 
                to={`/community/${module.id}`} 
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
               >
                 <ExternalLink size={14} /> View Public Page
               </Link>
            </div>
          </ClickableCard>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <LayoutGrid size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-slate-500 font-bold">No modules found matching your search.</h3>
          </div>
        )}
      </div>
    </div>
  );
}
