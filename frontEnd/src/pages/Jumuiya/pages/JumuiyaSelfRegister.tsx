import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  User,
  Hash,
  Mail,
  Phone,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Sparkles,
  Share2,
  ArrowRight,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { memberService } from "../../../api/jumuiyaMemberService";
import { jumuiyaList } from "../data/jumuiyaData";

const JUMUIYA_FALLBACKS: Record<
  string,
  {
    name: string;
    fullName: string;
    color: string;
    saintImage: string;
    quote: string;
    venue: string;
    time: string;
  }
> = {
  "st-anthony": {
    name: "St. Anthony",
    fullName: "St. Anthony of Padua",
    color: "#8b5cf6",
    saintImage: "/images/Anthony.png",
    quote: "The breath of Charity widens the narrow heart of sinners.",
    venue: "LH 24",
    time: "Sunday 2:00 PM - 4:00 PM",
  },
  "st-augustine": {
    name: "St. Augustine",
    fullName: "St. Augustine of Hippo",
    color: "#3b82f6",
    saintImage: "/images/Augustine.png",
    quote: "Our hearts are restless until they rest in Thee.",
    venue: "LH 21",
    time: "Sunday 2:00 PM - 4:00 PM",
  },
  "st-catherine": {
    name: "St. Catherine",
    fullName: "St. Catherine of Alexandria",
    color: "#800000",
    saintImage: "/images/Catherine.png",
    quote: "Be who God meant you to be and you will set the world on fire.",
    venue: "LH 18",
    time: "Sunday 2:00 PM - 4:00 PM",
  },
  "st-dominic": {
    name: "St. Dominic",
    fullName: "St. Dominic Guzman",
    color: "#475569",
    saintImage: "/images/Dominic.png",
    quote: "A man who governs his passions is master of the world.",
    venue: "LH 15",
    time: "Sunday 2:00 PM - 4:00 PM",
  },
  "st-elizabeth": {
    name: "St. Elizabeth",
    fullName: "St. Elizabeth of Hungary",
    color: "#059669",
    saintImage: "/images/Elizabeth.png",
    quote: "We must give whatever we have gladly and with a cheerful heart.",
    venue: "LH 12",
    time: "Sunday 2:00 PM - 4:00 PM",
  },
  "st-maria-goretti": {
    name: "St. Maria Goretti",
    fullName: "St. Maria Goretti",
    color: "#0284c7",
    saintImage: "/images/Goretti.png",
    quote: "Forgive, and you will be forgiven.",
    venue: "LH 09",
    time: "Sunday 2:00 PM - 4:00 PM",
  },
  "st-monica": {
    name: "St. Monica",
    fullName: "St. Monica of Hippo",
    color: "#dc2626",
    saintImage: "/images/Monica.png",
    quote: "Nothing is far from God.",
    venue: "LH 06",
    time: "Sunday 2:00 PM - 4:00 PM",
  },
};

