import React, { useState } from "react";
import { Share2, Check, Copy, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

interface CopyWhatsAppButtonProps {
  jumuiyaSlug: string;
  jumuiyaName: string;
  variant?: "primary" | "secondary" | "compact";
  className?: string;
}

export const getWhatsAppRegistrationMessage = (slug: string, name: string) => {
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.origin.includes("localhost") ||
      window.location.origin.includes("127.0.0.1"));
  const baseUrl = isLocal ? "https://csakyu.com" : window.location.origin;
  const link = `${baseUrl}/register/${slug}`;

  return `🕊️ *CSA KYU - ${name} Jumuiya Member Registration*\n\nDear Brothers & Sisters in Christ,\nPlease use the official link below to complete your registration for *${name} Jumuiya*:\n\n👉 ${link}\n\nKindly fill in your accurate student details (Full Name, Reg No, Gender, Email, Phone, and Course). Your registration will be confirmed automatically by the coordinator.\n\nGod bless you! ✨`;
};

export const copyWhatsAppLink = async (slug: string, name: string) => {
  const message = getWhatsAppRegistrationMessage(slug, name);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(message);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = message;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    toast.success(`WhatsApp registration link for ${name} copied to clipboard!`, {
      duration: 3500,
      icon: "📋",
    });
    return true;
  } catch (err) {
    toast.error("Failed to copy link. Please try again.");
    return false;
  }
};

const getRegistrationBaseUrl = () => {
  if (
    typeof window !== "undefined" &&
    (window.location.origin.includes("localhost") ||
      window.location.origin.includes("127.0.0.1"))
  ) {
    return "https://csakyu.com";
  }
  return typeof window !== "undefined"
    ? window.location.origin
    : "https://csakyu.com";
};

export default function CopyWhatsAppButton({
  jumuiyaSlug,
  jumuiyaName,
  variant = "primary",
  className = "",
}: CopyWhatsAppButtonProps) {
  const [copied, setCopied] = useState(false);
  const registrationUrl = `${getRegistrationBaseUrl()}/register/${jumuiyaSlug}`;

  const handleCopy = async () => {
    const ok = await copyWhatsAppLink(jumuiyaSlug, jumuiyaName);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = getWhatsAppRegistrationMessage(jumuiyaSlug, jumuiyaName);
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            copied
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
          }`}
          title="Copy WhatsApp Registration Link to clipboard"
        >
          {copied ? <Check size={14} className="text-white" /> : <Copy size={14} />}
          <span>{copied ? "Copied Link!" : "Copy Link"}</span>
        </button>
        <button
          type="button"
          onClick={handleOpenWhatsApp}
          className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          title="Share directly to WhatsApp"
        >
          <MessageCircle size={14} />
        </button>
        <a
          href={registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-bold text-blue-600 underline underline-offset-2 hover:text-blue-700"
          title="Open registration page"
        >
          {registrationUrl.replace(/^https?:\/\//, "")}
        </a>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={handleCopy}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-98 ${
          copied
            ? "bg-emerald-600 text-white"
            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
        }`}
      >
        {copied ? (
          <>
            <Check size={16} className="text-white" /> Copied WhatsApp Link!
          </>
        ) : (
          <>
            <Copy size={16} /> Copy WhatsApp Registration Link
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleOpenWhatsApp}
        className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-colors"
        title="Open and send directly via WhatsApp"
      >
        <Share2 size={16} />
      </button>
    <a
      href={registrationUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs font-bold text-blue-600 underline underline-offset-2 hover:text-blue-700"
      title="Open registration page"
    >
      {registrationUrl.replace(/^https?:\/\//, "")}
    </a>
  </div>
  );
}
