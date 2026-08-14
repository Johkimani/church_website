import { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaCheckCircle, FaUsers, FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import { Sparkles, TrendingUp, Award, BarChart3, PieChart as PieIcon, RefreshCw, Users, ShieldCheck, CalendarDays } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, Legend
} from "recharts";
import {
  generateAndSaveQuestions,
  fetchTable,
  publishStats,
  fetchManageQuestions,
  fetchQuestionTopics,
  updateQuestionApi,
  deleteQuestionApi,
  deleteQuestionsByTopicApi,
  setQuestionStatusApi,
  fetchPublishedComparison,
} from "../../../api/axiosInstance";
import JumuiyaDashboard from "../jumuiyaStatus/JumuiyaDashboard";
import WeeklyChallengeManager from "./WeeklyChallengeManager";

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
  const [topics, setTopics] = useState<Array<{ topic: string; count: number }>>([]);
  const [activeTopic, setActiveTopic] = useState("all");
  const PAGE_SIZE = 10;

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetchManageQuestions({
        page,
        limit: PAGE_SIZE,
        search,
        topic: activeTopic === "all" ? undefined : activeTopic,
      });
      setQuestions(res.data?.questions || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async () => {
    try {
      const res = await fetchQuestionTopics();
      setTopics(res.data?.topics || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [page, search, refreshTrigger, activeTopic]);

  useEffect(() => {
    loadTopics();
  }, [refreshTrigger]);

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestionApi(id);
      loadQuestions();
    } catch {
      alert("Failed to delete question");
    }
  };

  const [batchDeleting, setBatchDeleting] = useState(false);

  const handleDeleteTopicBatch = async () => {
    if (activeTopic === "all") return;
    const count = topics.find((t) => t.topic === activeTopic)?.count ?? total;
    if (
      !window.confirm(
        `Delete all ${count} question(s) under "${activeTopic}"?\n\nThis only removes the questions. Jumuiya, member and comparison analytics are kept. Questions in this week's active challenge are skipped.`
      )
    ) {
      return;
    }
    setBatchDeleting(true);
    try {
      const res = await deleteQuestionsByTopicApi(activeTopic);
      const skipped = res.data?.skippedCount ?? 0;
      if (skipped > 0) {
        alert(`${res.data?.deletedCount ?? 0} deleted. ${skipped} kept because they are in this week's active challenge.`);
      }
      await loadTopics();
      setActiveTopic("all");
      setPage(1);
    } catch {
      alert("Failed to delete questions");
    } finally {
      setBatchDeleting(false);
    }
  };

  const handleSetStatus = async (id: number | string, status: "approved" | "rejected") => {
    try {
      await setQuestionStatusApi(id, status);
      loadQuestions();
    } catch {
      alert("Failed to update question status");
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
          <p className="text-xs text-stone-500">
            {activeTopic === "all"
              ? `Manage and refine AI-generated questions in the database (${total} total questions)`
              : `Showing "${activeTopic}" questions (${total} total)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTopic !== "all" && (
            <button
              onClick={handleDeleteTopicBatch}
              disabled={batchDeleting}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50"
            >
              <FaTrash size={12} />
              {batchDeleting ? "Deleting..." : "Delete all under this title"}
            </button>
          )}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search questions..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
          </div>
        </div>
      </div>

      {/* Group by generation title */}
      <div className="mb-4">
        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">
          Grouped by Title
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTopic("all");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              activeTopic === "all"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-white text-stone-600 border-stone-200 hover:border-amber-400"
            }`}
          >
            All Questions
          </button>
          {topics.map((t) => (
            <button
              key={t.topic}
              onClick={() => {
                setActiveTopic(t.topic);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                activeTopic === t.topic
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                  : "bg-white text-stone-600 border-stone-200 hover:border-amber-400"
              }`}
            >
              {t.topic}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTopic === t.topic ? "bg-white/20" : "bg-amber-50 text-amber-700"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-stone-400">Loading Question Bank...</div>
      ) : questions.length === 0 ? (
        <div className="py-12 text-center text-xs text-stone-400">
          No questions found {activeTopic !== "all" ? `for "${activeTopic}" ` : ""}matching search criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-3"># ID</th>
                <th className="py-3 px-3">Question Prompt</th>
                <th className="py-3 px-3">Options</th>
                <th className="py-3 px-3">Correct Choice</th>
                <th className="py-3 px-3 text-center">Status</th>
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
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide ${
                          q.status === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : q.status === "rejected"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {q.status || "draft"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {q.status !== "approved" && (
                          <button
                            onClick={() => handleSetStatus(q._id, "approved")}
                            className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] hover:bg-emerald-100"
                            title="Approve question"
                          >
                            Approve
                          </button>
                        )}
                        {q.status !== "rejected" && (
                          <button
                            onClick={() => handleSetStatus(q._id, "rejected")}
                            className="px-2 py-1 rounded-md bg-red-50 text-red-600 font-bold text-[10px] hover:bg-red-100"
                            title="Reject question"
                          >
                            Reject
                          </button>
                        )}
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

      {!loading && total > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
          <span className="text-[10px] text-stone-400 font-semibold">
            Page {page} of {Math.ceil(total / PAGE_SIZE) || 1}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / PAGE_SIZE)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-40"
            >
              Next
            </button>
          </div>
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

const JUMUIYA_META: Record<string, { name: string; shortName: string; color: string }> = {
  "st-anthony": { name: "St. Anthony of Padua", shortName: "St. Anthony", color: "#8b5cf6" },
  "st-augustine": { name: "St. Augustine", shortName: "St. Augustine", color: "#3b82f6" },
  "st-catherine": { name: "St. Catherine of Alexandria", shortName: "St. Catherine", color: "#b91c1c" },
  "st-dominic": { name: "St. Dominic", shortName: "St. Dominic", color: "#64748b" },
  "st-elizabeth": { name: "St. Elizabeth of Hungary", shortName: "St. Elizabeth", color: "#16a34a" },
  "st-maria-goretti": { name: "St. Maria Goretti", shortName: "St. Maria Goretti", color: "#0ea5e9" },
  "st-monica": { name: "St. Monica", shortName: "St. Monica", color: "#ea580c" },
};

function formatJumuiyaSlug(idOrSlug: string, membersList: JumuiyaRow[] = []): string {
  if (!idOrSlug) return "General Jumuiya";
  const key = idOrSlug.toLowerCase().trim();

  if (JUMUIYA_META[key]) return JUMUIYA_META[key].name;

  for (const [k, meta] of Object.entries(JUMUIYA_META)) {
    if (key.includes(k) || k.includes(key)) return meta.name;
  }

  const found = membersList.find(
    (m) => m.group_id === idOrSlug || m.slug === idOrSlug || m.name?.toLowerCase() === key
  );
  if (found) {
    const foundKey = (found.slug || found.name || "").toLowerCase().replace(/[^a-z0-9]/g, "-");
    for (const [k, meta] of Object.entries(JUMUIYA_META)) {
      if (foundKey.includes(k) || k.includes(foundKey)) return meta.name;
    }
    return found.name;
  }

  const clean = idOrSlug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return clean.length > 30 ? "Jumuiya" : clean;
}

function getJumuiyaColor(idOrSlug: string, membersList: JumuiyaRow[] = []): string {
  if (!idOrSlug) return "#6366f1";
  const key = idOrSlug.toLowerCase().trim();

  if (JUMUIYA_META[key]) return JUMUIYA_META[key].color;
  for (const [k, meta] of Object.entries(JUMUIYA_META)) {
    if (key.includes(k) || k.includes(key)) return meta.color;
  }

  const found = membersList.find(
    (m) => m.group_id === idOrSlug || m.slug === idOrSlug || m.name?.toLowerCase() === key
  );
  if (found) {
    const foundKey = (found.slug || found.name || "").toLowerCase().replace(/[^a-z0-9]/g, "-");
    for (const [k, meta] of Object.entries(JUMUIYA_META)) {
      if (foundKey.includes(k) || k.includes(foundKey)) return meta.color;
    }
  }

  const fallbackColors = ["#8b5cf6", "#3b82f6", "#b91c1c", "#64748b", "#16a34a", "#0ea5e9", "#ea580c"];
  let hash = 0;
  for (let i = 0; i < idOrSlug.length; i++) hash = idOrSlug.charCodeAt(i) + ((hash << 5) - hash);
  return fallbackColors[Math.abs(hash) % fallbackColors.length];
}

function JumuiyaAnalyticsOverview({ membersList = [] }: { membersList?: JumuiyaRow[] }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetchPublishedComparison();
      const raw = Array.isArray(res.data?.data) ? res.data.data : [];
      setData(raw);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const totalParishAttempts = data.reduce((sum, item) => sum + (item.totalAttempts || 0), 0);
  const totalParishCorrect = data.reduce((sum, item) => sum + (item.correctAttempts || 0), 0);
  const avgAccuracy = totalParishAttempts ? (totalParishCorrect / totalParishAttempts) * 100 : 0;

  const sortedData = [...data].sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));
  const topJumuiya = sortedData[0] ? formatJumuiyaSlug(sortedData[0]._id, membersList) : "N/A";

  const chartData = sortedData.map((j) => ({
    name: formatJumuiyaSlug(j._id, membersList),
    accuracy: j.accuracy || 0,
    attempts: j.totalAttempts || 0,
    correct: j.correctAttempts || 0,
    color: getJumuiyaColor(j._id, membersList),
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-2xl p-6 text-white shadow-md border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest mb-2">
              <BarChart3 size={12} /> Liturgist Analytics Dashboard
            </div>
            <h2 className="text-2xl font-black tracking-tight">7 Jumuiyas Performance Over Time</h2>
            <p className="text-xs text-stone-300 mt-1 max-w-xl">
              Track parish-wide participation, liturgical accuracy, and spiritual engagement across all seven Jumuiya communities.
            </p>
          </div>
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="self-start md:self-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh Analytics
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Attempts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-800 mt-2">{totalParishAttempts}</p>
          <p className="text-[10px] text-stone-400 mt-1">Parish-wide challenge responses</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Parish Avg Accuracy</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{avgAccuracy.toFixed(1)}%</p>
          <p className="text-[10px] text-stone-400 mt-1">Overall correct answer rate</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Leading Jumuiya</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <p className="text-lg font-bold text-indigo-950 truncate mt-2">{topJumuiya}</p>
          <p className="text-[10px] text-stone-400 mt-1">Highest accuracy leader</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Active Communities</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-800 mt-2">7 / 7</p>
          <p className="text-[10px] text-stone-400 mt-1">Monitored Jumuiya groups</p>
        </div>
      </div>

      {/* Chart: Accuracy Comparison */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <h3 className="font-bold text-stone-800 text-sm mb-4">Accuracy Comparison Across 7 Jumuiyas (%)</h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-xs text-stone-400">Loading performance chart...</div>
        ) : chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-stone-400">No attempt data recorded yet.</div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(val: number) => [`${val.toFixed(1)}% Accuracy`, "Accuracy"]}
                />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Detailed Jumuiya Performance Table */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <h3 className="font-bold text-stone-800 text-sm mb-3">Liturgical Performance Standings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Jumuiya Name</th>
                <th className="py-3 px-3 text-center">Total Attempts</th>
                <th className="py-3 px-3 text-center">Correct Hits</th>
                <th className="py-3 px-3 text-center">Accuracy (%)</th>
                <th className="py-3 px-3 text-right">Engagement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {chartData.map((row, idx) => {
                const statusTag = row.accuracy >= 75 ? "Excellent" : row.accuracy >= 50 ? "Moderate" : "Needs Growth";
                const statusColor = row.accuracy >= 75 ? "bg-emerald-50 text-emerald-700" : row.accuracy >= 50 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700";
                return (
                  <tr key={row.name} className="hover:bg-stone-50">
                    <td className="py-3 px-3 font-bold text-stone-400">#{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-stone-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                      {row.name}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-stone-600">{row.attempts}</td>
                    <td className="py-3 px-3 text-center font-semibold text-emerald-600">{row.correct}</td>
                    <td className="py-3 px-3 text-center font-black text-amber-700">{row.accuracy.toFixed(1)}%</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${statusColor}`}>
                        {statusTag}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
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
          <button
            onClick={() => setView("analytics")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              view === "analytics" ? "bg-amber-600 text-white shadow-sm" : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
            }`}
          >
            <BarChart3 size={13} />
            7 Jumuiyas Performance Analytics
          </button>
          <button
            onClick={() => setView("weekly")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              view === "weekly" ? "bg-amber-600 text-white shadow-sm" : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
            }`}
          >
            <CalendarDays size={13} />
            Weekly Challenge
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
        ) : view === "analytics" ? (
          <JumuiyaAnalyticsOverview membersList={members} />
        ) : view === "weekly" ? (
          <WeeklyChallengeManager />
        ) : activeMember ? (
          <MemberProfile member={activeMember} />
        ) : (
          <div className="p-8 text-center text-stone-400 text-sm">Select a Jumuiya tab above</div>
        )}
      </div>
    </div>
  );
}


