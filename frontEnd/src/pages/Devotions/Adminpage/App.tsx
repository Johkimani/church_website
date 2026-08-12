import { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaCheckCircle, FaUsers, FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import { Sparkles } from "lucide-react";
import {
  generateAndSaveQuestions,
  fetchTable,
  publishStats,
  fetchManageQuestions,
  updateQuestionApi,
  deleteQuestionApi,
} from "../../../api/axiosInstance";
import JumuiyaDashboard from "../jumuiyaStatus/JumuiyaDashboard";


interface JumuiyaRow {
  group_id: string;
  name: string;
  slug?: string;
}

const carouselSlides = [
  {
    title: "AI Generated Questions",
    subtitle:
      "Deepen your faith and exploration of scripture with intelligent, context-aware insights tailored to your spiritual journey.",
    bg: "from-stone-900/80 to-amber-900/60",
    image:
      "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=900&q=80",
  },
  {
    title: "Scripture Exploration",
    subtitle:
      "Discover deeper meaning in sacred texts with AI-powered analysis and community discussion tools.",
    bg: "from-stone-900/80 to-orange-900/60",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
  },
  {
    title: "Spiritual Growth",
    subtitle:
      "Track your journey, set goals, and connect with fellow believers on the path of faith.",
    bg: "from-stone-900/80 to-red-900/60",
    image:
      "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=900&q=80",
  },
  {
    title: "Analytical Insights",
    subtitle:
      "Compare attempted questions and accuracy across all jumuias, highlighting strengths and areas for growth.",
    bg: "from-stone-900/80 to-indigo-900/60",
    image:
      "https://images.unsplash.com/photo-1581090700227-4c4d1a3f3d3c?w=900&q=80",
  },
  {
    title: "Overall Comparison",
    subtitle:
      "Gain a clear overview of performance among the seven jumuias, fostering fairness and collective improvement.",
    bg: "from-stone-900/80 to-green-900/60",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80",
  },
];

function AIEngine({ onGenerated }: { onGenerated?: () => void }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Generating...");
  const [recentTopics, setRecentTopics] = useState([
    "Sermon on the Mount",
    "St. Francis of Assisi",
    "Book of Daniel",
    "Parable of Prodigal Son",
  ]);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const generate = async () => {
    const messages = [
      "Getting questions ready...",
      "Combining scripture context...",
      "Structuring options and explanations...",
      "Saving to question bank...",
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingText(messages[i]);
      i++;
      if (i >= messages.length) clearInterval(interval);
    }, 2000);

    if (!topic.trim()) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await generateAndSaveQuestions({ topic });
      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        if (onGenerated) onGenerated();
      } else {
        setErrorMessage("Unexpected response from question generator. Please try again.");
      }
    } catch (error: any) {
      console.error("Error generating insights:", error);
      setErrorMessage(
        error?.response?.data?.error || "Sorry, something went wrong while generating questions. Please try again."
      );
    } finally {
      setLoading(false);
      setLoadingText("Generated..");
      if (!recentTopics.includes(topic)) {
        const updated = [topic, ...recentTopics].slice(0, 5);
        setRecentTopics(updated);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-sm text-white">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>

          <h2 className="text-base font-bold text-stone-800">
            AI Question Generator Engine
          </h2>
          <p className="text-stone-500 text-xs">
            Generate multiple-choice liturgical & scripture questions powered by Ascension AI.
          </p>
        </div>
      </div>

      {/* Main flex area */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left side */}
        <div className="flex-1 space-y-3 w-full">
          {!success ? (
            <>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g., Let's talk about the Parable of the Prodigal Son or Catholic Marian Devotions..."
                className="w-full h-28 border border-stone-200 rounded-xl p-3 text-sm text-stone-800 placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-stone-50"
              />
              <div className="flex justify-between items-center text-xs text-stone-400">
                <span>Prompt Topic</span>
                <span>Example: "Book of Romans & Grace"</span>
              </div>
              <button
                onClick={generate}
                disabled={loading || !topic.trim()}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    {loadingText}
                  </>
                ) : (
                  "✦ Generate Question Batch"
                )}
              </button>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 mt-2">
                  {errorMessage}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Success container */}
              <div className="flex flex-col items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm">
                <FaCheckCircle className="w-10 h-10 text-emerald-500 animate-bounce" />
                <h3 className="text-base font-bold text-emerald-800">
                  Questions Generated Successfully!
                </h3>
                <p className="text-xs text-emerald-700 text-center leading-relaxed">
                  Your new batch of daily challenge questions has been processed and added to the question bank below.
                </p>
                <button
                  onClick={() => { setSuccess(false); setTopic(""); }}
                  className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  + Generate Another Topic
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-2 mt-4 border-t border-stone-100 pt-3">
        <span className="text-xs font-bold text-stone-500">
          Suggested Topics:
        </span>
        {recentTopics.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className="px-2.5 py-1 text-xs rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
          >
            {t}
          </button>
        ))}
        <span className="ml-auto flex items-center text-[10px] text-stone-400 italic">
          Powered by <span className="ml-1 font-bold text-amber-600 not-italic">Groq Llama-3</span>
        </span>
      </div>
    </div>
  );
}

