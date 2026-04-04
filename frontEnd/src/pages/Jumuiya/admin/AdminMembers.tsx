import React, { useState, useEffect } from 'react';
import {
    FaPlus, FaTrash, FaEdit, FaUserCheck, FaUserTimes,
    FaSearch, FaUsers, FaCheckSquare, FaSquare, FaTimes, FaUserPlus
} from 'react-icons/fa';
import {
    useJumuiyaMembers,
    type JumuiyaMember,
    type MemberFormData,
    type UnregisteredMember
} from '../../../hooks/useJumuiyaMembers';
import { useData } from '../context/DataContext';

interface AdminMembersProps {
    selectedId?: string;
}

const YEAR_OPTIONS = ['1st', '2nd', '3rd', '4th', 'Alumni', 'Other'];

const emptyForm = (): MemberFormData => ({
    jumuiya_id: '',
    name: '',
    year: '',
    phone: '',
    email: '',
    is_registered: false,
});

type ActivePanel = 'list' | 'bulk';

const AdminMembers: React.FC<AdminMembersProps> = ({ selectedId }) => {
    const { jumuiyaList } = useData();
    const [selectedJumuiyaId, setSelectedJumuiyaId] = useState(selectedId || jumuiyaList[0]?.id || '');
    const selectedJumuiya = jumuiyaList.find((j: any) => j.id === selectedJumuiyaId);

    const {
        members, isLoading, isAdding, isUpdating, isDeleting, isBulkJoining,
        error, addMember, updateMember, deleteMember, bulkJoin, fetchUnregistered, refetch
    } = useJumuiyaMembers({ jumuiya_id: selectedJumuiyaId });

    // --- Single member form state ---
    const [isEditing, setIsEditing] = useState(false);
    const [editingMember, setEditingMember] = useState<JumuiyaMember | null>(null);
    const [form, setForm] = useState<MemberFormData>(emptyForm());
    const [formError, setFormError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    // --- Bulk registration state ---
    const [activePanel, setActivePanel] = useState<ActivePanel>('list');
    const [unregistered, setUnregistered] = useState<UnregisteredMember[]>([]);
    const [unregLoading, setUnregLoading] = useState(false);
    const [unregError, setUnregError] = useState<string | null>(null);
    const [bulkSearch, setBulkSearch] = useState('');
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);

    // Load unregistered members when bulk panel opens
    useEffect(() => {
        if (activePanel === 'bulk') {
            setUnregLoading(true);
            setUnregError(null);
            setBulkSuccess(null);
            setSelected(new Set());
            fetchUnregistered()
                .then(data => setUnregistered(data))
                .catch(e => setUnregError(e.message))
                .finally(() => setUnregLoading(false));
        }
    }, [activePanel, selectedJumuiyaId]);

    const filteredUnregistered = unregistered.filter(m => {
        const q = bulkSearch.toLowerCase();
        return (
            m.first_name.toLowerCase().includes(q) ||
            m.last_name.toLowerCase().includes(q) ||
            (m.email || '').toLowerCase().includes(q)
        );
    });

    const allSelected = filteredUnregistered.length > 0 && filteredUnregistered.every(m => selected.has(m.member_id));

    const toggleSelect = (id: number) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (allSelected) {
            setSelected(prev => {
                const next = new Set(prev);
                filteredUnregistered.forEach(m => next.delete(m.member_id));
                return next;
            });
        } else {
            setSelected(prev => {
                const next = new Set(prev);
                filteredUnregistered.forEach(m => next.add(m.member_id));
                return next;
            });
        }
    };

    const handleBulkSubmit = async () => {
        if (selected.size === 0) return;
        try {
            const count = await bulkJoin(Array.from(selected), selectedJumuiyaId);
            setBulkSuccess(`✅ Successfully registered ${count} member${count !== 1 ? 's' : ''} to ${selectedJumuiya?.name || 'this Jumuiya'}!`);
            // Remove the now-registered ones from the unregistered list
            setUnregistered(prev => prev.filter(m => !selected.has(m.member_id)));
            setSelected(new Set());
        } catch (err: any) {
            setUnregError(err.message);
        }
    };

    // --- Single member form handlers ---
    const openAdd = () => {
        setEditingMember(null);
        setForm({ ...emptyForm(), jumuiya_id: selectedJumuiyaId });
        setFormError(null);
        setIsEditing(true);
    };

    const openEdit = (member: JumuiyaMember) => {
        setEditingMember(member);
        setForm({
            jumuiya_id: member.jumuiya_id,
            name: member.name,
            year: member.year || '',
            phone: member.phone || '',
            email: member.email || '',
            is_registered: member.is_registered,
        });
        setFormError(null);
        setIsEditing(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        try {
            if (editingMember) {
                await updateMember(editingMember.id, form);
            } else {
                await addMember({ ...form, jumuiya_id: selectedJumuiyaId });
            }
            setIsEditing(false);
        } catch (err: any) {
            setFormError(err.message || 'An error occurred');
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm(`Delete member "${name}"?`)) return;
        try { await deleteMember(id); } catch (err: any) { alert(err.message); }
    };

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.phone || '').includes(search)
    );

    const registered = members.filter(m => m.is_registered).length;

    return (
        <div className="admin-page-container" style={{ '--admin-theme-color': selectedJumuiya?.color } as React.CSSProperties}>
            <div className="admin-card">

                {/* Header */}
                <div className="admin-header-actions">
                    <h2>Manage Members</h2>
                    {!selectedId && (
                        <select
                            value={selectedJumuiyaId}
                            onChange={(e) => { setSelectedJumuiyaId(e.target.value); setActivePanel('list'); }}
                            className="jumuiya-select"
                        >
                            {jumuiyaList.map((j: any) => (
                                <option key={j.id} value={j.id}>{j.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Summary stats */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'var(--bg-soft)', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaUserCheck style={{ color: '#16a34a' }} />
                        <span style={{ fontWeight: 700 }}>{registered}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Registered</span>
                    </div>
                    <div style={{ background: 'var(--bg-soft)', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaUserTimes style={{ color: '#dc2626' }} />
                        <span style={{ fontWeight: 700 }}>{members.length - registered}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Unregistered</span>
                    </div>
                    <div style={{ background: 'var(--bg-soft)', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaUsers style={{ color: 'var(--primary-color)' }} />
                        <span style={{ fontWeight: 700 }}>{members.length}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total</span>
                    </div>
                </div>

                {/* Panel toggle tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid var(--border-color)', paddingBottom: '0' }}>
                    {(['list', 'bulk'] as ActivePanel[]).map(panel => (
                        <button
                            key={panel}
                            onClick={() => setActivePanel(panel)}
                            style={{
                                padding: '10px 20px',
                                background: 'none',
                                border: 'none',
                                borderBottom: activePanel === panel ? '3px solid var(--primary-color)' : '3px solid transparent',
                                color: activePanel === panel ? 'var(--primary-color)' : 'var(--text-secondary)',
                                fontWeight: activePanel === panel ? 700 : 500,
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                marginBottom: '-2px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                            }}
                        >
                            {panel === 'list' ? <><FaUsers /> Member List</> : <><FaUserPlus /> Bulk Register</>}
                        </button>
                    ))}
                </div>

                {/* ====== LIST PANEL ====== */}
                {activePanel === 'list' && (
                    <>
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name, email or phone..."
                                style={{ width: '100%', paddingLeft: '36px', padding: '10px 10px 10px 36px', borderRadius: '10px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                            />
                        </div>

                        {error && <p style={{ color: '#dc2626', marginBottom: '12px' }}>{error}</p>}

                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Year</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
                                    ) : filteredMembers.length === 0 ? (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                                            {search ? 'No members match your search.' : 'No members found. Add the first one!'}
                                        </td></tr>
                                    ) : filteredMembers.map(member => (
                                        <tr key={member.id}>
                                            <td style={{ fontWeight: 600 }}>{member.name}</td>
                                            <td>{member.year || '—'}</td>
                                            <td>{member.phone || '—'}</td>
                                            <td>{member.email || '—'}</td>
                                            <td>
                                                <span style={{
                                                    padding: '3px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    background: member.is_registered ? '#dcfce7' : '#fee2e2',
                                                    color: member.is_registered ? '#16a34a' : '#dc2626'
                                                }}>
                                                    {member.is_registered ? 'Registered' : 'Unregistered'}
                                                </span>
                                            </td>
                                            <td style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => openEdit(member)} className="action-btn edit-btn" title="Edit" disabled={isUpdating}><FaEdit /></button>
                                                <button onClick={() => handleDelete(member.id, member.name)} className="action-btn delete-btn-icon" title="Delete" disabled={isDeleting}><FaTrash /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            className="btn-primary"
                            style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={openAdd}
                            disabled={isAdding}
                        >
                            <FaPlus /> Add Member
                        </button>
                    </>
                )}

                {/* ====== BULK REGISTER PANEL ====== */}
                {activePanel === 'bulk' && (
                    <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                            Select members from the university database who are not yet in any Jumuiya, then assign them to{' '}
                            <strong>{selectedJumuiya?.name || 'this Jumuiya'}</strong>.
                        </p>

                        {/* Success banner */}
                        {bulkSuccess && (
                            <div style={{
                                background: '#dcfce7', color: '#15803d', borderRadius: '12px',
                                padding: '14px 18px', marginBottom: '16px', display: 'flex',
                                alignItems: 'center', justifyContent: 'space-between', fontWeight: 600
                            }}>
                                <span>{bulkSuccess}</span>
                                <button onClick={() => setBulkSuccess(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d' }}><FaTimes /></button>
                            </div>
                        )}

                        {unregError && (
                            <div style={{ background: '#fee2e2', color: '#dc2626', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px' }}>
                                {unregError}
                            </div>
                        )}

                        {/* Search bar */}
                        <div style={{ position: 'relative', marginBottom: '16px' }}>
                            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                value={bulkSearch}
                                onChange={e => setBulkSearch(e.target.value)}
                                placeholder="Search unregistered members..."
                                style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '10px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Selection bar */}
                        {filteredUnregistered.length > 0 && (
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 16px', background: 'var(--bg-soft)', borderRadius: '10px',
                                marginBottom: '12px', flexWrap: 'wrap', gap: '8px'
                            }}>
                                <button
                                    onClick={toggleAll}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.9rem' }}
                                >
                                    {allSelected ? <FaCheckSquare /> : <FaSquare />}
                                    {allSelected ? 'Deselect All' : 'Select All'}
                                </button>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    {selected.size} selected · {filteredUnregistered.length} shown
                                </span>
                            </div>
                        )}

                        {/* Table */}
                        <div className="table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '44px' }}></th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Year</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {unregLoading ? (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Loading members from database…</span>
                                        </td></tr>
                                    ) : filteredUnregistered.length === 0 ? (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                                            {bulkSearch ? 'No members match your search.' : '🎉 All members are already assigned to a Jumuiya!'}
                                        </td></tr>
                                    ) : filteredUnregistered.map(m => {
                                        const isChecked = selected.has(m.member_id);
                                        return (
                                            <tr
                                                key={m.member_id}
                                                onClick={() => toggleSelect(m.member_id)}
                                                style={{
                                                    cursor: 'pointer',
                                                    background: isChecked ? 'rgba(var(--primary-rgb, 59,130,246), 0.07)' : undefined,
                                                    transition: 'background 0.15s'
                                                }}
                                            >
                                                <td>
                                                    <span style={{ color: isChecked ? 'var(--primary-color)' : 'var(--text-secondary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                                                        {isChecked ? <FaCheckSquare /> : <FaSquare />}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{m.first_name} {m.last_name}</td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{m.email || '—'}</td>
                                                <td>{m.year_of_study || '—'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Submit button */}
                        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <button
                                className="btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: selected.size === 0 ? 0.5 : 1 }}
                                onClick={handleBulkSubmit}
                                disabled={selected.size === 0 || isBulkJoining}
                            >
                                <FaUserPlus />
                                {isBulkJoining
                                    ? 'Registering…'
                                    : `Register ${selected.size > 0 ? selected.size : ''} Member${selected.size !== 1 ? 's' : ''}`
                                }
                            </button>
                            {selected.size > 0 && (
                                <button
                                    onClick={() => setSelected(new Set())}
                                    style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 18px', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 600 }}
                                >
                                    Clear Selection
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ====== Single-member Add/Edit Modal ====== */}
            {isEditing && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="modal-content animate-slide-up" style={{ background: 'white', padding: '32px', borderRadius: '20px', width: '90%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                            {editingMember ? 'Edit Member' : 'Add Member'}
                        </h3>
                        {formError && (
                            <div style={{ background: '#fee2e2', color: '#dc2626', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.9rem' }}>
                                {formError}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Enter full name" />
                            </div>
                            <div className="form-group">
                                <label>Year of Study</label>
                                <select value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                    <option value="">— Select Year —</option>
                                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+254..." />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: 'row' }}>
                                <input
                                    type="checkbox"
                                    id="is_registered"
                                    checked={form.is_registered}
                                    onChange={e => setForm({ ...form, is_registered: e.target.checked })}
                                    style={{ width: 'auto' }}
                                />
                                <label htmlFor="is_registered" style={{ margin: 0 }}>Mark as Registered</label>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
                                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" style={{ padding: '12px 24px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', color: '#64748b' }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={isAdding || isUpdating}>
                                    {isAdding || isUpdating ? 'Saving...' : 'Save Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMembers;
