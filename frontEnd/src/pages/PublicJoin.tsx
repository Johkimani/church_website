import React, { useState, useEffect } from "react";
import {
  User,
  Hash,
  Mail,
  Phone,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { apiClient } from "../api/axiosInstance";

const checkDuplicate = (params: { regNumber?: string; email?: string }) =>
  apiClient.get("/jumuiya/join/check-duplicate", { params }).then((r) => r.data);

const submitJoin = (data: {
  name: string;
  regNumber: string;
  gender: string;
  email?: string;
  phone: string;
  course: string;
}) => apiClient.post("/jumuiya/join/submit", data).then((r) => r.data);

export default function PublicJoin() {
  const [formData, setFormData] = useState({
    name: "",
    regNumber: "",
    gender: "",
    email: "",
    phone: "",
    course: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [duplicateStatus, setDuplicateStatus] = useState<{
    regNumber?: { isDup: boolean; message: string };
    email?: { isDup: boolean; message: string };
  }>({});
  const [checkingDup, setCheckingDup] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{
    name: string;
    regNumber: string;
    date: string;
  } | null>(null);

  // Live duplicate check debounced
  useEffect(() => {
    const reg = formData.regNumber.trim();
    const mail = formData.email.trim();
    if (!reg && !mail) return;

    const timer = setTimeout(async () => {
      setCheckingDup(true);
      try {
        const res = await checkDuplicate({
          regNumber: reg || undefined,
          email: mail || undefined,
        });
        if (res?.isDuplicate) {
          if (res.field === "regNumber") {
            setDuplicateStatus((prev) => ({
              ...prev,
              regNumber: { isDup: true, message: res.message },
            }));
          } else if (res.field === "email") {
            setDuplicateStatus((prev) => ({
              ...prev,
              email: { isDup: true, message: res.message },
            }));
          }
        } else {
          setDuplicateStatus({});
        }
      } catch {
        /* background check failure — ignore */
      } finally {
        setCheckingDup(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [formData.regNumber, formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "regNumber" ? value.toUpperCase() : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError(null);
    if (name === "regNumber") setDuplicateStatus((prev) => ({ ...prev, regNumber: undefined }));
    if (name === "email") setDuplicateStatus((prev) => ({ ...prev, email: undefined }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Please enter your full name";
    } else if (formData.name.trim().split(" ").length < 2) {
      errors.name = "Please provide at least first and last name";
    }

    if (!formData.regNumber.trim()) {
      errors.regNumber = "Registration number is required";
    } else if (formData.regNumber.length < 5) {
      errors.regNumber = "Please enter a valid registration number";
    }

    if (!formData.gender) {
      errors.gender = "Please select your gender";
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address";
      }
    }

    const cleanPhone = formData.phone.replace(/[\s\-()]/g, "");
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (cleanPhone.length < 9 || cleanPhone.length > 13) {
      errors.phone = "Enter a valid phone number (e.g. 0712345678)";
    }

    if (!formData.course.trim()) {
      errors.course = "Please enter your course or programme";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validateForm()) return;

    if (duplicateStatus.regNumber?.isDup) {
      setSubmitError(duplicateStatus.regNumber.message);
      return;
    }
    if (duplicateStatus.email?.isDup) {
      setSubmitError(duplicateStatus.email.message);
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitJoin({
        name: formData.name.trim(),
        regNumber: formData.regNumber.trim(),
        gender: formData.gender,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        course: formData.course.trim(),
      });
      setSubmitted({
        name: res.data.name,
        regNumber: res.data.regNumber,
        date: res.data.date,
      });
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit. Please try again.";
      setSubmitError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Confirmation Screen ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-emerald-50/30 py-8 px-4 flex flex-col justify-center items-center">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 size={36} />
            </div>

            <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 mb-2">
              Registration Received
            </span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Thank you, {submitted.name}!
            </h2>
            <p className="text-sm text-slate-600 mt-3 max-w-sm mx-auto leading-relaxed">
              Your details have been submitted successfully. The Jumuiya coordinator
              will review your registration and assign you to a community shortly.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 my-6 border border-slate-200/80 text-left space-y-2 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Reg Number:</span>
                <span className="font-bold text-slate-900">{submitted.regNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submission Date:</span>
                <span className="font-medium text-slate-700">{submitted.date}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed">
              <p className="font-bold mb-1">What happens next?</p>
              <p>
                The Jumuiya coordinator will review your details and assign you to a Jumuiya.
                You will be able to log in using your Registration Number as your initial password.
                Visit <span className="font-bold">csakyu.com</span> to learn more about CSA Kirinyaga.
              </p>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-6">
            Catholic Students Association &middot; Kirinyaga Chapter
          </p>
        </div>
      </div>
    );
  }

  // ── Registration Form ──
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/30 py-8 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-lg">
        {/* Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 border border-slate-200/80 mb-5">
          <div className="h-28 sm:h-32 relative flex items-end p-5 text-white overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-black" />
            <div className="relative z-10 w-full flex items-center justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/20 backdrop-blur-md text-white border border-white/30">
                  <ShieldCheck size={12} /> CSA Kirinyaga
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white drop-shadow-sm">
                  New Member Registration
                </h1>
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md p-1 border-2 border-white/40 shadow-lg shrink-0 overflow-hidden">
                <img
                  src="/images/csa-logo.jpg"
                  alt="CSA Kirinyaga"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck size={13} />
              </span>
              <span className="text-slate-300">
                Fill in your details below to <span className="text-white font-bold">register</span>
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-200/60 space-y-5"
        >
          <div>
            <h2 className="text-lg font-bold text-slate-800">Student Information</h2>
            <p className="text-xs text-slate-500">
              Provide your accurate details so the Jumuiya coordinator can add you to the system.
            </p>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-red-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1">
                <p className="font-bold text-red-800">Registration Error</p>
                <p className="mt-0.5 leading-relaxed">{submitError}</p>
              </div>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Francis Mwangi Mutua"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none transition-all ${
                  fieldErrors.name
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
              />
            </div>
            {fieldErrors.name && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.name}</p>}
          </div>

          {/* Registration Number */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Registration Number <span className="text-red-500">*</span>
              </label>
              {checkingDup && (
                <span className="text-[10px] text-indigo-500 font-medium animate-pulse">
                  Checking records...
                </span>
              )}
            </div>
            <div className="relative">
              <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="regNumber"
                value={formData.regNumber}
                onChange={handleChange}
                placeholder="e.g. CT102/A/2025/01"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-mono uppercase text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none transition-all ${
                  fieldErrors.regNumber || duplicateStatus.regNumber?.isDup
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
              />
            </div>
            {fieldErrors.regNumber && (
              <p className="text-[11px] text-red-500 mt-1">{fieldErrors.regNumber}</p>
            )}
            {duplicateStatus.regNumber?.isDup && (
              <p className="text-[11px] font-semibold text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {duplicateStatus.regNumber.message}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, gender: "Male" }));
                  setFieldErrors((prev) => ({ ...prev, gender: "" }));
                }}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  formData.gender === "Male"
                    ? "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-100 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="text-base">♂</span> Male
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, gender: "Female" }));
                  setFieldErrors((prev) => ({ ...prev, gender: "" }));
                }}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  formData.gender === "Female"
                    ? "bg-pink-50 border-pink-500 text-pink-700 ring-2 ring-pink-100 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="text-base">♀</span> Female
              </button>
            </div>
            {fieldErrors.gender && (
              <p className="text-[11px] text-red-500 mt-1">{fieldErrors.gender}</p>
            )}
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. francis@example.com"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none transition-all ${
                  fieldErrors.email || duplicateStatus.email?.isDup
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[11px] text-red-500 mt-1">{fieldErrors.email}</p>
            )}
            {duplicateStatus.email?.isDup && (
              <p className="text-[11px] font-semibold text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {duplicateStatus.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 0712345678"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none transition-all ${
                  fieldErrors.phone
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
              />
            </div>
            {fieldErrors.phone && (
              <p className="text-[11px] text-red-500 mt-1">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Course */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Course / Programme <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g. BSc Computer Science"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none transition-all ${
                  fieldErrors.course
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                }`}
              />
            </div>
            {fieldErrors.course && (
              <p className="text-[11px] text-red-500 mt-1">{fieldErrors.course}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-2xl text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900"
          >
            {submitting ? (
              <>
                <RefreshCw size={18} className="animate-spin" /> Submitting...
              </>
            ) : (
              <>
                Submit Registration <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          Catholic Students Association &middot; Kirinyaga Chapter &middot; Secured & Verified
        </p>
      </div>
    </div>
  );
}
