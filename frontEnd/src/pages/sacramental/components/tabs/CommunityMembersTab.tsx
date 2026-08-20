import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../api/axiosInstance';
import { FaUsers, FaSearch, FaThLarge, FaList, FaPhoneAlt, FaEnvelope, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  moduleId: string;
  moduleName: string;
  color: string;
}

const CommunityMembersTab: React.FC<Props> = ({ moduleId, moduleName, color }) => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const { data: enrollmentsData = { enrollments: [], stats: { total: 0, approved: 0, pending: 0, rejected: 0 } }, isLoading } = useQuery({
    queryKey: ['enrollments', moduleId],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/community-enrollment/${moduleId}`, { params: { status: 'all' } });
        if (res.data && Array.isArray(res.data.enrollments)) {
          return res.data;
        }
      } catch (e) {
        // fallback
      }
      const res = await apiClient.get('/enrollments');
      const items = Array.isArray(res.data)
        ? res.data.filter((e: any) => e.class_id === moduleId || e.module_id === moduleId)
        : [];
      return { enrollments: items, stats: { total: items.length, approved: items.filter((x: any) => x.status === 'Approved').length, pending: items.filter((x: any) => x.status === 'Pending').length, rejected: items.filter((x: any) => x.status === 'Rejected').length } };
    },
    retry: 1,
    staleTime: 60000,
  });

  const enrollments = enrollmentsData.enrollments || [];

  const filtered = useMemo(() => {
    let result = enrollments as any[];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) => {
        const name = (m.fullName || m.full_name || '').toLowerCase();
        const email = (m.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }
    if (statusFilter !== 'all') {
      result = result.filter((m) => (m.status || 'Pending').toLowerCase() === statusFilter);
    }
    return result;
  }, [enrollments, search, statusFilter]);

  const approved = (enrollments as any[]).filter((m) => (m.status || 'Pending') === 'Approved').length;
  const pending = (enrollments as any[]).filter((m) => (m.status || 'Pending') === 'Pending').length;

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">Registered Members</h1>
          <p className="page-description">{enrollments.length} member{enrollments.length !== 1 ? 's' : ''} in {moduleName}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total', value: enrollments.length, icon: <FaUsers size={16} />, bg: `${color}12` },
          { label: 'Approved', value: approved, icon: <FaCheckCircle size={16} />, bg: '#10b98115' },
          { label: 'Pending', value: pending, icon: <FaClock size={16} />, bg: '#f59e0b15' },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 text-center transition-all hover:scale-[1.03]"
            style={{
              background: stat.bg,
              border: `1px solid ${color}15`,
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <span style={{ color }}>{stat.icon}</span>
              <span className="text-2xl font-black" style={{ color: i === 1 ? '#10b981' : i === 2 ? '#f59e0b' : color }}>
                {stat.value}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Search + View Toggle */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
          />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-slate-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3.5 py-2 transition-all cursor-pointer ${viewMode === 'grid' ? 'text-white' : 'text-slate-400 bg-white hover:bg-slate-50'}`}
            style={viewMode === 'grid' ? { background: color } : {}}
          >
            <FaThLarge size={14} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-2 transition-all cursor-pointer ${viewMode === 'list' ? 'text-white' : 'text-slate-400 bg-white hover:bg-slate-50'}`}
            style={viewMode === 'list' ? { background: color } : {}}
          >
            <FaList size={14} />
          </button>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all' as const, label: 'All' },
          { key: 'approved' as const, label: 'Approved' },
          { key: 'pending' as const, label: 'Pending' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              statusFilter === f.key
                ? 'text-white shadow-md'
                : 'text-slate-500 bg-white border border-slate-200 hover:border-slate-300'
            }`}
            style={statusFilter === f.key ? { background: color } : {}}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-slate-200 rounded-full animate-spin" style={{ borderTopColor: color }} />
        </div>
      ) : filtered.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((member: any) => {
              const name = member.fullName || member.full_name || 'Unknown';
              const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
              const status = (member.status || 'Pending').toLowerCase();
              return (
                <div
                  key={member.id}
                  className="relative rounded-2xl p-5 bg-white border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 right-0 h-1" style={{
                    background: status === 'approved' ? '#10b981' : status === 'rejected' ? '#ef4444' : '#f59e0b',
                  }} />
                  <div className="flex items-start gap-3.5 mt-1">
                    <div
                      className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-md ring-2 transition-transform group-hover:scale-105"
                      style={{ ringColor: `${color}20` }}
                    >
                      {member.profile_image ? (
                        <img src={member.profile_image} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-lg text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                          {initials}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{name}</h3>
                      <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md mt-1 ${
                        status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                        status === 'rejected' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {member.status || 'Pending'}
                      </span>
                      <div className="mt-2 space-y-1">
                        {member.voice_type && (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mr-1" style={{ background: `${color}10`, color }}>
                            Voice: {member.voice_type}
                          </span>
                        )}
                        {member.music_level && (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            Level: {member.music_level}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    {(member.phoneNumber || member.phone) && (
                      <a href={`tel:${member.phoneNumber || member.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105" style={{ background: `${color}08`, color }}>
                        <FaPhoneAlt size={9} /> Call
                      </a>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-blue-600 bg-blue-50 transition-all hover:scale-105 truncate max-w-[140px]">
                        <FaEnvelope size={9} /> Email
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((member: any) => {
              const name = member.fullName || member.full_name || 'Unknown';
              const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
              const status = (member.status || 'Pending').toLowerCase();
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 hover:shadow-md transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm"
                  >
                    {member.profile_image ? (
                      <img src={member.profile_image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-sm text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                        status === 'rejected' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {member.status || 'Pending'}
                      </span>
                      {(member.phoneNumber || member.phone) && (
                        <span className="text-[10px] text-slate-400">{member.phoneNumber || member.phone}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {(member.phoneNumber || member.phone) && (
                      <a href={`tel:${member.phoneNumber || member.phone}`} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ background: `${color}10`, color }}>
                        <FaPhoneAlt size={11} />
                      </a>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50 transition-all hover:scale-110">
                        <FaEnvelope size={11} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="text-center py-16 rounded-3xl" style={{ background: `${color}06`, border: `1px dashed ${color}25` }}>
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color}10` }}>
            <FaUsers style={{ color: `${color}40` }} size={28} />
          </div>
          <p className="font-semibold text-slate-400 text-sm">
            {search || statusFilter !== 'all' ? 'No members match your filters.' : 'No members registered yet. Be the first to join!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CommunityMembersTab;
