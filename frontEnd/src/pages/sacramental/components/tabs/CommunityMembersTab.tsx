import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../api/axiosInstance';
import { useAuth } from '../../../../context/AuthContext';
import {
  FaUsers,
  FaSearch,
  FaThLarge,
  FaList,
  FaPhoneAlt,
  FaEnvelope,
  FaCheckCircle,
  FaClock,
  FaGraduationCap,
  FaLock,
  FaSignInAlt,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSortAlphaDown,
} from 'react-icons/fa';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  moduleId: string;
  moduleName: string;
  color: string;
  isAdmin?: boolean;
}

const CommunityMembersTab: React.FC<Props> = ({ moduleId, moduleName, color, isAdmin = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'year'>('name-asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(18);

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
      return {
        enrollments: items,
        stats: {
          total: items.length,
          approved: items.filter((x: any) => (x.status || '').toLowerCase() === 'approved').length,
          pending: items.filter((x: any) => (x.status || '').toLowerCase() === 'pending').length,
          rejected: items.filter((x: any) => (x.status || '').toLowerCase() === 'rejected').length,
        },
      };
    },
    retry: 1,
    staleTime: 60000,
  });

  const allEnrollments = (enrollmentsData.enrollments || []) as any[];

  const getYearRaw = (m: any): string => {
    const val = m.year_of_study || m.academic_year || m.year || '';
    return String(val).toLowerCase();
  };

  const getYearInfo = (m: any) => {
    if (m.year_of_study || m.academic_year || m.year) {
      const val = m.year_of_study || m.academic_year || m.year;
      return typeof val === 'number' || !String(val).toLowerCase().includes('year') ? `Year ${val}` : String(val);
    }
    if (m.created_at || m.joined_date || m.registration_date) {
      const d = new Date(m.created_at || m.joined_date || m.registration_date);
      if (!isNaN(d.getFullYear())) return `Joined ${d.getFullYear()}`;
    }
    return 'Member';
  };

  // Regular members only see approved members
  const visibleEnrollments = useMemo(() => {
    if (isAdmin) return allEnrollments;
    return allEnrollments.filter((m) => (m.status || 'Approved').toLowerCase() === 'approved');
  }, [allEnrollments, isAdmin]);

  // Filtered & sorted members
  const filteredAndSorted = useMemo(() => {
    let result = [...visibleEnrollments];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) => {
        const name = (m.fullName || m.full_name || '').toLowerCase();
        const email = isAdmin ? (m.email || '').toLowerCase() : '';
        const phone = isAdmin ? (m.phoneNumber || m.phone || '').toLowerCase() : '';
        return name.includes(q) || email.includes(q) || phone.includes(q);
      });
    }

    // Status filter (admin only)
    if (isAdmin && statusFilter !== 'all') {
      result = result.filter((m) => (m.status || 'Pending').toLowerCase() === statusFilter);
    }

    // Year filter
    if (yearFilter !== 'all') {
      result = result.filter((m) => {
        const y = getYearRaw(m);
        if (yearFilter === '1') return y.includes('1');
        if (yearFilter === '2') return y.includes('2');
        if (yearFilter === '3') return y.includes('3');
        if (yearFilter === '4') return y.includes('4');
        if (yearFilter === 'alumni') return y.includes('alumni') || y.includes('post') || y.includes('grad');
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      const nameA = (a.fullName || a.full_name || '').toLowerCase();
      const nameB = (b.fullName || b.full_name || '').toLowerCase();
      if (sortBy === 'name-asc') return nameA.localeCompare(nameB);
      if (sortBy === 'name-desc') return nameB.localeCompare(nameA);
      if (sortBy === 'year') {
        const yearA = getYearRaw(a);
        const yearB = getYearRaw(b);
        return yearA.localeCompare(yearB);
      }
      return 0;
    });

    return result;
  }, [visibleEnrollments, search, statusFilter, yearFilter, sortBy, isAdmin]);

  // Pagination calculation
  const totalItems = filteredAndSorted.length;
  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedMembers = useMemo(() => {
    if (pageSize === 0) return filteredAndSorted;
    const start = (validPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, validPage, pageSize]);

  const approvedCount = allEnrollments.filter((m) => (m.status || '').toLowerCase() === 'approved').length;
  const pendingCount = allEnrollments.filter((m) => (m.status || '').toLowerCase() === 'pending').length;

  // ─────────────────────────────────────────────
  // Authentication Wall for Non-Logged-in Users
  // ─────────────────────────────────────────────
  if (!user) {
    return (
      <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
        <div className="max-w-xl mx-auto py-12 px-6 text-center">
          <div
            className="p-8 md:p-12 rounded-3xl shadow-xl border relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf8f5 100%)',
              borderColor: `${color}25`,
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md"
              style={{ background: `${color}15`, color }}
            >
              <FaLock size={26} />
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
              Member Directory is Private
            </h2>

            <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-md mx-auto font-medium">
              To protect the privacy of our community members, you need to sign in with your account to view the member directory.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={() =>
                  navigate('/login', {
                    state: { from: location.pathname + (location.search || '?tab=members') },
                  })
                }
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
                style={{ background: color }}
              >
                <FaSignInAlt size={14} />
                Sign In to View Members
              </button>

              <button
                onClick={() => navigate(`/community/${moduleId}/join`)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-slate-700 text-sm bg-white border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Join This Community
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      {/* Header */}
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">{isAdmin ? 'Registered Members' : 'Community Directory'}</h1>
          <p className="page-description">
            {isAdmin
              ? `${allEnrollments.length} registered member${allEnrollments.length !== 1 ? 's' : ''} in ${moduleName}`
              : `${visibleEnrollments.length} joined member${visibleEnrollments.length !== 1 ? 's' : ''} in ${moduleName}`}
          </p>
        </div>
      </div>

      {/* Admin stats */}
      {isAdmin && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total', value: allEnrollments.length, icon: <FaUsers size={16} />, bg: `${color}12` },
            { label: 'Approved', value: approvedCount, icon: <FaCheckCircle size={16} />, bg: '#10b98115' },
            { label: 'Pending', value: pendingCount, icon: <FaClock size={16} />, bg: '#f59e0b15' },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 text-center transition-all hover:scale-[1.02]"
              style={{ background: stat.bg, border: `1px solid ${color}15` }}
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
      )}

      {/* Filter Bar: Search + Sorting + Grid/List Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={isAdmin ? 'Search by name, email, or phone…' : 'Search members by name…'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <FaSortAlphaDown className="absolute left-3 text-slate-400 pointer-events-none" size={12} />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="pl-8 pr-7 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white cursor-pointer"
              >
                <option value="name-asc">Name (A → Z)</option>
                <option value="name-desc">Name (Z → A)</option>
                <option value="year">Year of Study</option>
              </select>
            </div>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white cursor-pointer"
              title="Members per page"
            >
              <option value={12}>12 / page</option>
              <option value={18}>18 / page</option>
              <option value={36}>36 / page</option>
              <option value={72}>72 / page</option>
              <option value={0}>All</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex rounded-xl overflow-hidden border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2.5 transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'text-white' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'
                }`}
                style={viewMode === 'grid' ? { background: color } : {}}
                aria-label="Grid view"
              >
                <FaThLarge size={13} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2.5 transition-all cursor-pointer ${
                  viewMode === 'list' ? 'text-white' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'
                }`}
                style={viewMode === 'list' ? { background: color } : {}}
                aria-label="List view"
              >
                <FaList size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Year & Status Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1 mr-1">
            <FaFilter size={9} /> Year:
          </span>
          {[
            { key: 'all', label: 'All Years' },
            { key: '1', label: 'Year 1' },
            { key: '2', label: 'Year 2' },
            { key: '3', label: 'Year 3' },
            { key: '4', label: 'Year 4' },
            { key: 'alumni', label: 'Alumni / Postgrad' },
          ].map((pill) => (
            <button
              key={pill.key}
              onClick={() => {
                setYearFilter(pill.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                yearFilter === pill.key
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              }`}
              style={yearFilter === pill.key ? { background: color } : {}}
            >
              {pill.label}
            </button>
          ))}

          {/* Admin status filters */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[11px] font-bold uppercase text-slate-400">Status:</span>
              {[
                { key: 'all' as const, label: 'All' },
                { key: 'approved' as const, label: 'Approved' },
                { key: 'pending' as const, label: 'Pending' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setStatusFilter(f.key);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                    statusFilter === f.key
                      ? 'text-white shadow-xs'
                      : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                  }`}
                  style={statusFilter === f.key ? { background: color } : {}}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Showing count indicator */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-4 px-1">
          <span>
            Showing{' '}
            <strong className="text-slate-800">
              {pageSize === 0 ? totalItems : Math.min((validPage - 1) * pageSize + 1, totalItems)}–
              {pageSize === 0 ? totalItems : Math.min(validPage * pageSize, totalItems)}
            </strong>{' '}
            of <strong className="text-slate-800">{totalItems}</strong> members
          </span>

          {totalPages > 1 && (
            <span>
              Page {validPage} of {totalPages}
            </span>
          )}
        </div>
      )}

      {/* Member Directory Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-slate-200 rounded-full animate-spin" style={{ borderTopColor: color }} />
        </div>
      ) : paginatedMembers.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {paginatedMembers.map((member: any) => {
              const name = member.fullName || member.full_name || 'Member';
              const initials = name
                .split(' ')
                .filter(Boolean)
                .map((n: string) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              const status = (member.status || 'Approved').toLowerCase();
              const yearTag = getYearInfo(member);

              return (
                <div
                  key={member.id || member._id || name}
                  className="relative rounded-2xl p-5 bg-white border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group flex flex-col justify-between"
                >
                  {isAdmin && (
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{
                        background: status === 'approved' ? '#10b981' : status === 'rejected' ? '#ef4444' : '#f59e0b',
                      }}
                    />
                  )}

                  <div className="flex items-center gap-3.5 mt-1">
                    <div
                      className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-md ring-2 transition-transform group-hover:scale-105"
                      style={{ ringColor: `${color}20`, width: '48px', height: '48px' }}
                    >
                      {member.profile_image ? (
                        <img src={member.profile_image} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center font-black text-sm text-white"
                          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                        >
                          {initials}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{name}</h3>

                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={{ background: `${color}0c`, color }}
                        >
                          <FaGraduationCap size={10} />
                          {yearTag}
                        </span>

                        {isAdmin && (
                          <span
                            className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700'
                                : status === 'rejected'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {member.status || 'Pending'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Admin-only contact links */}
                  {isAdmin && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                      {(member.phoneNumber || member.phone) && (
                        <a
                          href={`tel:${member.phoneNumber || member.phone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
                          style={{ background: `${color}08`, color }}
                        >
                          <FaPhoneAlt size={9} /> Call
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-blue-600 bg-blue-50 transition-all hover:scale-105 truncate max-w-[140px]"
                        >
                          <FaEnvelope size={9} /> Email
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {paginatedMembers.map((member: any) => {
              const name = member.fullName || member.full_name || 'Member';
              const initials = name
                .split(' ')
                .filter(Boolean)
                .map((n: string) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              const status = (member.status || 'Approved').toLowerCase();
              const yearTag = getYearInfo(member);

              return (
                <div
                  key={member.id || member._id || name}
                  className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm"
                    >
                      {member.profile_image ? (
                        <img src={member.profile_image} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center font-black text-sm text-white"
                          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                        >
                          {initials}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded"
                          style={{ background: `${color}0c`, color }}
                        >
                          <FaGraduationCap size={9} /> {yearTag}
                        </span>

                        {isAdmin && (
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700'
                                : status === 'rejected'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {member.status || 'Pending'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-1.5 shrink-0">
                      {(member.phoneNumber || member.phone) && (
                        <a
                          href={`tel:${member.phoneNumber || member.phone}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: `${color}10`, color }}
                          title={member.phoneNumber || member.phone}
                        >
                          <FaPhoneAlt size={11} />
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50 transition-all hover:scale-110"
                          title={member.email}
                        >
                          <FaEnvelope size={11} />
                        </a>
                      )}
                    </div>
                  )}
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
            {search || yearFilter !== 'all' ? 'No members match your filter criteria.' : 'No members registered yet.'}
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {pageSize > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validPage === 1}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
          >
            <FaChevronLeft size={10} /> Prev
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - validPage) <= 1)
            .map((p, idx, arr) => {
              const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
              return (
                <React.Fragment key={p}>
                  {showEllipsis && <span className="text-slate-400 text-xs px-1">…</span>}
                  <button
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      p === validPage
                        ? 'text-white shadow-md scale-105'
                        : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                    }`}
                    style={p === validPage ? { background: color } : {}}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validPage === totalPages}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
          >
            Next <FaChevronRight size={10} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CommunityMembersTab;
