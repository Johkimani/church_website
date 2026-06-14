import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiClient, getApiErrorMessageFromError } from '../../../api/axiosInstance';
import { Shield, Users, Search, Save, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface Role {
  role_id: string;
  role_name: string;
  description: string;
}

interface Member {
  member_id: string;
  first_name: string;
  last_name: string;
  email: string;
  roles?: string[]; // Custom decorated field
}

export default function Settings() {
  const { user } = useAuth();
  const isSupremeAdmin = user?.role?.includes('Chairperson');

  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [memberRolesMap, setMemberRolesMap] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (isSupremeAdmin) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [isSupremeAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch members and general roles/permissions
      const [membersRes, rolesRes, userRolesRes] = await Promise.all([
        apiClient.get('/authentication/list-all-memebrs'),
        apiClient.get('/authentication/list-roles-permissions'),
        apiClient.get('/authentication/list-all-memebrs-roles-permisions')
      ]);

      setMembers(membersRes.data || []);
      setRoles(rolesRes.data.roles || []);

      // Build a map of member_id -> array of role names
      const map: Record<string, string[]> = {};
      
      if (Array.isArray(userRolesRes.data)) {
         userRolesRes.data.forEach((ur: any) => {
            if (!map[ur.member_id]) {
               map[ur.member_id] = [];
            }
            if (!map[ur.member_id].includes(ur.role_name)) {
               map[ur.member_id].push(ur.role_name);
            }
         });
      }
      setMemberRolesMap(map);

    } catch (error) {
      toast.error(getApiErrorMessageFromError(error) || 'Failed to fetch settings data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = (memberId: string, roleName: string) => {
    setMemberRolesMap(prev => {
      const currentRoles = prev[memberId] || [];
      const hasRole = currentRoles.includes(roleName);
      
      let newRoles;
      if (hasRole) {
        newRoles = currentRoles.filter(r => r !== roleName);
      } else {
        newRoles = [...currentRoles, roleName];
      }

      // Ensure everyone has at least Member role, though backend handles defaults, doing it safely on frontend
      return {
        ...prev,
        [memberId]: newRoles
      };
    });
  };

  const saveMemberRoles = async (member_id: string) => {
    setSavingId(member_id);
    try {
      const rolesToSave = memberRolesMap[member_id] || ['Member'];
      if(rolesToSave.length === 0) rolesToSave.push('Member');
      
      const res = await apiClient.post('/authentication/update-user-roles', {
        member_id,
        role_names: rolesToSave
      });
      toast.success(res.data?.message || 'Roles updated successfully');
    } catch (error) {
      toast.error(getApiErrorMessageFromError(error) || 'Failed to update roles');
    } finally {
      setSavingId(null);
    }
  };

  if (!isSupremeAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <Shield size={64} className="text-rose-400 mb-6" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Restricted</h2>
        <p className="text-slate-500 text-center max-w-md">
          You do not have sufficient permissions to view or edit system settings. 
          This area is restricted to the Supreme Admin (Chairperson).
        </p>
      </div>
    );
  }

  const filteredMembers = members.filter(m => 
    `${m.first_name} ${m.last_name} ${m.email} ${m.member_id}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Shield className="text-blue-600" />
            Role-Based Access Control
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage admin access and user permissions across the platform.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search members..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                  <th className="p-4 font-medium pl-6">Member</th>
                  <th className="p-4 font-medium">Assigned Roles</th>
                  <th className="p-4 font-medium text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500">
                      No members found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map(member => (
                    <tr key={member.member_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">
                            {member.first_name} {member.last_name}
                          </span>
                          <span className="text-xs text-slate-500">{member.email}</span>
                          <span className="text-xs text-slate-400 mt-0.5">{member.member_id}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {roles.map(role => {
                            const isAssigned = (memberRolesMap[member.member_id] || []).includes(role.role_name);
                            // Highlight admin roles
                            const isAdminRole = role.role_name !== 'Member';
                            
                            return (
                              <button
                                key={role.role_id}
                                onClick={() => handleRoleToggle(member.member_id, role.role_name)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  isAssigned 
                                    ? isAdminRole 
                                      ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500 border border-transparent hover:bg-slate-200'
                                }`}
                              >
                                {role.role_name.replace('_', ' ')}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right align-top">
                        <button
                          onClick={() => saveMemberRoles(member.member_id)}
                          disabled={savingId === member.member_id}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all focus:ring-2 focus:ring-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {savingId === member.member_id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Save size={16} />
                          )}
                          Save Roles
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Information block */}
      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex gap-4">
        <Info className="text-blue-600 shrink-0" size={24} />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">How Role Assignments Work</h3>
          <p className="text-blue-800/80 text-sm leading-relaxed max-w-3xl">
            Assigning roles automatically updates the sidebar navigation for that user. For example, 
            assigning the <b>Treasurer</b> role grants access to the Donation Monitor, while assigning 
            <b> Secretary</b> grants access to Community Management. Multiple roles can be assigned to a single member.
          </p>
        </div>
      </div>
    </div>
  );
}
