import { UserPlus, Bell, BookOpen, Save, Loader2 } from "lucide-react";
import { memberService } from "../../../api/jumuiyaMemberService";
import AdminNotifications from "../../Jumuiya/admin/AdminNotifications";
import AdminAbout from "../../Jumuiya/admin/AdminAbout";
import AdminOfficials from "../../Jumuiya/admin/AdminOfficials";
import AdminMembers from "../../Jumuiya/admin/AdminMembers";
import AdminRegisteredMembers from "../../Jumuiya/admin/AdminRegisteredMembers";
import AdminActivities from "../../Jumuiya/admin/AdminActivities";


interface Props {
  jumuiyaId: string;
  jumuiyaName: string;
  jumuiyaColor: string;
}

export default function JumuiyaQuickManager({ jumuiyaId, jumuiyaName, jumuiyaColor }: Props) {
  const [activeSection, setActiveSection] = useState<"register" | "notifications" | "about">("register");
  const [memberForm, setMemberForm] = useState({
    name: "",
    reg_number: "",
    email: "",
    phone: "",
    gender: "",
    academic_year: "",
  });
  const [saving, setSaving] = useState(false);

  const sections = [
    { id: "register" as const, label: "Register Member", icon: <UserPlus size={18} />, color: "indigo" as const },
    { id: "notifications" as const, label: "Notifications", icon: <Bell size={18} />, color: "amber" as const },
    { id: "about" as const, label: "About", icon: <BookOpen size={18} />, color: "emerald" as const },
  ];

  const getSectionContent = () => {
    switch (activeSection) {
      case "register":
        return (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <UserPlus size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">New Member Registration</h3>
                <p className="text-sm text-slate-500">Register a new member to {jumuiyaName}</p>
              </div>
            </div>

            <form onSubmit={handleMemberSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Registration Number *</label>
                  <input
                    type="text"
                    value={memberForm.reg_number}
                    onChange={(e) => setMemberForm(p => ({ ...p, reg_number: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. REG123"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. +254 123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                  <select
                    value={memberForm.gender}
                    onChange={(e) => setMemberForm(p => ({ ...p, gender: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Academic Year</label>
                  <input
                    type="text"
                    value={memberForm.academic_year}
                    onChange={(e) => setMemberForm(p => ({ ...p, academic_year: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 2024"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  {saving ? "Registering..." : "Register Member"}
                </button>
              </div>
            </form>
          </div>
        );
      case 'notifications':
        return <AdminNotifications selectedId={jumuiyaId} />;
      case 'about':
        return <AdminAbout selectedId={jumuiyaId} />;
      default:
        return null;
    }
  };

  const colorMap = {
    indigo: { bg: "bg-indigo-500", light: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-200", border: "border-indigo-200" },
    purple: { bg: "bg-purple-500", light: "bg-purple-50", text: "text-purple-600", ring: "ring-purple-200", border: "border-purple-200" },
    amber: { bg: "bg-amber-500", light: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-200", border: "border-amber-200" },
    emerald: { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200", border: "border-emerald-200" },
  };

  return (
    <div>
      {/* Section Selector - Card Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const colors = colorMap[section.color];
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-200 ${
                isActive
                  ? `${colors.light} border-transparent ring-2 ${colors.ring} shadow-lg transform -translate-y-1`
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all ${
                isActive ? `${colors.bg} text-white shadow-md` : "bg-slate-100 text-slate-400"
              }`}>
                {section.icon}
              </div>
              <h3 className={`font-bold text-sm ${isActive ? colors.text : "text-slate-700"}`}>
                {section.label}
              </h3>
              {isActive && (
                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full ${colors.bg}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        {/* Register Member */}
        {activeSection === "register" && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <UserPlus size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Register New Member</h3>
                <p className="text-sm text-slate-500">Manually add a member to {jumuiyaName}</p>
              </div>
            </div>

            <form onSubmit={handleMemberSubmit} className="space-y-6 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2.5">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={memberForm.reg_number}
                    onChange={(e) => setMemberForm({ ...memberForm, reg_number: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    placeholder="e.g., REG/2024/001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2.5">Email Address</label>
                  <input
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2.5">Phone Number</label>
                  <input
                    type="tel"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    placeholder="+254 700 000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2.5">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={memberForm.gender}
                    onChange={(e) => setMemberForm({ ...memberForm, gender: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2.5">Academic Year</label>
                  <input
                    type="text"
                    value={memberForm.academic_year}
                    onChange={(e) => setMemberForm({ ...memberForm, academic_year: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    placeholder="e.g., Year 1"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2.5"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Register Member
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMemberForm({ name: "", reg_number: "", email: "", phone: "", gender: "", academic_year: "" })}
                  className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Gallery Upload */}
        {activeSection === "gallery" && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Image size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Gallery Management</h3>
                <p className="text-sm text-slate-500">Upload and manage photos for {jumuiyaName}</p>
              </div>
            </div>
            <AdminGallery selectedId={jumuiyaId} />
          </div>
        )}

        {/* Notifications */}
        {activeSection === "notifications" && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Bell size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Notifications & Announcements</h3>
                <p className="text-sm text-slate-500">Create and manage announcements for {jumuiyaName}</p>
              </div>
            </div>
            <AdminNotifications selectedId={jumuiyaId} />
          </div>
        )}

        {/* About */}
        {activeSection === "about" && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">About {jumuiyaName}</h3>
                <p className="text-sm text-slate-500">Edit description and saint biography</p>
              </div>
            </div>
            <AdminAbout selectedId={jumuiyaId} />
          </div>
        )}
      </div>
    </div>
  );
}
