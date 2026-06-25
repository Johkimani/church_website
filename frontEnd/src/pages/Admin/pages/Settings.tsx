import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, 
  Shield, 
  Check, 
  AlertCircle, 
  Search, 
  UserPlus,
  ArrowRight,
  ShieldCheck,
  MoreVertical,
  Sliders,
  Settings as SettingsIcon,
  Phone,
  Save,
  Loader2
} from 'lucide-react';
import apiService from '../../Landing/services/api';
import { apiClient } from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';

interface Member {
  member_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  roles?: string[];
}

interface Official {
  id: number;
  name: string;
  position: string;
  category: string;
}

interface Role {
  role_name: string;
  description: string;
}

export default function Settings() {
  const [members, setMembers] = useState<Member[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Dynamically compute assignable roles
  const dynamicRoles = useMemo(() => {
    const baseRoles = [
      'officials management',
      'community management',
      'devotions and ai',
      'gallery manager assistant',
      'supreme_admin'
    ];
    
    const dbRoles = availableRoles.map(r => r.role_name);
    
    const officialRoles = officials
      .filter(o => o.position)
      .map(o => o.position.toLowerCase().replace(/[^a-z0-9]+/g, '_'));

    // Remove empty strings just in case
    return Array.from(new Set([...baseRoles, ...dbRoles, ...officialRoles])).filter(Boolean);
  }, [availableRoles, officials]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersData, officialsData, rolesData] = await Promise.all([
        apiService.getAdminMembers(),
        apiService.getOfficials(),
        apiService.getAdminRoles()
      ]);
      
      // The backend returns expanded data for listAllUsersRolesPermissions/listAllMembers
      // listAllMembers returns a flat list of members.
      // We need to merge role data if it's not already there.
      setMembers(membersData);
      setOfficials(officialsData);
      setAvailableRoles(rolesData.roles || []);
    } catch (error) {
      console.error('Failed to fetch settings data:', error);
      toast.error('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.member_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  const handleRoleToggle = (roleName: string) => {
    if (!selectedMember) return;
    
    const currentRoles = selectedMember.roles || [];
    const newRoles = currentRoles.includes(roleName)
      ? currentRoles.filter(r => r !== roleName)
      : [...currentRoles, roleName];
    
    setSelectedMember({ ...selectedMember, roles: newRoles });
  };

  const handleSaveRoles = async () => {
    if (!selectedMember) return;
    setIsUpdating(true);
    try {
      await apiService.updateMemberRoles(selectedMember.member_id, selectedMember.roles || []);
      toast.success(`Roles updated for ${selectedMember.first_name}`);
      fetchData(); // Refresh list
      setSelectedMember(null);
    } catch (error) {
      toast.error('Failed to update roles');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading administration settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Sliders className="w-8 h-8 text-blue-600" />
            Admin Roles & Settings
          </h1>
          <p className="text-slate-500 font-medium mt-1">Assign administrative privileges to church officials and members.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Member List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search members by name, ID or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none text-slate-900 font-medium shadow-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Roles</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => (
                    <tr 
                      key={member.member_id}
                      className={`hover:bg-slate-50/80 transition-colors group ${selectedMember?.member_id === member.member_id ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                            {member.first_name[0]}{member.last_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{member.first_name} {member.last_name}</p>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">{member.member_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {member.roles?.length ? member.roles.map(role => (
                            <span key={role} className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100 uppercase tracking-tight">
                              {role.replace('_', ' ')}
                            </span>
                          )) : (
                            <span className="text-xs text-slate-400 italic">No admin roles</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => setSelectedMember(member)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Shield size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-slate-50 rounded-full">
                            <Users className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-slate-500 font-medium">No members found matching your search.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Role Assignment Panel */}
        <div className="space-y-6">
          <div className={`bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden transition-all duration-500 ${selectedMember ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-50 pointer-events-none translate-y-4'}`}>
            <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
               {/* Decorative elements */}
              <div className="absolute top-0 right-0 p-4 opacity-10 translate-x-1/4 -translate-y-1/4">
                <Shield size={120} />
              </div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Assign Roles</h2>
                <p className="text-slate-300 text-sm mt-1">
                  {selectedMember ? `Modifying privileges for ${selectedMember.first_name}` : 'Select a member to manage roles'}
                </p>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Member Info Card */}
              {selectedMember && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg">
                    {selectedMember.first_name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{selectedMember.first_name} {selectedMember.last_name}</p>
                    <p className="text-xs text-slate-500 font-medium">{selectedMember.email}</p>
                  </div>
                </div>
              )}

              {/* Roles Selection */}
              <div className="space-y-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Available Privileges
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {dynamicRoles.map((roleName) => (
                    <button
                      key={roleName}
                      onClick={() => handleRoleToggle(roleName)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        selectedMember?.roles?.includes(roleName)
                          ? 'bg-blue-50 border-blue-200 text-blue-900 ring-4 ring-blue-50'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${selectedMember?.roles?.includes(roleName) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <Shield size={16} />
                        </div>
                        <span className="font-bold text-sm capitalize">{roleName.replace(/_/g, ' ')}</span>
                      </div>
                      {selectedMember?.roles?.includes(roleName) && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRoles}
                  disabled={isUpdating}
                  className="flex-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-900/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Apply Changes</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex gap-4">
             <div className="shrink-0">
               <AlertCircle className="w-6 h-6 text-amber-600" />
             </div>
             <div>
               <p className="text-sm font-bold text-amber-900">Security Note</p>
               <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                 Administrative roles grant access to sensitive data and management functions. ONLY assign roles to trusted officials. Supreme Admin role grants full system control.
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Settings - System Configurations */}
      <HireSettingsSection />
    </div>
  );
}

/* ═══════════════════════════════════════════
   HIRE SETTINGS — saved to database (shared)
   ═══════════════════════════════════════════ */
function HireSettingsSection() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phones, setPhones] = useState({
    chairs_handler_phone: '',
    instruments_handler_phone: '',
    hire_admin_phone: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/settings');
      const data = response.data;
      setSettings(data);
      setPhones({
        chairs_handler_phone: data.chairs_handler_phone || '',
        instruments_handler_phone: data.instruments_handler_phone || '',
        hire_admin_phone: data.hire_admin_phone || '',
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/settings', phones);
      // Also sync to localStorage as backup for the HireModal
      localStorage.setItem('csa_chairs_handler_phone', phones.chairs_handler_phone);
      localStorage.setItem('csa_instruments_handler_phone', phones.instruments_handler_phone);
      localStorage.setItem('csa_hire_admin_phone', phones.hire_admin_phone);
      toast.success('Phone numbers saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mt-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
          <Phone className="w-6 h-6" />
          Hire Request Admin Numbers
        </h2>
        <p className="text-blue-100 text-sm mt-2">
          Configure who receives WhatsApp messages when a hire request is submitted. These numbers are shared across all admin users.
        </p>
      </div>

      <div className="p-8 space-y-6">
        {/* Chairs Handler */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Chairs Handler Phone</label>
          <p className="text-xs text-slate-400">Receives WhatsApp messages for chair hire requests.</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={phones.chairs_handler_phone}
              onChange={(e) => setPhones(prev => ({ ...prev, chairs_handler_phone: e.target.value }))}
              placeholder="e.g. 254712345678"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
            />
          </div>
        </div>

        {/* Instruments Handler */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Instruments Handler Phone</label>
          <p className="text-xs text-slate-400">Receives WhatsApp messages for instrument hire requests.</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={phones.instruments_handler_phone}
              onChange={(e) => setPhones(prev => ({ ...prev, instruments_handler_phone: e.target.value }))}
              placeholder="e.g. 254798765432"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
            />
          </div>
        </div>

        {/* Default Admin */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Default Hire Admin Phone</label>
          <p className="text-xs text-slate-400">Fallback number if no category-specific handler is set.</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={phones.hire_admin_phone}
              onChange={(e) => setPhones(prev => ({ ...prev, hire_admin_phone: e.target.value }))}
              placeholder="e.g. 254112051739"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={loadSettings}
            className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition text-sm"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Phone Numbers</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
