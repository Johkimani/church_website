import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { apiClient } from "../../api/axiosInstance";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const reg = searchParams.get("reg");

    if (!token || !reg) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    apiClient.post("/authentication/verify-email", { token, reg })
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed. The link may be expired.");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] px-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto">
          <Mail className="w-10 h-10 text-amber-500" />
        </div>

        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
            <p className="text-gray-500 font-medium">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-black text-gray-950">Email Verified!</h2>
            <p className="text-gray-500">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 bg-black text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-900 transition-all"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-black text-gray-950">Verification Failed</h2>
            <p className="text-gray-500">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 bg-black text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-900 transition-all"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
