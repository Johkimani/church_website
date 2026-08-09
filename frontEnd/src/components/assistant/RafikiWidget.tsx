import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Send, Sparkles, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { postAssistantChat } from "../../api/axiosInstance";
import {
  localRespond,
  getGreeting,
  SUGGESTIONS,
  type AssistantLink,
} from "./localBrain";
import { loadSiteData, buildKnowledgeForPath, type SiteFacts } from "./siteKnowledge";

type Message = {
  role: "user" | "assistant";
  content: string;
  links?: AssistantLink[];
};

const normalizeRoles = (role: string | string[] | undefined): string[] => {
  if (!role) return [];
  const arr = Array.isArray(role) ? role : [role];
  return arr.map((r) => String(r).toUpperCase().trim());
};

export default function RafikiWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [knowledge, setKnowledge] = useState<string | null>(null);
  const [facts, setFacts] = useState<SiteFacts | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);

  const roles = normalizeRoles(user?.role);
  const hideOnLogin = location.pathname.startsWith("/login");

  useEffect(() => {
    loadSiteData()
      .then(({ knowledge: k, facts: f }) => {
        setKnowledge(k);
        setFacts(f);
      })
      .catch(() => {
        setKnowledge(null);
        setFacts(null);
      });
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy, open]);

  useEffect(() => {
    if (open && !started) {
      setStarted(true);
      setMessages([{ role: "assistant", content: getGreeting(user?.name) }]);
    }
  }, [open, started, user]);

  const runLocal = (text: string) =>
    localRespond(text, {
      name: user?.name,
      roles,
      path: location.pathname,
      jumuiya: facts?.jumuiya,
      saints: facts?.saints,
    });

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    setInput("");

    const history = messages
      .filter((m) => m.content)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setBusy(true);

    try {
      const { data } = await postAssistantChat({
        message: text,
        history: history.slice(-8),
        context: {
          path: location.pathname,
          name: user?.name,
          role: user?.role,
          knowledge: knowledge ? buildKnowledgeForPath(knowledge, location.pathname) : undefined,
        },
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.reply || "Hmm, I could not answer that. Let me point you somewhere helpful.",
          links: Array.isArray(data?.links) ? data.links : undefined,
        },
      ]);
    } catch {
      const local = runLocal(text);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: local.text, links: local.links },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const goTo = (href: string) => {
    navigate(href);
    setOpen(false);
  };

  const showSuggestions = started && messages.length <= 1 && !busy;

  return (
    <>
      <style>{`
        @keyframes rafiki-pop {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .rafiki-panel { animation: rafiki-pop 0.25s ease-out; transform-origin: bottom right; }
      `}</style>
      {/* Bottom-right trigger pill */}
      {!open && !hideOnLogin && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Rafiki assistant"
          className="fixed bottom-5 right-5 md:bottom-6 md:right-6 z-[9999] inline-flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold shadow-xl ring-1 ring-white/20 hover:scale-105 active:scale-95 transition-transform"
        >
          <Sparkles className="w-4 h-4" />
          Ask Rafiki
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
          </span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Rafiki assistant"
          className="rafiki-panel fixed bottom-5 right-5 md:bottom-6 md:right-6 z-[9999] w-[calc(100vw-2rem)] max-w-sm h-[min(600px,calc(100dvh-5rem))] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm leading-tight">Rafiki</p>
              <p className="text-[11px] text-white/80 leading-tight">
                Your church companion &middot; online
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="w-9 h-9 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-slate-50">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] bg-blue-600 text-white text-sm rounded-2xl rounded-br-md px-4 py-2.5 whitespace-pre-line shadow-sm">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="max-w-[85%] space-y-2">
                    <div className="bg-white text-slate-700 text-sm rounded-2xl rounded-bl-md px-4 py-2.5 whitespace-pre-line shadow-sm ring-1 ring-slate-100">
                      {m.content}
                    </div>
                    {m.links && m.links.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-1">
                        {m.links.map((link, li) => (
                          <button
                            key={`${i}-${li}`}
                            onClick={() => goTo(link.href)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 hover:bg-amber-100 active:scale-95 transition-all"
                          >
                            {link.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}

            {busy && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm ring-1 ring-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="px-3 pb-2 bg-slate-50 flex gap-2 overflow-x-auto">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="flex-shrink-0 text-xs font-medium text-amber-700 bg-white border border-amber-200 rounded-full px-3 py-1.5 hover:bg-amber-50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="px-3 py-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Rafiki anything..."
              className="flex-1 min-w-0 text-sm px-4 py-2.5 rounded-full bg-slate-100 border border-transparent focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
              aria-label="Message Rafiki"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send message"
              className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
