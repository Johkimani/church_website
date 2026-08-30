import { useState, useEffect, useMemo, useCallback } from "react";
import { memberService } from "../../../api/jumuiyaMemberService";
import { Users, Search, X, Edit2, Save, ChevronLeft, ChevronRight, RefreshCw, Flag, Ban } from "lucide-react";
import { SkeletonTable } from "../../../components/Skeleton";
import { getYearOfStudy } from "../../../utils/memberYear";


interface Props {
  jumuiyaId: string;
  jumuiyaName: string;
}

const MemberReview: React.FC<Props> = ({ jumuiyaId }) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const itemsPerPage = 25;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await memberService.getMembers(jumuiyaId);
      setMembers(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  }, [jumuiyaId]);

  useEffect(() => {
    fetchMembers();
  }, [jumuiyaId]);

  const handleEdit = (m: any) => {
    setEditingId(m.member_id);
    setEditForm({
      first_name: m.first_name || "",
      last_name: m.last_name || "",
      email: m.email || "",
      gender: m.gender || "",
      course: m.course || "",
      phone: m.phone || "",
      year_of_study: m.year_of_study || "",
    });
  };

  const handleSave = async (memberId: string) => {
    setSaving(true);
    try {
      const res = await memberService.updateMember(memberId, editForm);
      setMembers(prev => prev.map(m =>
        m.member_id === memberId ? { ...m, ...res.data } : m
      ));
      setEditingId(null);
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.message || "Failed to update member");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleFlag = async (memberId: string, currentlyFlagged: boolean) => {
    try {
      const res = await memberService.flagMember(memberId, !currentlyFlagged);
      setMembers(prev => prev.map(m =>
        m.member_id === memberId ? { ...m, flagged_inactive: res.data.flagged_inactive } : m
      ));
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.message || "Failed to flag member");
    }
  };

  const filtered = useMemo(() => debouncedSearch
    ? members.filter(m =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (m.member_id || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (m.email || "").toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : members, [members, debouncedSearch]);

  const { paginatedMembers, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return {
      paginatedMembers: filtered.slice(start, end),
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  }, [filtered, currentPage]);

  const activeCount = members.filter(m => !m.flagged_inactive).length;
  const flaggedCount = members.filter(m => m.flagged_inactive).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="skeleton-shimmer h-6 w-36 rounded-lg" />
          <div className="skeleton-shimmer h-8 w-48 rounded-lg" />
        </div>
        <SkeletonTable rows={8} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Review Members</h3>
          <p className="text-xs text-slate-500">
            {activeCount} active &middot; {flaggedCount} flagged &middot; {members.length} total
            {debouncedSearch && <span> &bull; {filtered.length} matching</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="pl-8 pr-8 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 w-48" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
          <button onClick={fetchMembers} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {flaggedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <Flag size={16} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700">
            <span className="font-semibold">{flaggedCount}</span> flagged member(s) excluded from active counts &mdash; they won&apos;t affect CSA distribution.
          </p>
        </div>
      )}

      {members.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Users size={32} className="text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No members to review.</p>
          <p className="text-slate-300 text-xs mt-1">Members appear here from legacy records, imports, or CSA distribution.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider w-10">No.</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Reg #</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Source</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Gender</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Course</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Year</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.map((m, idx) => {
                  const isEditing = editingId === m.member_id;
                  return (
                    <tr key={m.member_id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${m.flagged_inactive ? "bg-red-50/40" : ""}`}>
                      <td className="py-3 px-4 text-slate-400 text-xs">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{m.member_id}</td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <input value={editForm.first_name} onChange={e => setEditForm((p: any) => ({ ...p, first_name: e.target.value }))}
                              placeholder="First" className="text-xs border border-slate-200 rounded px-1.5 py-1 w-20" />
                            <input value={editForm.last_name} onChange={e => setEditForm((p: any) => ({ ...p, last_name: e.target.value }))}
                              placeholder="Last" className="text-xs border border-slate-200 rounded px-1.5 py-1 w-20" />
                          </div>
                        ) : (
                          <span className="text-slate-700 font-medium">{m.first_name} {m.last_name}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input value={editForm.email} onChange={e => setEditForm((p: any) => ({ ...p, email: e.target.value }))}
                            placeholder="email" className="text-xs border border-slate-200 rounded px-1.5 py-1 w-28" />
                        ) : (
                          <span className="text-slate-500">{m.email || "—"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${
                          m.source === "jum" ? "bg-indigo-50 text-indigo-700" :
                          m.source === "csa" ? "bg-cyan-50 text-cyan-700" :
                          "bg-slate-50 text-slate-700"
                        }`}>
                          {m.source === "csa" ? "CSA" : "Jum"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <select value={editForm.gender} onChange={e => setEditForm((p: any) => ({ ...p, gender: e.target.value }))}
                            className="text-xs border border-slate-200 rounded px-1.5 py-1">
                            <option value="">—</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            m.gender === "male" ? "bg-blue-50 text-blue-700" :
                            m.gender === "female" ? "bg-pink-50 text-pink-700" :
                            "bg-slate-50 text-slate-500"
                          }`}>
                            {m.gender === "male" ? "M" : m.gender === "female" ? "W" : "—"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input value={editForm.course} onChange={e => setEditForm((p: any) => ({ ...p, course: e.target.value }))}
                            className="text-xs border border-slate-200 rounded px-1.5 py-1 w-24" />
                        ) : (
                          <span className="text-slate-500">{m.course || "—"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input value={editForm.phone} onChange={e => setEditForm((p: any) => ({ ...p, phone: e.target.value }))}
                            className="text-xs border border-slate-200 rounded px-1.5 py-1 w-24" />
                        ) : (
                          <span className="text-slate-500">{m.phone || "—"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input value={editForm.year_of_study} onChange={e => setEditForm((p: any) => ({ ...p, year_of_study: e.target.value }))}
                            className="text-xs border border-slate-200 rounded px-1.5 py-1 w-16" />
                        ) : (
                          <span className="text-slate-500">{getYearOfStudy(m.member_id || "") || m.year_of_study || "—"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {isEditing ? (
                            <>
                              <button onClick={() => handleSave(m.member_id)} disabled={saving}
                                className="text-xs font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 disabled:opacity-50">
                                <Save size={12} />
                              </button>
                              <button onClick={handleCancel}
                                className="text-xs font-semibold px-2 py-1 rounded bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200">
                                <X size={12} />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => handleEdit(m)}
                              className="text-xs font-semibold px-2 py-1 rounded bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200">
                              <Edit2 size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => handleFlag(m.member_id, m.flagged_inactive)}
                            className={`text-xs font-semibold px-2 py-1 rounded border transition-colors ${
                              m.flagged_inactive
                                ? "bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                                : "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                            }`}
                            title={m.flagged_inactive ? "Unflag member" : "Flag as inactive"}
                          >
                            {m.flagged_inactive ? <Ban size={12} /> : <Flag size={12} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;
                    const isVisible = Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;

                    if (!isVisible) return null;
                    if (!isActive && Math.abs(page - currentPage) === 3) {
                      return <span key={`dots-${i}`} className="text-slate-400">...</span>;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg font-semibold text-xs transition-colors ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemberReview;
