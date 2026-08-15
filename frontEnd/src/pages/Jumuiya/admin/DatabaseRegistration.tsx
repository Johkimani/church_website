import React, { useState } from 'react';
import { FaUserPlus, FaDatabase, FaListUl, FaSearch, FaEnvelope, FaIdCard, FaGraduationCap, FaArrowLeft, FaEdit, FaTrash, FaCheckCircle, FaTimes, FaSpinner, FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { SessionStorage } from '../../../utils';
import { useJumuiyaMembers } from '../../../hooks/useJumuiyaMembers';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import PageLoader from '../../../assets/Layouts/PageLoader';
import './Admin.css';

interface DatabaseMemberForm {
    member_id: string;
    first_name: string;
    last_name: string;
    email: string;
    year_of_study: string;
    jumuiya_id: string;
    password?: string;
}

const YEAR_OPTIONS = ['1st', '2nd', '3rd', '4th', 'Alumni'];
const GRADIENT_PRIMARY = 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)';

const emptyForm = (): DatabaseMemberForm => ({
    member_id: '',
    first_name: '',
    last_name: '',
    email: '',
    year_of_study: '',
    jumuiya_id: '',
});

const DatabaseRegistration: React.FC = () => {
    // Hooks
    const navigate = useNavigate();
    const { jumuiyaList } = useData();
    // States
    const [adminView, setAdminView] = useState<'roster' | 'registrations'>('roster');
    const { members, isLoading, refetch, updateMember, deleteMember, unregisterMember } = useJumuiyaMembers({
        type: adminView === 'registrations' ? 'registered' : 'all'
    });

    const [form, setForm] = useState<DatabaseMemberForm>(emptyForm());
    const [editingMember, setEditingMember] = useState<any>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [search, setSearch] = useState('');
    const [filterJumuiya, setFilterJumuiya] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortField, setSortField] = useState<'name' | 'id' | 'year'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            const payload = {
                ...form,
                password: form.member_id
            };

            const baseUrl = import.meta.env.VITE_SERVER_URI || 'http://localhost:3000';
            const userdata = SessionStorage.get("userdata");
            const accessToken = userdata?.accessToken;
            const res = await fetch(`${baseUrl}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.error || `Server responded with ${res.status}`);
            }

            setMessage({ type: 'success', text: `Successfully registered ${form.first_name} ${form.last_name} into the database!` });
            setForm(emptyForm());
            refetch();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to inject member into database' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredMembers = members
        .filter(m => {
            const q = search.toLowerCase();
            const matchesSearch = m.name.toLowerCase().includes(q) ||
                m.id.toLowerCase().includes(q) ||
                (m.email || '').toLowerCase().includes(q);

            const matchesJumuiya = !filterJumuiya || m.jumuiya_id === filterJumuiya;
            const matchesYear = !filterYear || m.year === filterYear;

            return matchesSearch && matchesJumuiya && matchesYear;
        })
        .sort((a, b) => {
            let comparison = 0;
            if (sortField === 'name') comparison = a.name.localeCompare(b.name);
            else if (sortField === 'id') comparison = a.id.localeCompare(b.id);
            else if (sortField === 'year') comparison = (a.year || '').localeCompare(b.year || '');
            return sortDirection === 'asc' ? comparison : -comparison;
        });

    const handleEditClick = (member: any) => {
        const nameParts = member.name.split(' ');
        setEditingMember({
            ...member,
            member_id: member.id,
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            year_of_study: member.year || ''
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = async (memberId: string, name: string) => {
        if (window.confirm(`Are you sure you want to permanently DELETE ${name} from the database? This action cannot be undone.`)) {
            try {
                await deleteMember(memberId);
                setMessage({ type: 'success', text: `Successfully removed ${name} from the database.` });
            } catch (err: any) {
                setMessage({ type: 'error', text: err.message });
            }
        }
    };

    const handleUnregisterClick = async (memberId: string, name: string) => {
        if (window.confirm(`Are you sure you want to UNREGISTER ${name} from their community? They will remain in the database but lose community status.`)) {
            try {
                await unregisterMember(memberId);
                setMessage({ type: 'success', text: `Successfully unregistered ${name}.` });
            } catch (err: any) {
                setMessage({ type: 'error', text: err.message });
            }
        }
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMember(editingMember.member_id, {
                first_name: editingMember.first_name,
                last_name: editingMember.last_name,
                email: editingMember.email,
                year_of_study: editingMember.year_of_study,
                jumuiya_id: editingMember.jumuiya_id
            });
            setShowEditModal(false);
            setMessage({ type: 'success', text: `Updated ${editingMember.first_name} successfully!` });
            refetch();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSort = (field: 'name' | 'id' | 'year') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(ellipse at top left, #eff6ff 0%, #f8fafc 100%)',
            padding: '40px 20px',
            fontFamily: 'Inter, -apple-system, sans-serif'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header Area */}
                <div className="animate-fade" style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%',
                            width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: '#475569',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        <FaArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>
                            <span style={{ background: GRADIENT_PRIMARY, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Members Registration
                            </span>
                        </h1>
                        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1rem' }}>
                            Manage and register members directly into the central database system
                        </p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '32px' }}>

                    {/* Registration Form Card */}
                    <div className="animate-slide-up" style={{
                        alignSelf: 'start', background: 'white',
                        borderRadius: '28px', padding: '32px',
                        boxShadow: '0 20px 35px -12px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.02)',
                        transition: 'transform 0.2s ease'
                    }}>
                        <div style={{ marginBottom: '28px' }}>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '16px',
                                background: 'linear-gradient(135deg, #2563eb10, #3b82f610)',
                                color: '#2563eb', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', marginBottom: '20px'
                            }}>
                                <FaUserPlus size={28} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                                Member Injection
                            </h3>
                            <p style={{ color: '#64748b', marginTop: '6px', fontSize: '0.875rem' }}>
                                Register a new member into the database
                            </p>
                        </div>

                        {message && (
                            <div style={{
                                padding: '14px 18px',
                                borderRadius: '14px',
                                marginBottom: '24px',
                                background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                                color: message.type === 'success' ? '#166534' : '#991b1b',
                                borderLeft: `4px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.875rem'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {message.type === 'success' ? <FaCheckCircle /> : <FaTimes />}
                                    {message.text}
                                </span>
                                <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem', padding: '0 6px', opacity: 0.7 }}>×</button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '8px', color: '#334155' }}>
                                    <FaIdCard size={14} /> Registration ID <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    required
                                    placeholder="e.g., CT100/G/1234/23"
                                    value={form.member_id}
                                    onChange={e => setForm({ ...form, member_id: e.target.value })}
                                    style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '0.875rem' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#334155' }}>First Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        required
                                        placeholder="John"
                                        value={form.first_name}
                                        onChange={e => setForm({ ...form, first_name: e.target.value })}
                                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#334155' }}>Last Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        required
                                        placeholder="Doe"
                                        value={form.last_name}
                                        onChange={e => setForm({ ...form, last_name: e.target.value })}
                                        style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '8px', color: '#334155' }}>
                                    <FaEnvelope size={14} /> Email Address <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    required
                                    type="email"
                                    placeholder="student@example.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '8px', color: '#334155' }}>
                                        <FaGraduationCap size={14} /> Year of Study
                                    </label>
                                    <select
                                        value={form.year_of_study}
                                        onChange={e => setForm({ ...form, year_of_study: e.target.value })}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white' }}
                                    >
                                        <option value="">— Select Year —</option>
                                        {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#334155' }}>Jumuiya Assignment</label>
                                    <select
                                        value={form.jumuiya_id}
                                        onChange={e => setForm({ ...form, jumuiya_id: e.target.value })}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white' }}
                                    >
                                        <option value="">— Unassigned —</option>
                                        {jumuiyaList.map((j: any) => (
                                            <option key={j.id} value={j.group_id}>{j.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    width: '100%', padding: '14px', fontSize: '0.95rem', marginTop: '8px',
                                    display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center',
                                    background: isSubmitting ? '#94a3b8' : GRADIENT_PRIMARY,
                                    color: 'white', border: 'none', borderRadius: '14px', fontWeight: 600,
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)' }}
                                onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(0)' }}
                            >
                                {isSubmitting ? <><FaSpinner className="spinner" /> Injecting Data...</> : <><FaDatabase /> Inject Record Into Database</>}
                            </button>
                        </form>
                    </div>

                    {/* Available Members Directory Card */}
                    <div className="animate-slide-up" style={{
                        background: 'white', borderRadius: '28px', padding: '32px',
                        boxShadow: '0 20px 35px -12px rgba(0,0,0,0.08)',
                        display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FaListUl style={{ color: '#3b82f6' }} /> {adminView === 'roster' ? 'Database Roster' : 'Community Registrations'}
                                    </h3>
                                    <p style={{ color: '#64748b', marginTop: '6px', fontSize: '0.875rem' }}>
                                        Total {members.length} {adminView === 'roster' ? 'member' : 'registration'}{members.length !== 1 && 's'} in {adminView === 'roster' ? 'database' : 'active list'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div className="toggle-wrapper" style={{ margin: 0, padding: '4px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', gap: '4px' }}>
                                        <button
                                            className={`toggle-item ${adminView === 'roster' ? 'active' : ''}`}
                                            onClick={() => setAdminView('roster')}
                                            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: adminView === 'roster' ? 'white' : 'transparent', fontWeight: adminView === 'roster' ? 700 : 500, boxShadow: adminView === 'roster' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                                        >
                                            Roster
                                        </button>
                                        <button
                                            className={`toggle-item ${adminView === 'registrations' ? 'active' : ''}`}
                                            onClick={() => setAdminView('registrations')}
                                            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: adminView === 'registrations' ? 'white' : 'transparent', fontWeight: adminView === 'registrations' ? 700 : 500, boxShadow: adminView === 'registrations' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                                        >
                                            Registrations
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        style={{
                                            padding: '8px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0',
                                            background: 'white', display: 'flex', alignItems: 'center', gap: '8px',
                                            cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#475569'
                                        }}
                                    >
                                        <FaFilter size={12} /> Filters {showFilters ? <FaChevronUp /> : <FaChevronDown />}
                                    </button>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div style={{ position: 'relative', marginBottom: '16px' }}>
                                <FaSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1rem' }} />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by ID, name, or email..."
                                    style={{
                                        width: '100%', padding: '12px 16px 12px 44px', borderRadius: '14px',
                                        border: '1.5px solid #e2e8f0', background: 'white', outline: 'none',
                                        fontSize: '0.875rem', transition: 'all 0.2s'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>

                            {/* Filters */}
                            {showFilters && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '16px' }}>
                                    <select
                                        value={filterJumuiya}
                                        onChange={e => setFilterJumuiya(e.target.value)}
                                        style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}
                                    >
                                        <option value="">All Jumuiyas</option>
                                        {jumuiyaList.map((j: any) => (
                                            <option key={j.id} value={j.group_id}>{j.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={filterYear}
                                        onChange={e => setFilterYear(e.target.value)}
                                        style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}
                                    >
                                        <option value="">All Years</option>
                                        {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="table-container" style={{
                            flex: 1, maxHeight: '550px', overflowY: 'auto',
                            borderRadius: '16px', border: '1px solid #e2e8f0',
                            background: 'white'
                        }}>
                            {isLoading ? (
                                <div style={{ padding: '60px 40px', display: 'flex', justifyContent: 'center' }}>
                                    <PageLoader message="Querying Central Database" />
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                                    <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        <tr>
                                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('id')}>
                                                ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                                                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('year')}>
                                                Year {sortField === 'year' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                                                Jumuiya
                                            </th>
                                            <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMembers.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: 'center', padding: '60px 20px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <FaSearch size={24} color="#94a3b8" />
                                                        </div>
                                                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>No records found</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Try adjusting your search or filters</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredMembers.map((m, index) => (
                                                <tr key={m.id} style={{
                                                    transition: 'all 0.15s ease',
                                                    borderBottom: '1px solid #f1f5f9',
                                                    background: index % 2 === 0 ? 'white' : '#fafcff'
                                                }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafcff'; }}>
                                                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem', color: '#3b82f6' }}>
                                                        <span style={{ background: '#eff6ff', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>
                                                            {m.id}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px', fontSize: '0.875rem' }}>
                                                            {m.name}
                                                        </div>
                                                        {m.email && m.email !== 'No email provided' && (
                                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <FaEnvelope size={10} /> {m.email}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', fontWeight: 500, fontSize: '0.8rem', color: '#475569' }}>
                                                        {m.year || <span style={{ color: '#cbd5e1' }}>—</span>}
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        {m.jumuiya_id ? (
                                                            <span style={{
                                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem',
                                                                fontWeight: 600, background: 'linear-gradient(135deg, #2563eb10, #3b82f610)',
                                                                color: '#2563eb', border: '1px solid #2563eb20', display: 'inline-block'
                                                            }}>
                                                                {m.jumuiya_name || jumuiyaList.find((j: any) => j.group_id === m.jumuiya_id)?.name || m.jumuiya_id}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontStyle: 'italic', background: '#f8fafc', padding: '4px 8px', borderRadius: '12px', display: 'inline-block' }}>
                                                                Unassigned
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                            <button
                                                                onClick={() => handleEditClick(m)}
                                                                style={{
                                                                    padding: '8px', borderRadius: '10px', border: 'none',
                                                                    background: 'white', color: '#64748b', cursor: 'pointer',
                                                                    transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center',
                                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                                }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                                title="Edit Member"
                                                            >
                                                                <FaEdit size={14} />
                                                            </button>
                                                            {adminView === 'registrations' && (
                                                                <button
                                                                    onClick={() => handleUnregisterClick(m.id, m.name)}
                                                                    style={{
                                                                        padding: '8px', borderRadius: '10px', border: 'none',
                                                                        background: 'white', color: '#f59e0b', cursor: 'pointer',
                                                                        transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center',
                                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                                    }}
                                                                    onMouseEnter={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#f59e0b'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                                    title="Unregister from Jumuiya"
                                                                >
                                                                    <FaTimes size={14} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteClick(m.id, m.name)}
                                                                style={{
                                                                    padding: '8px', borderRadius: '10px', border: 'none',
                                                                    background: 'white', color: '#ef4444', cursor: 'pointer',
                                                                    transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center',
                                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                                }}
                                                                onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                                title="Delete Permanently"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal - Enhanced */}
            {showEditModal && editingMember && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: '20px', animation: 'fadeIn 0.2s ease'
                }}>
                    <div className="animate-slide-up" style={{
                        background: 'white', borderRadius: '28px', width: '100%', maxWidth: '520px',
                        padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Edit Member Record</h3>
                                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.8rem' }}>Update member information</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '12px', width: '36px', height: '36px', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div className="form-group">
                                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#334155' }}>Registration ID</label>
                                <input disabled value={editingMember.member_id} style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#334155' }}>First Name</label>
                                    <input required value={editingMember.first_name} onChange={e => setEditingMember({ ...editingMember, first_name: e.target.value })} style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#334155' }}>Last Name</label>
                                    <input required value={editingMember.last_name} onChange={e => setEditingMember({ ...editingMember, last_name: e.target.value })} style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#334155' }}>Email Address</label>
                                <input required type="email" value={editingMember.email} onChange={e => setEditingMember({ ...editingMember, email: e.target.value })} style={{ padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#334155' }}>Year of Study</label>
                                    <select value={editingMember.year_of_study} onChange={e => setEditingMember({ ...editingMember, year_of_study: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white' }}>
                                        <option value="">— Select —</option>
                                        {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#334155' }}>Jumuiya</label>
                                    <select value={editingMember.jumuiya_id || ''} onChange={e => setEditingMember({ ...editingMember, jumuiya_id: e.target.value || null })} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white' }}>
                                        <option value="">— Unassigned —</option>
                                        {jumuiyaList.map((j: any) => <option key={j.id} value={j.group_id}>{j.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>Cancel</button>
                                <button type="submit" style={{ flex: 2, padding: '14px', borderRadius: '14px', border: 'none', background: GRADIENT_PRIMARY, color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatabaseRegistration;