import React, { useState, useEffect, useCallback, useRef } from 'react';
import PhoneInput from 'react-phone-number-input/input';
import { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Upload, X, Check, BarChart2, Search, UserCheck } from 'lucide-react';
import { POSITION_BY_CATEGORY, JUMUIYA_OPTIONS, JUMUIYA_ROLES, JUMUIYA_COLORS } from '../constants/adminConstants';
import { resizeImage } from '../../../utils/imageOptimization';
import { memberService } from '../../../api/jumuiyaMemberService';

interface OfficialFormSectionProps {
 onSubmit: (formData: FormData) => Promise<void>;
 isSubmitting: boolean;
 displayTerm?: string;
 officialsExist: boolean;
 mode?: 'csa' | 'jumuiya';
 allOfficials?: any[];
}

export function OfficialFormSection({ onSubmit, isSubmitting, displayTerm, officialsExist, mode = 'csa', allOfficials = [] }: OfficialFormSectionProps) {
 const [name, setName] = useState('');
 const [category, setCategory] = useState('');
 const [position, setPosition] = useState('');
 const [contact, setContact] = useState('');
 const [contactError, setContactError] = useState('');
 const [termOfService, setTermOfService] = useState('');
 const [photo, setPhoto] = useState<File | null>(null);
 const [preview, setPreview] = useState<string | null>(null);
 const [showProgressModal, setShowProgressModal] = useState(false);
 const [regNumber, setRegNumber] = useState('');
 const [lookupResults, setLookupResults] = useState<any[]>([]);
 const [lookupLoading, setLookupLoading] = useState(false);
 const [lookupError, setLookupError] = useState('');
 const [showLookupDropdown, setShowLookupDropdown] = useState(false);
 const [memberFound, setMemberFound] = useState(false);
 const lookupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 const dropdownRef = useRef<HTMLDivElement>(null);

  const categoryStats = React.useMemo(() => {
    const stats: Record<string, { count: number; limit: number; isFull: boolean }> = {};
    if (mode === 'csa') {
      Object.keys(POSITION_BY_CATEGORY).forEach(cat => {
        const limit = POSITION_BY_CATEGORY[cat]?.length || 0;
        const count = allOfficials.filter((o: any) => o.category === cat && o.status !== 'archived').length;
        stats[cat] = { count, limit, isFull: count >= limit };
      });
    } else {
      JUMUIYA_OPTIONS.forEach(cat => {
        const limit = JUMUIYA_ROLES.length; // 8
        const count = allOfficials.filter((o: any) => o.category === cat && o.status !== 'archived').length;
        stats[cat] = { count, limit, isFull: count >= limit };
      });
    }
    return stats;
  }, [allOfficials, mode]);

 useEffect(() => {
 if (displayTerm) {
 setTermOfService(displayTerm);
 }
 }, [displayTerm]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowLookupDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

 const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0] || null;
 setPhoto(file);
 if (file) {
 const reader = new FileReader();
 reader.onloadend = () => setPreview(reader.result as string);
 reader.readAsDataURL(file);
 } else {
 setPreview(null);
 }
 };

 const regLookup = useCallback(async (value: string) => {
   if (value.trim().length < 2) {
     setLookupResults([]);
     setLookupError('');
     setMemberFound(false);
     setShowLookupDropdown(false);
     return;
   }
   setLookupLoading(true);
   setLookupError('');
   try {
     const res = await memberService.lookupMemberByRegNumber(value.trim());
     const data = res.data || [];
     setLookupResults(data);
     if (data.length === 1) {
       const m = data[0];
       setName(`${m.first_name} ${m.last_name}`);
       if (m.phone) setContact(m.phone);
       setMemberFound(true);
       setShowLookupDropdown(false);
     } else if (data.length > 1) {
       setShowLookupDropdown(true);
       setMemberFound(false);
     } else {
       setLookupError('No member found with that registration number');
       setMemberFound(false);
       setShowLookupDropdown(false);
     }
   } catch {
     setLookupError('Lookup failed');
   } finally {
     setLookupLoading(false);
   }
 }, []);

 const handleRegNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const val = e.target.value;
   setRegNumber(val);
   setMemberFound(false);
   if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
   lookupTimerRef.current = setTimeout(() => regLookup(val), 500);
 };

 const selectLookupResult = (m: any) => {
   setName(`${m.first_name} ${m.last_name}`);
   if (m.phone) setContact(m.phone);
   setMemberFound(true);
   setShowLookupDropdown(false);
   setLookupResults([]);
 };

 const clearMemberLink = () => {
   setRegNumber('');
   setMemberFound(false);
   setLookupResults([]);
   setLookupError('');
 };

 const availableJumuiyaRoles = React.useMemo(() => {
 if (mode !== 'jumuiya' || !category) return JUMUIYA_ROLES;
 const occupiedRoles = allOfficials
 .filter(o => o.category === category)
 .map(o => o.position);
 return JUMUIYA_ROLES.filter(role => !occupiedRoles.includes(role));
 }, [mode, category, allOfficials]);

 const availableCSARoles = React.useMemo(() => {
 if (mode !== 'csa' || !category) return POSITION_BY_CATEGORY[category] || [];
 const occupiedRoles = allOfficials
 .filter(o => o.category === category)
 .map(o => o.position);
 return (POSITION_BY_CATEGORY[category] || []).filter(role => !occupiedRoles.includes(role));
 }, [mode, category, allOfficials]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 const fd = new FormData();
 fd.append('name', name);
 fd.append('category', category);
 fd.append('position', position);
 if (contact) fd.append('contact', contact);
 if (termOfService) fd.append('term_of_service', termOfService);
 if (regNumber.trim()) fd.append('reg_number', regNumber.trim());

 if (photo) {
 const optimizedPhotoBlob = await resizeImage(photo);
 fd.append('photo', optimizedPhotoBlob, 'photo.jpg');
 }

 onSubmit(fd);
 
 // Reset form
 setName('');
 setCategory('');
 setPosition('');
 setContact('');
 setPhoto(null);
 setPreview(null);
 setRegNumber('');
 setMemberFound(false);
 setLookupResults([]);
 setLookupError('');
 } catch (err) {
 console.error('Submission error:', err);
 }
 };

 const termMismatch = officialsExist && termOfService && termOfService !== displayTerm;
 const isInvalid = !name || !category || !position || !!contactError || isSubmitting || !!termMismatch;

 return (
 <div className="mb-12 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-colors">
 <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center">
 <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
 <Upload className="w-6 h-6" />
 Add New Official
 </h2>
 </div>
 
 <form onSubmit={handleSubmit} className="p-8">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2" ref={dropdownRef}>
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-gray-400" />
                      Registration Number <span className="text-xs font-normal text-gray-400">(type middle digits to auto-fill)</span>
                    </label>
                    <div className="relative">
                      <input
                        value={regNumber}
                        onChange={handleRegNumberChange}
                        placeholder="e.g. 23412"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all outline-none"
                      />
                      {lookupLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {memberFound && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                          <UserCheck className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    {lookupError && <div className="text-red-500 text-xs font-medium flex items-center gap-1"><X className="w-3 h-3" />{lookupError}</div>}
                    {memberFound && (
                      <div className="text-green-600 text-xs font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />Member found — name & phone auto-filled
                        <button type="button" onClick={clearMemberLink} className="ml-2 text-red-500 hover:text-red-700 underline text-[10px]">Clear</button>
                      </div>
                    )}
                    {showLookupDropdown && lookupResults.length > 1 && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        {lookupResults.map((m: any, i: number) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => selectLookupResult(m)}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-gray-100 last:border-0 text-sm"
                          >
                            <span className="font-medium text-gray-900">{m.first_name} {m.last_name}</span>
                            <span className="text-gray-500 ml-2 text-xs">{m.member_id}</span>
                            {m.phone && <span className="text-gray-400 ml-2 text-xs">{m.phone}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 ">Name *</label>
                    <input 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="Auto-filled from member lookup" 
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all outline-none" 
                      required 
                    />
                  </div>

 <div className="space-y-2">
 <div className="flex justify-between items-center mb-1">
 <label className="block text-sm font-semibold text-gray-700 ">{mode === 'jumuiya' ? 'Jumuiya *' : 'Category *'}</label>
 {mode === 'jumuiya' && (
 <button 
 type="button" 
 onClick={() => setShowProgressModal(true)} 
 className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
 >
 <BarChart2 className="w-3.5 h-3.5" />
 Progress
 </button>
 )}
 </div>
  <select 
  value={category} 
  onChange={e => { setCategory(e.target.value); setPosition(''); }} 
  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 outline-none appearance-none font-medium" 
  required
  >
  <option value="">{mode === 'jumuiya' ? 'Select Jumuiya' : 'Select category'}</option>
  {mode === 'csa' 
  ? Object.keys(POSITION_BY_CATEGORY).map(k => {
      const stats = categoryStats[k];
      const label = stats?.isFull ? `${k} (Full) ✔` : `${k} (${stats?.count || 0}/${stats?.limit || 0})`;
      return <option key={k} value={k}>{label}</option>;
    })
  : JUMUIYA_OPTIONS.map(k => {
      const stats = categoryStats[k];
      const label = stats?.isFull ? `${k} (Full) ✔` : `${k} (${stats?.count || 0}/8)`;
      return <option key={k} value={k}>{label}</option>;
    })
  }
  </select>
  {category && categoryStats[category] && (
    <div className="mt-1.5 flex items-center justify-between px-1">
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status:</span>
      <span className={`text-[11px] font-bold flex items-center gap-1.5 ${categoryStats[category].isFull ? 'text-green-600' : 'text-blue-600'}`}>
        {categoryStats[category].isFull ? (
          <>
            <span className="inline-flex items-center justify-center w-4 h-4 bg-green-100 text-green-700 rounded-full text-[10px] font-black">✔</span>
            Fully Registered ({categoryStats[category].count}/{categoryStats[category].limit})
          </>
        ) : (
          `Available (${categoryStats[category].count}/${categoryStats[category].limit} filled)`
        )}
      </span>
    </div>
  )}
  </div>

 <div className="space-y-2">
 <label className="block text-sm font-semibold text-gray-700 ">Position *</label>
 <select 
 value={position} 
 onChange={e => setPosition(e.target.value)} 
 className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 outline-none disabled:bg-gray-50 :bg-gray-800" 
 required 
 disabled={!category}
 >
 <option value="">Select position/role</option>
 {mode === 'csa'
 ? (category && availableCSARoles.map(p => <option key={p} value={p}>{p}</option>))
 : (category && availableJumuiyaRoles.map(p => <option key={p} value={p}>{p}</option>))
 }
 </select>
 </div>

 <div className="space-y-2">
 <label className="block text-sm font-semibold text-gray-700 ">Phone</label>
 <PhoneInput 
 country="KE" 
 international 
 value={contact || undefined} 
 onChange={(val: any) => { setContact(val || ''); setContactError(val && !isValidPhoneNumber(val) ? 'Invalid' : ''); }} 
 className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 flex text-gray-900 " 
 placeholder="e.g. +254 ..." 
 />
 {contactError && <div className="text-red-500 text-xs mt-1 font-medium">{contactError}</div>}
 </div>

 <div className="space-y-2">
 <label className="block text-sm font-semibold text-gray-700 ">Term of Service</label>
 <input 
 value={termOfService} 
 onChange={e => setTermOfService(e.target.value)} 
 placeholder="e.g. 2024-2025" 
 className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 outline-none" 
 />
 {officialsExist && displayTerm && (
 <>
 <div className="flex items-center justify-between gap-1 mt-1">
 <p className={`text-[11px] font-medium italic flex items-center gap-1 ${termMismatch ? 'text-red-500' : 'text-blue-600 '}`}>
 {termMismatch ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
 {termMismatch 
 ? `Error: Must match ${displayTerm}`
 : `Pre-filled to match current term (${displayTerm})`
 }
 </p>
 {termMismatch && (
 <button 
 type="button"
 onClick={() => setTermOfService(displayTerm)}
 className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full hover:bg-red-600 transition-colors"
 >
 FIX
 </button>
 )}
 </div>
 {termMismatch && (
 <p className="text-[10px] text-red-400 leading-tight mt-1">
 To use a new year, please archive the current officials first.
 </p>
 )}
 </>
 )}
 </div>

 <div className="space-y-2">
 <label className="block text-sm font-semibold text-gray-700 ">Photo (Optional)</label>
 <div className="relative">
 <input 
 type="file" 
 accept="image/*" 
 onChange={handlePhotoChange} 
 className="hidden" 
 id="photo-upload"
 />
 <label 
 htmlFor="photo-upload" 
 className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${preview ? 'border-blue-500 bg-blue-50 ' : 'border-gray-300 hover:border-blue-400 :border-blue-500 hover:bg-gray-50 :bg-gray-700/50'}`}
 >
 {preview ? (
 <>
 <img src={preview} alt="Preview" className="w-8 h-8 rounded-full object-cover" />
 <span className="text-sm font-medium text-blue-700 truncate">{photo?.name}</span>
 </>
 ) : (
 <>
 <Upload className="w-5 h-5 text-gray-400" />
 <span className="text-sm text-gray-500 ">Upload photo...</span>
 </>
 )}
 </label>
 {preview && (
 <button 
 type="button"
 onClick={() => { setPhoto(null); setPreview(null); }}
 className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 transition-colors"
 >
 <X className="w-3 h-3" />
 </button>
 )}
 </div>
 </div>
 </div>

 <div className="mt-10 flex flex-col sm:flex-row justify-end items-center gap-4">
 <p className="text-xs text-gray-400 order-2 sm:order-1">* Required fields</p>
 <button 
 type="submit" 
 disabled={isInvalid} 
 className={`w-full sm:w-auto px-10 py-3.5 font-black text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 order-1 sm:order-2 ${isInvalid ? 'bg-gray-300 cursor-not-allowed opacity-50' : 'bg-blue-600 hover:bg-blue-700 :bg-blue-600 hover:shadow-blue-200 :shadow-none active:scale-[0.98]'}`}
 >
 {isSubmitting ? (
 <>
 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 Processing...
 </>
 ) : (
 <>
 <Check className="w-5 h-5" />
 Add Official
 </>
 )}
 </button>
 </div>
 </form>

 {showProgressModal && mode === 'jumuiya' && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
 <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
 <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white flex justify-between items-center">
 <div className="flex items-center gap-2">
 <BarChart2 className="w-5 h-5" />
 <h3 className="font-bold text-lg">Jumuiya Registration</h3>
 </div>
 <button onClick={() => setShowProgressModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>
 <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
 {JUMUIYA_OPTIONS.map(j => {
 const count = allOfficials.filter((o: any) => o.category === j).length;
 const progress = (count / 8) * 100;
 const isComplete = count >= 8;
 return (
 <div key={j} className="flex flex-col gap-1.5 group">
 <div className="flex justify-between items-center text-sm font-bold">
 <span className="text-gray-700 group-hover:text-blue-600 transition-colors">{j}</span>
 <span className={`px-2 py-0.5 rounded-md ${isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
 {count} / 8 <span className="font-medium text-xs">Officials</span>
 </span>
 </div>
 <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
 <div 
 className={`h-full bg-gradient-to-r ${isComplete ? 'from-green-500 to-green-600' : JUMUIYA_COLORS[j] || 'from-blue-500 to-blue-600'} transition-all duration-1000 ease-out`} 
 style={{ width: `${Math.min(progress, 100)}%` }}
 ></div>
 </div>
 </div>
 );
 })}
 </div>
 <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
 <button 
 onClick={() => setShowProgressModal(false)}
 className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors text-sm"
 >
 Close
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}