function Carousel() {
  const [slide, setSlide] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  const startTimer = () => {
    if (timer.current !== undefined) clearInterval(timer.current);
    timer.current = window.setInterval(
      () => setSlide((s) => (s + 1) % carouselSlides.length),
      4500,
    );
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timer.current !== undefined) clearInterval(timer.current);
    };
  }, []);

  const goTo = (i: number) => {
    setSlide(i);
    startTimer();
  };
  const cur = carouselSlides[slide];

  return (
    <div className="relative rounded-2xl overflow-hidden h-48 md:h-56 shadow-md">
      <img
        key={slide}
        src={cur.image}
        alt="slide"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transition: "opacity 0.6s" }}
      />
      <div className={`absolute inset-0 bg-gradient-to-r ${cur.bg}`} />

      {/* Badge */}
      <div className="absolute top-4 left-4">
        <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full tracking-widest uppercase shadow-sm">
          ★ Liturgical Portal
        </span>
      </div>

      {/* Text container */}
      <div className="absolute inset-y-0 left-6 right-14 flex flex-col justify-center px-4 py-6">
        <h1 className="text-white font-black text-xl md:text-2xl leading-tight drop-shadow-md max-w-md">
          {cur.title}
        </h1>
        <p className="text-white/80 text-xs md:text-sm mt-1.5 max-w-md leading-relaxed">
          {cur.subtitle}
        </p>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {carouselSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === slide ? "bg-amber-400 w-6" : "bg-white/50 w-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function PublishProgress() {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [lastPublished, setLastPublished] = useState<string | null>(null);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await publishStats();
      if (res.data?.status) {
        setPublished(true);
        setLastPublished(new Date().toLocaleString());
      }
    } catch {
      alert("Failed to publish stats. Try again.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-stone-800 text-base">Publish Progress Snapshots</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {lastPublished
              ? `Last published snapshot: ${lastPublished}`
              : "Sync and lock official Jumuiya performance standings for all members."}
          </p>
        </div>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
        >
          {publishing ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Publishing...
            </>
          ) : (
            "Publish Progress Snapshots"
          )}
        </button>
      </div>
      {published && (
        <p className="text-xs font-semibold text-emerald-600 mt-3 flex items-center gap-1">
          <FaCheckCircle /> Snapshots updated successfully! Member dashboards are now in sync.
        </p>
      )}
    </div>
  );
}