export default function JumuiyaSelfRegister() {
  const { jumuiya_slug } = useParams<{ jumuiya_slug: string }>();
  const slug = (jumuiya_slug || "").toLowerCase().trim();

  // Resolved metadata from data / fallback / API
  const localJumuiya = useMemo(() => {
    const fromList = jumuiyaList.find((j) => j.id === slug);
    const fromFallback = JUMUIYA_FALLBACKS[slug];
    if (fromList) {
      return {
        name: fromList.name,
        fullName: fromList.fullName || fromList.name,
        color: fromList.color || fromFallback?.color || "#6366f1",
        saintImage: fromList.saintImage || fromFallback?.saintImage || "/images/cross.png",
        quote: fromList.description || fromFallback?.quote || "",
        venue: fromList.meetingSchedule?.venue || fromFallback?.venue || "Main Hall",
        time: fromList.meetingSchedule?.time || fromFallback?.time || "Sunday 2:00 PM",
      };
    }
    if (fromFallback) return fromFallback;
    return null;
  }, [slug]);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    regNumber: "",
    gender: "",
    email: "",
    phone: "",
    course: "",
  });

  // Validation & Live Duplicate state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [duplicateStatus, setDuplicateStatus] = useState<{
    regNumber?: { isDup: boolean; message: string };
    email?: { isDup: boolean; message: string };
  }>({});
  const [checkingDup, setCheckingDup] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedSession, setSubmittedSession] = useState<{
    name: string;
    regNumber: string;
    jumuiyaName: string;
    date: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check localStorage session lock on load
  const sessionKey = `csa_self_reg_${slug}`;
  useEffect(() => {
    try {
      const stored = localStorage.getItem(sessionKey);
      if (stored) {
        setSubmittedSession(JSON.parse(stored));
      }
    } catch {
      /* ignore */
    }
  }, [sessionKey]);

  // Live duplicate checking debounced
  useEffect(() => {
    const reg = formData.regNumber.trim();
    const mail = formData.email.trim();
    if (!reg && !mail) return;

    const timer = setTimeout(async () => {
      setCheckingDup(true);
      try {
        const res = await memberService.checkDuplicate({
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
        /* Ignore background check failure */
      } finally {
        setCheckingDup(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.regNumber, formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalVal = value;
    if (name === "regNumber") {
      finalVal = value.toUpperCase();
    }
    setFormData((prev) => ({ ...prev, [name]: finalVal }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError(null);

    // Clear duplicate warning for that field when user types
    if (name === "regNumber") {
      setDuplicateStatus((prev) => ({ ...prev, regNumber: undefined }));
    }
    if (name === "email") {
      setDuplicateStatus((prev) => ({ ...prev, email: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Please enter your full legal name";
    } else if (formData.name.trim().split(" ").length < 2) {
      errors.name = "Please provide at least first and last name";
    }

    if (!formData.regNumber.trim()) {
      errors.regNumber = "Registration number is required";
    } else if (formData.regNumber.length < 5) {
      errors.regNumber = "Please enter a valid student registration number";
    }

    if (!formData.gender) {
      errors.gender = "Please select your gender";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Please enter a valid email format";
    }

    const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, "");
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required for WhatsApp communication";
    } else if (cleanPhone.length < 9 || cleanPhone.length > 13) {
      errors.phone = "Enter a valid phone number (e.g. 0712345678 or +254712345678)";
    }

    if (!formData.course.trim()) {
      errors.course = "Please enter your current degree or certificate course";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    // Check duplicate warnings before sending
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
      await memberService.selfRegister({
        name: formData.name.trim(),
        regNumber: formData.regNumber.trim(),
        gender: formData.gender,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        course: formData.course.trim(),
        jumuiya_slug: slug,
      });

      const sessionData = {
        name: formData.name.trim(),
        regNumber: formData.regNumber.trim(),
        jumuiyaName: localJumuiya?.name || "Jumuiya",
        date: new Date().toLocaleDateString(),
      };

      // Save session lock to localStorage
      try {
        localStorage.setItem(sessionKey, JSON.stringify(sessionData));
      } catch {
        /* ignore */
      }

      setSubmittedSession(sessionData);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to complete registration. Please try again.";
      setSubmitError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRegisterAnother = () => {
    try {
      localStorage.removeItem(sessionKey);
    } catch {
      /* ignore */
    }
    setSubmittedSession(null);
    setFormData({
      name: "",
      regNumber: "",
      gender: "",
      email: "",
      phone: "",
      course: "",
    });
    setFieldErrors({});
    setDuplicateStatus({});
    setSubmitError(null);
  };

  // If slug is not found in 7 canonical Jumuiyas
  if (!localJumuiya) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Jumuiya Not Found</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            The registration link <code className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">/{slug}</code> is not recognized. Please choose your Jumuiya below:
          </p>
          <div className="space-y-2 text-left">
            {Object.entries(JUMUIYA_FALLBACKS).map(([jSlug, jData]) => (
              <Link
                key={jSlug}
                to={`/register/${jSlug}`}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-slate-700 font-semibold text-sm group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: jData.color }}
                  >
                    {jData.name.slice(3, 5)}
                  </div>
                  <span>{jData.name} Jumuiya</span>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const primaryColor = localJumuiya.color || "#6366f1";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/30 py-8 px-4 sm:px-6 flex flex-col justify-center items-center">
      {/* Container */}
      <div className="w-full max-w-lg">
        {/* Top Header & Saint Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 border border-slate-200/80 mb-5">
          {/* Accent Header Banner */}
          <div
            className="h-28 sm:h-32 relative flex items-end p-5 text-white overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}dd, ${primaryColor})`,
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-black" />
            <div className="relative z-10 w-full flex items-center justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/20 backdrop-blur-md text-white border border-white/30">
                  <Sparkles size={12} /> Dynamic Self-Registration
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white drop-shadow-sm">
                  {localJumuiya.name} Jumuiya
                </h1>
              </div>

              {/* Saint Avatar */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md p-1 border-2 border-white/40 shadow-lg shrink-0">
                <img
                  src={localJumuiya.saintImage}
                  alt={localJumuiya.name}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    // Fallback to initial
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Locked Destination Banner */}
          <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Lock size={13} />
              </span>
              <span className="text-slate-300">
                Target Jumuiya:{" "}
                <span className="text-white font-bold">{localJumuiya.name}</span> (Locked)
              </span>
            </div>
            <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
              WhatsApp Link
            </span>
          </div>

          {/* Saint Quote & Info */}
          <div className="p-5 bg-white border-b border-slate-100">
            {localJumuiya.quote && (
              <p className="text-xs italic text-slate-500 mb-3 border-l-2 pl-3 border-indigo-400">
                &ldquo;{localJumuiya.quote}&rdquo;
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-indigo-500" />
                <span>Venue: <strong>{localJumuiya.venue}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-indigo-500" />
                <span>Meeting: <strong>{localJumuiya.time}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Submissions View (Locked Confirmation Screen) ── */}
        {submittedSession ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 size={36} />
            </div>

            <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 mb-2">
              Registration Received
            </span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Welcome, {submittedSession.name}!
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto">
              Your details for <strong className="text-slate-800">{submittedSession.jumuiyaName}</strong> have been submitted directly into the coordinator&apos;s pending admission queue.
            </p>

            {/* Member Details Pill */}
            <div className="bg-slate-50 rounded-2xl p-4 my-6 border border-slate-200/80 text-left space-y-2 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Reg Number:</span>
                <span className="font-bold text-slate-900">{submittedSession.regNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Community:</span>
                <span className="font-bold text-slate-900">{submittedSession.jumuiyaName} Jumuiya</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submission Date:</span>
                <span className="font-medium text-slate-700">{submittedSession.date}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md active:scale-98"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-400" /> Copied WhatsApp Link!
                  </>
                ) : (
                  <>
                    <Share2 size={16} /> Share Link with Fellow Students
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRegisterAnother}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl text-xs transition-colors"
              >
                <RefreshCw size={13} /> Register Another Person on This Phone
              </button>
            </div>
          </div>
        ) : (
          /* ── Registration Form ── */
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-200/60 space-y-5"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-800">Member Information</h2>
              <p className="text-xs text-slate-500">
                Please fill in your accurate student details to complete your Jumuiya membership.
              </p>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1">
                  <p className="font-bold text-red-800">Registration Conflict</p>
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
                {checkingDup && <span className="text-[10px] text-indigo-500 font-medium animate-pulse">Checking records...</span>}
              </div>
              <div className="relative">
                <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="regNumber"
                  value={formData.regNumber}
                  onChange={handleChange}
                  placeholder="e.g. PA106/G/12345/23"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-mono uppercase text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none transition-all ${
                    fieldErrors.regNumber || duplicateStatus.regNumber?.isDup
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  }`}
                />
              </div>
              {fieldErrors.regNumber && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.regNumber}</p>}
              {duplicateStatus.regNumber?.isDup && (
                <p className="text-[11px] font-semibold text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {duplicateStatus.regNumber.message}
                </p>
              )}
            </div>

            {/* Gender Selection */}
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
              {fieldErrors.gender && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.gender}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. francis.mutua@example.com"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none transition-all ${
                    fieldErrors.email || duplicateStatus.email?.isDup
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  }`}
                />
              </div>
              {fieldErrors.email && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.email}</p>}
              {duplicateStatus.email?.isDup && (
                <p className="text-[11px] font-semibold text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {duplicateStatus.email.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Phone Number (WhatsApp Active) <span className="text-red-500">*</span>
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
              {fieldErrors.phone && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.phone}</p>}
            </div>

            {/* Course */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Course / Programme of Study <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="e.g. BSc Computer Science / Education"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none transition-all ${
                    fieldErrors.course
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  }`}
                />
              </div>
              {fieldErrors.course && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.course}</p>}
            </div>

            {/* Locked Jumuiya Pill */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Registering directly under:{" "}
                  <strong className="text-slate-900 font-bold">{localJumuiya.name}</strong>
                </span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                LOCKED
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
              }}
            >
              {submitting ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Submitting Registration...
                </>
              ) : (
                <>
                  Submit Registration <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          Catholic Students Association &middot; {localJumuiya.name} Jumuiya Portal &middot; Secured & Verified
        </p>
      </div>
    </div>
  );
}
