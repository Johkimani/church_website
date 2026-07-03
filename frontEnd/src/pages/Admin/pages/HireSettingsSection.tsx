import React, { useEffect, useState } from 'react';
import { Phone, Save, Loader2 } from 'lucide-react';
import { apiClient } from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';

export default function HireSettingsSection() {
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
      setPhones({
        chairs_handler_phone: data.chairs_handler_phone || '',
        instruments_handler_phone: data.instruments_handler_phone || '',
        hire_admin_phone: data.hire_admin_phone || '',
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
          Configure who receives WhatsApp messages when a hire request is submitted.
        </p>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Chairs Handler Phone</label>
          <p className="text-xs text-slate-400">Receives WhatsApp messages for chair hire requests.</p>
          <input
            type="text"
            value={phones.chairs_handler_phone}
            onChange={(e) => setPhones((prev) => ({ ...prev, chairs_handler_phone: e.target.value }))}
            placeholder="e.g. 254712345678"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Instruments Handler Phone</label>
          <p className="text-xs text-slate-400">Receives WhatsApp messages for instrument hire requests.</p>
          <input
            type="text"
            value={phones.instruments_handler_phone}
            onChange={(e) => setPhones((prev) => ({ ...prev, instruments_handler_phone: e.target.value }))}
            placeholder="e.g. 254798765432"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Default Hire Admin Phone</label>
          <p className="text-xs text-slate-400">Fallback number if no category-specific handler is set.</p>
          <input
            type="text"
            value={phones.hire_admin_phone}
            onChange={(e) => setPhones((prev) => ({ ...prev, hire_admin_phone: e.target.value }))}
            placeholder="e.g. 254112051739"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
          />
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