function QuestionBankManager({ refreshTrigger }: { refreshTrigger?: number }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetchManageQuestions({ page, limit: 10, search });
      setQuestions(res.data?.questions || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [page, search, refreshTrigger]);

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestionApi(id);
      loadQuestions();
    } catch {
      alert("Failed to delete question");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    setSaving(true);
    try {
      await updateQuestionApi(editingQuestion._id, {
        questionText: editingQuestion.questionText,
        answers: editingQuestion.answers,
        correctAnswer: editingQuestion.correctAnswer,
      });
      setEditingQuestion(null);
      loadQuestions();
    } catch {
      alert("Failed to update question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 mt-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="font-bold text-stone-800 text-base">Question Bank Manager</h3>
          <p className="text-xs text-stone-500">Manage and refine AI-generated questions in the database ({total} total questions)</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-stone-400">Loading Question Bank...</div>
      ) : questions.length === 0 ? (
        <div className="py-12 text-center text-xs text-stone-400">No questions found matching search criteria.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-3"># ID</th>
                <th className="py-3 px-3">Question Prompt</th>
                <th className="py-3 px-3">Options</th>
                <th className="py-3 px-3">Correct Choice</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {questions.map((q) => {
                const options = Array.isArray(q.answers) ? q.answers.map((a: any) => a.text || a) : [];
                return (
                  <tr key={q._id} className="hover:bg-stone-50/80">
                    <td className="py-3 px-3 font-semibold text-stone-400">#{q._id}</td>
                    <td className="py-3 px-3 font-semibold max-w-xs truncate" title={q.questionText}>
                      {q.questionText}
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-stone-500">
                      {options.join(" | ")}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md">
                        {q.correctAnswer?.option || q.correctAnswer?.text || "Choice"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingQuestion(q)}
                          className="p-1.5 text-stone-600 hover:text-amber-600 transition-colors"
                          title="Edit Question"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                          title="Delete Question"
                        >
                          <FaTrash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl space-y-4">
            <h3 className="font-bold text-stone-800 text-base">Edit Question</h3>
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Question Prompt</label>
              <textarea
                value={editingQuestion.questionText}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                className="w-full border border-stone-200 rounded-xl p-2.5 text-xs bg-stone-50"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MemberProfile({ member }: { member: JumuiyaRow }) {
  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
        <div className="w-16 h-16 flex items-center justify-center text-amber-600">
          <FaUserCircle className="w-14 h-14" />
        </div>
        <div>
          <h2 className="text-xl font-black text-stone-800">{member.name}</h2>
          <p className="text-stone-400 text-sm">{member.slug || member.name}</p>
        </div>
      </div>
      <JumuiyaDashboard jumuiyaId={member.group_id} jumuiyaName={member.name} />
    </div>
  );
}

export default function Appadmin() {
  const [view, setView] = useState<string>("dashboard");
  const [members, setMembers] = useState<JumuiyaRow[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchTable("sub_groups", { limit: "50" })
      .then((res) => {
        const rows = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        setMembers(rows);
      })
      .catch(() => {
        setMembers([]);
      });
  }, []);

  const activeMember = members.find((m) => m.group_id === view);

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Tab selection inside UniversalAdmin */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3 overflow-x-auto">
          <button
            onClick={() => setView("dashboard")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              view === "dashboard" ? "bg-amber-600 text-white shadow-sm" : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
            }`}
          >
            AI Engine & Question Bank
          </button>
          {members.map((m) => (
            <button
              key={m.group_id}
              onClick={() => setView(m.group_id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                view === m.group_id ? "bg-amber-600 text-white shadow-sm" : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        {view === "dashboard" ? (
          <div className="space-y-6">
            <Carousel />
            <AIEngine onGenerated={() => setRefreshTrigger((prev) => prev + 1)} />
            <PublishProgress />
            <QuestionBankManager refreshTrigger={refreshTrigger} />
          </div>
        ) : activeMember ? (
          <MemberProfile member={activeMember} />
        ) : (
          <div className="p-8 text-center text-stone-400 text-sm">Select a Jumuiya tab above</div>
        )}
      </div>
    </div>
  );
}

