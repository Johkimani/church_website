import { useEffect, useState } from 'react';
import { Phone, Save, Loader2, Smartphone, Headphones, Building2, RotateCcw, MapPin, MessageSquareText } from 'lucide-react';
import { apiClient } from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';

export default function HireSettingsSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phones, setPhones] = useState({
    chairs_handler_phone: '',
    instruments_handler_phone: '',
    hire_admin_phone: '',
    hire_pickup_location: '',
    hire_pickup_instructions: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/settings');
      const data = response.data;
      setPhones({
        chairs_handler_phone: data.chairs_handler_phone || '',
        instruments_handler_phone: data.instruments_handler_phone || '',
        hire_admin_phone: data.hire_admin_phone || '',
        hire_pickup_location: data.hire_pickup_location || '',
        hire_pickup_instructions: data.hire_pickup_instructions || '',
      });
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/settings', phones);
      localStorage.setItem('csa_chairs_handler_phone', phones.chairs_handler_phone);
      localStorage.setItem('csa_instruments_handler_phone', phones.instruments_handler_phone);
      localStorage.setItem('csa_hire_admin_phone', phones.hire_admin_phone);

      toast.success('Phone numbers saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-center py-8">
          <Loader2 size={18} className="animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const fields = [
    { key: 'chairs_handler_phone', label: 'Chairs Handler', desc: 'WhatsApp for chair hire requests.', icon: Smartphone, placeholder: '254712345678' },
    { key: 'instruments_handler_phone', label: 'Instruments Handler', desc: 'WhatsApp for instrument hire requests.', icon: Headphones, placeholder: '254798765432' },
    { key: 'hire_admin_phone', label: 'Default Hire Admin', desc: 'Fallback if no handler set.', icon: Building2, placeholder: '254112051739' },
  ] as const;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-14 w-16 h-16 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            Admin Contact Numbers
          </h2>
          <p className="text-blue-100 text-xs mt-1 ml-[42px]">Configure phone numbers for hire inquiries.</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          {fields.map(({ key, label, desc, icon: Icon, placeholder }) => (
            <div key={key} className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Icon size={13} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">{label}</label>
                  <p className="text-[10px] text-slate-700">{desc}</p>
                </div>
              </div>
              <input type="text" value={(phones as any)[key]} onChange={(e) => setPhones((prev) => ({ ...prev, [key]: e.target.value }))} placeholder={placeholder} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs transition" />
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
            <MapPin size={14} className="text-blue-600" /> Pickup Settings
          </h3>
          <p className="text-xs text-slate-500 mb-4">These details are sent to customers via SMS after successful M-Pesa payment.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <MapPin size={13} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Pickup Location</label>
                  <p className="text-[10px] text-slate-700">Where customers pick up hired items</p>
                </div>
              </div>
              <input type="text" value={phones.hire_pickup_location} onChange={(e) => setPhones(prev => ({ ...prev, hire_pickup_location: e.target.value }))} placeholder="e.g. St. Joseph's Church, Parish Hall" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs transition" />
            </div>
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <MessageSquareText size={13} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Pickup Instructions</label>
                  <p className="text-[10px] text-slate-700">Additional SMS instructions</p>
                </div>
              </div>
              <textarea value={phones.hire_pickup_instructions} onChange={(e) => setPhones(prev => ({ ...prev, hire_pickup_instructions: e.target.value }))} placeholder="e.g. Bring your ID. Call the admin 30 mins before arrival." rows={2} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs transition resize-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
          <button onClick={loadSettings} className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-50 transition-all text-xs">
            <RotateCcw size={12} /> Reset
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg shadow-sm shadow-blue-200 transition-all text-xs disabled:opacity-50">
            {saving ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : <><Save size={12} /> Save Numbers</>}
          </button>
        </div>
      </div>
    </div>
  );
}
