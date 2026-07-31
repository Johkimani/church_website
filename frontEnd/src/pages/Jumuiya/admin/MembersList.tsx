import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { memberService } from "../../../api/jumuiyaMemberService";
import { RefreshCw, Users, Search, X, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface Props {
  jumuiyaId: string;
  jumuiyaName: string;
}

// Memoized table row component
const MemberRow = memo(({ m }: { m: any }) => (
  <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
    <td className="py-3 px-4 font-medium text-slate-800">{m.member_id}</td>
    <td className="py-3 px-4 text-slate-700">{m.first_name} {m.last_name}</td>
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
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
        m.gender === "male" ? "bg-blue-50 text-blue-700" :
        m.gender === "female" ? "bg-pink-50 text-pink-700" :
        "bg-slate-50 text-slate-500"
      }`}>
        {m.gender === "male" ? "M" : m.gender === "female" ? "W" : m.gender || "—"}
      </span>
    </td>
    <td className="py-3 px-4 text-slate-500">{m.email || "—"}</td>
    <td className="py-3 px-4 text-slate-500">{m.phone || "—"}</td>
    <td className="py-3 px-4 text-slate-500">{m.year_of_study || "—"}</td>
    <td className="py-3 px-4 text-slate-400 text-xs">{m.join_date ? m.join_date.slice(0, 10) : "—"}</td>
  </tr>
));

MemberRow.displayName = "MemberRow";

const MembersList: React.FC<Props> = ({ jumuiyaId, jumuiyaName }) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; // Show 25 members per page

  // Debounce search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to first page on search
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

  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    members.forEach(m => { if (m.year_of_study) years.add(m.year_of_study); });
    return [...years].sort();
  }, [members]);

  // Memoized filtered results
  const filtered = useMemo(() => {
    let result = members;

    if (sourceFilter) {
      result = result.filter(m => m.source === sourceFilter);
    }

    if (genderFilter) {
      result = result.filter(m => m.gender === genderFilter);
    }

    if (yearFilter) {
      result = result.filter(m => m.year_of_study === yearFilter);
    }

    if (debouncedSearch) {
      result = result.filter(m =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (m.member_id || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (m.email || "").toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    return result;
  }, [members, debouncedSearch, sourceFilter, genderFilter, yearFilter]);

  // Memoized pagination calculations
  const { paginatedMembers, totalPages } = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return {
      paginatedMembers: filtered.slice(start, end),
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  }, [filtered, currentPage]);

  const exportCSV = () => {
    const headers = ["Reg #", "Name", "Source", "Gender", "Email", "Phone", "Year", "Joined"];
    const rows = filtered.map((m: any) => [
      m.member_id, `${m.first_name} ${m.last_name}`,
      m.source === "csa" ? "CSA" : "Jum",
      m.gender === "male" ? "M" : m.gender === "female" ? "F" : "",
      m.email, m.phone, m.year_of_study, m.join_date?.slice(0, 10)
    ]);
    const csv = [headers.join(","), ...rows.map((r: any) => r.map((v: any) => `"${String(v || "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${jumuiyaName.replace(/\s+/g, "_")}_members_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-1/4" />
        <div className="h-48 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">All Members</h3>
          <p className="text-xs text-slate-500">
            {members.length} total member(s) in <span className="font-semibold text-indigo-600">{jumuiyaName}</span>
            {debouncedSearch && <span> • {filtered.length} matching</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400">
            <option value="">All Sources</option>
            <option value="jum">Jumuiya</option>
            <option value="csa">CSA</option>
          </select>
          <select value={genderFilter} onChange={e => { setGenderFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400">
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select value={yearFilter} onChange={e => { setYearFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400">
            <option value="">All Years</option>
            {yearOptions.map(y => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="pl-8 pr-8 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 w-44" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
          <button onClick={exportCSV} disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={fetchMembers} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {members.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Users size={32} className="text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No members yet.</p>
          <p className="text-slate-300 text-xs mt-1">Members appear here from legacy records, imports, or CSA distribution.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Reg #</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Source</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Gender</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Year</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.map((m) => (
                  <MemberRow key={m.member_id} m={m} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
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

export default MembersList;