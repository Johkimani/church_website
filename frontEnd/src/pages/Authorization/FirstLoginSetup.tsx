import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { AxiosError } from "axios";
import { Eye, EyeOff, ChevronLeft, Shield, Mail, KeyRound, Loader2, CheckCircle, ShieldCheck, RefreshCw } from "lucide-react";
import { apiClient } from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import OTPInput from "./OTPInput";
import { validatePassword } from "../../utils/passwordPolicy";

type ApiError = AxiosError<{ message?: string; error?: string }>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FirstLoginSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const loginResponse = location.state?.loginResponse;
  const member_id = loginResponse?.member_id || "";
  const memberName = loginResponse?.name || "";
  const hasEmail = loginResponse?.hasEmail ?? false;
  const currentPassword = location.state?.currentPassword || member_id;

  const [phase, setPhase] = useState<"form" | "otp">("form");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [done, setDone] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [emailEditable, setEmailEditable] = useState(false);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const finishSetup = () => {
    login(loginResponse);
    setDone(true);
    const role = loginResponse?.role;
    const hasRole = Array.isArray(role) ? role.length > 0 : !!role;
    if (hasRole) {
      const savedPath = sessionStorage.getItem('admin_last_path');
      setTimeout(() => navigate(savedPath && savedPath.startsWith('/admin') ? savedPath : '/admin'), 1500);
    } else {
      setTimeout(() => navigate('/'), 1500);
    }
  };

  const handleSubmit = async () => {
    setFormError("");
    setEmailError("");

    if (!hasEmail && !email.trim()) {
      setEmailError("Email is required");
      return;
    }
    if (!hasEmail && !EMAIL_REGEX.test(email.trim())) {
      setEmailError("Please enter a valid email address, e.g. example@gmail.com");
      return;
    }
    const policyError = validatePassword(newPassword, member_id);
    if (policyError) {
      toast.error(policyError);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post("/authentication/first-login-setup", {
        member_id,
        currentPassword,
        newPassword,
        email: hasEmail ? undefined : email.trim().toLowerCase(),
        firstLogin: true,
      });
      const status = res.data?.status;
      if (status === "otp_required") {
        setOtpEmail(res.data?.email || email.trim());
        setPhase("otp");
        setResendCountdown(0);
      } else {
        toast.success("Password updated successfully");
        finishSetup();
      }
    } catch (err) {
      const data = (err as ApiError)?.response?.data;
      const message = data?.message || "Failed to update password. Please try again.";
      toast.error(message);
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    setOtpLoading(true);
    try {
      await apiClient.post(`/authentication/otp/${encodeURIComponent(otpEmail)}`, { otp });
      toast.success("Email verified. Your account is ready!");
      finishSetup();
    } catch (err) {
      const data = (err as ApiError)?.response?.data;
      toast.error(
        data?.error ||
        data?.message ||
        "Verification failed. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || resending) return;
    setResending(true);
    try {
      await apiClient.post(`/authentication/resend-otp/${encodeURIComponent(otpEmail)}`);
      toast.success("A new verification code has been sent.");
      setResendCountdown(60);
    } catch (err) {
      const data = (err as ApiError)?.response?.data;
      toast.error(data?.error || "Failed to resend the code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleChangeEmail = () => {
    setPhase("form");
    setEmail("");
    setResendCountdown(0);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] px-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-950">All set!</h2>
          <p className="text-gray-500 font-medium">Your account is ready. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] px-6 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-gray-400 hover:text-black text-[10px] font-black uppercase tracking-widest transition-colors group mb-10 w-fit"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Login
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 backdrop-blur-md flex items-center justify-center mb-4 border border-amber-500/30">
              {phase === "otp" ? (
                <ShieldCheck className="w-7 h-7 text-amber-400" />
              ) : (
                <Shield className="w-7 h-7 text-amber-400" />
              )}
            </div>
            <h1 className="text-2xl font-black">
              {phase === "otp" ? "Verify Your Email" : "First-Time Setup"}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              {phase === "otp" ? (
                <>
                  We sent a verification code to <span className="font-bold text-white">{otpEmail}</span>.
                </>
              ) : (
                <>
                  Welcome, <span className="font-bold text-white">{memberName || member_id}</span>. Please set a new password to continue.
                </>
              )}
            </p>
          </div>

          <div className="p-8 space-y-6">
            {phase === "form" ? (
              <>
                {!hasEmail && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 pl-1">
                      <Mail className="inline w-3 h-3 mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      readOnly={!emailEditable}
                      onFocus={() => {
                        if (!emailEditable) {
                          setEmail("");
                          setEmailEditable(true);
                        }
                      }}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      placeholder="example@gmail.com"
                      autoComplete="email"
                      className="w-full bg-gray-100 rounded-2xl px-5 py-4 text-sm font-black text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all border border-gray-200"
                    />
                    {emailError && (
                      <p className="text-xs text-red-600 font-bold mt-1.5 pl-1">{emailError}</p>
                    )}
                    <p className="text-xs text-amber-600 font-medium mt-1.5 pl-1">
                      No email is recorded on your account yet. You must verify the email you provide — a code will be sent to it before your password is changed.
                    </p>
                  </div>
                )}

                {formError && (
                  <div className="p-4 rounded-2xl text-sm font-bold border border-red-200 bg-red-50 text-red-700">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 pl-1">
                    <KeyRound className="inline w-3 h-3 mr-1" />
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full bg-gray-100 rounded-2xl px-5 py-4 pr-12 text-sm font-black text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-0 bottom-0 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 pl-1">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-gray-100 rounded-2xl px-5 py-4 text-sm font-black text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all border border-gray-200"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 bg-black text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-2xl shadow-xl shadow-gray-200 hover:bg-gray-900 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {hasEmail ? "Saving..." : "Sending code..."}
                    </>
                  ) : (
                    hasEmail ? "Save & Continue" : "Send Verification Code"
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-7 h-7 text-amber-500" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium max-w-[300px] mx-auto">
                    Enter the 6-digit code sent to <span className="font-bold text-black">{otpEmail}</span>. Your new password and this email will only be saved after the code is verified.
                  </p>
                </div>

                <div className="flex justify-center w-full pt-2">
                  <OTPInput length={6} onComplete={handleOTPComplete} />
                </div>

                <p className="text-xs text-gray-400 font-medium text-center">
                  Tip: you can copy the code from your email and paste it directly into the boxes.
                </p>

                {otpLoading && (
                  <div className="flex items-center justify-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </div>
                )}

                <div className="space-y-3 text-center">
                  <p className="text-sm text-gray-500 font-medium">
                    Didn't receive the code?{" "}
                    {resendCountdown > 0 ? (
                      <span className="text-gray-400 font-bold">Resend in {resendCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="text-black hover:text-amber-500 font-black underline transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        {resending ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Resending...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            Resend Code
                          </>
                        )}
                      </button>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="text-xs font-bold text-gray-400 hover:text-black transition-colors"
                  >
                    Wrong email? Use a different one
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
