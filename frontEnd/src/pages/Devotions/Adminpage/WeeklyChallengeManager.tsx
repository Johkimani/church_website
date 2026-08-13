import { useCallback, useEffect, useState } from "react";
import {
  FaCheckCircle, FaPlay, FaEye, FaUpload, FaSave, FaSearch,
} from "react-icons/fa";
import { CalendarDays, Trophy, Activity, Sparkles } from "lucide-react";
import {
  listWeeklyChallenges,
  createWeeklyChallenge,
  fetchWeeklyChallengeDetail,
  updateWeeklyChallengeApi,
  activateWeeklyChallengeApi,
  publishWeeklyChallengeApi,
  reviewWeeklyChallengeApi,
  fetchManageQuestions,
  generateAndSaveQuestions,
  setQuestionStatusApi,
} from "../../../api/axiosInstance";

const JUMUIYA_META: Record<string, { name: string; color: string }> = {
  "st-anthony": { name: "St. Anthony of Padua", color: "#8b5cf6" },
  "st-augustine": { name: "St. Augustine", color: "#3b82f6" },
  "st-catherine": { name: "St. Catherine of Alexandria", color: "#b91c1c" },
  "st-dominic": { name: "St. Dominic", color: "#64748b" },
  "st-elizabeth": { name: "St. Elizabeth of Hungary", color: "#16a34a" },
  "st-maria-goretti": { name: "St. Maria Goretti", color: "#0ea5e9" },
  "st-monica": { name: "St. Monica", color: "#ea580c" },
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-stone-100 text-stone-600",
  active: "bg-emerald-50 text-emerald-700",
  published: "bg-indigo-50 text-indigo-700",
};

const formatJumuiyaName = (idOrSlug: string, apiName?: string | null): string => {
  if (apiName) return apiName;
  if (!idOrSlug) return "General Jumuiya";
  const key = idOrSlug.toLowerCase().trim();
  if (JUMUIYA_META[key]) return JUMUIYA_META[key].name;
  for (const [k, meta] of Object.entries(JUMUIYA_META)) {
    if (key.includes(k) || k.includes(key)) return meta.name;
  }
  const clean = idOrSlug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return clean.length > 30 ? "Jumuiya" : clean;
};

const formatWeek = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function WeeklyChallengeManager() {
  const [subview, setSubview] = useState<"list" | "create" | "review">("list");
  const [challenges, setChallenges] = useState<any[]>([]);
  const [approvedQuestions, setApprovedQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Review state
  const [reviewChallenge, setReviewChallenge] = useState<any>(null);
  const [reviewDetail, setReviewDetail] = useState<any>(null);

  // Member participation filter
  const [memberJumuiyaFilter, setMemberJumuiyaFilter] = useState("all");

  // Create form state
  const [form, setForm] = useState({
    weekStart: new Date().toISOString().slice(0, 10),
    topic: "",
    questionIds: [] as number[],
    questionSearch: "",
  });

  // Inline AI generation state
  const [generating, setGenerating] = useState(false);
  const [generatedBatch, setGeneratedBatch] = useState<any[]>([]);

  const loadChallenges = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listWeeklyChallenges();
      setChallenges(res.data?.challenges || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load challenges");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadApprovedQuestions = useCallback(async () => {
    try {
      const res = await fetchManageQuestions({ page: 1, limit: 200 });
      const all = Array.isArray(res.data?.questions) ? res.data.questions : [];
      setApprovedQuestions(all.filter((q: any) => q.status === "approved"));
    } catch (err) {
      console.error("Failed to load approved questions", err);
    }
  }, []);

  useEffect(() => {
    loadChallenges();
    loadApprovedQuestions();
  }, [loadChallenges, loadApprovedQuestions]);

  const openReview = async (id: number) => {
    setError("");
    try {
      const [detail, review] = await Promise.all([
        fetchWeeklyChallengeDetail(id),
        reviewWeeklyChallengeApi(id),
      ]);
      setReviewChallenge(detail.data?.challenge || null);
      setReviewDetail(review.data || null);
      setForm((f) => ({
        ...f,
        questionIds: (detail.data?.questions || []).map((q: any) => q._id),
        topic: detail.data?.challenge?.topic || "",
        weekStart: detail.data?.challenge?.weekStart?.slice(0, 10) || f.weekStart,
      }));
      setSubview("review");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to open review");
    }
  };

  const handleCreate = async () => {
    setError("");
    if (!form.topic.trim() || form.questionIds.length === 0) {
      setError("Provide a topic and select at least one question.");
      return;
    }
    setLoading(true);
    try {
      await createWeeklyChallenge({
        weekStart: form.weekStart,
        topic: form.topic.trim(),
        questionIds: form.questionIds,
      });
      setForm((f) => ({ ...f, topic: "", questionIds: [] }));
      setGeneratedBatch([]);
      await loadChallenges();
      setSubview("list");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create challenge");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setError("");
    if (!form.topic.trim()) {
      setError("Enter a topic first — it is used as both the challenge topic and the AI generation prompt.");
      return;
    }
    setGenerating(true);
    try {
      const res = await generateAndSaveQuestions({ topic: form.topic.trim() });
      const qs = Array.isArray(res.data?.questions)
        ? res.data.questions.map((q: any) => ({
            ...q,
            _id: q._id ?? q.id,
            status: q.status || "draft",
          }))
        : [];
      if (qs.length === 0) {
        setError("The AI returned no questions for this topic. Try again.");
      }
      setGeneratedBatch((prev) => {
        const seen = new Set(prev.map((q: any) => q._id));
        return [...prev, ...qs.filter((q: any) => !seen.has(q._id))];
      });
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const handleBatchStatus = async (q: any, status: "approved" | "rejected") => {
    setError("");
    const id: number = q._id;
    try {
      await setQuestionStatusApi(id, status);
      setGeneratedBatch((prev) =>
        prev.map((x) => (x._id === id ? { ...x, status } : x))
      );
      setForm((f) => ({
        ...f,
        questionIds:
          status === "approved"
            ? f.questionIds.includes(id)
              ? f.questionIds
              : [...f.questionIds, id]
            : f.questionIds.filter((x) => x !== id),
      }));
      if (status === "approved") await loadApprovedQuestions();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || "Failed to update question status");
    }
  };

  const handleSaveEdit = async () => {
    if (!reviewChallenge) return;
    setError("");
    if (form.questionIds.length === 0) {
      setError("Select at least one question.");
      return;
    }
    setLoading(true);
    try {
      await updateWeeklyChallengeApi(reviewChallenge.id, {
        topic: form.topic,
        questionIds: form.questionIds,
      });
      await loadChallenges();
      await openReview(reviewChallenge.id);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: number) => {
    if (!window.confirm("Activate this challenge? Members will be able to answer it once its week arrives.")) return;
    setError("");
    try {
      await activateWeeklyChallengeApi(id);
      await loadChallenges();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to activate challenge");
    }
  };

  const handlePublish = async (id: number) => {
    if (!window.confirm("Publish this week's results? This freezes the standings for members and marks the challenge as published.")) return;
    setError("");
    setLoading(true);
    try {
      await publishWeeklyChallengeApi(id);
      await loadChallenges();
      setSubview("list");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to publish challenge");
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (id: number) => {
    setForm((f) => ({
      ...f,
      questionIds: f.questionIds.includes(id)
        ? f.questionIds.filter((x) => x !== id)
        : [...f.questionIds, id],
    }));
  };

  const statusBadge = (status: string) => (
    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide ${STATUS_STYLES[status] || "bg-stone-100 text-stone-600"}`}>
      {status}
    </span>
  );

  const filteredQuestions = approvedQuestions.filter((q: any) =>
    q.questionText?.toLowerCase().includes(form.questionSearch.toLowerCase())
  );

  const members = reviewDetail?.members || [];
  const memberJumuiyas = Array.from(
    new Map(
      members
        .filter((m: any) => m.jumuiyaId)
        .map((m: any) => [m.jumuiyaId, m.jumuiyaName || formatJumuiyaName(m.jumuiyaId)])
    ).entries()
  ).map(([id, name]) => ({ id, name }));
  const filteredMembers =
    memberJumuiyaFilter === "all"
      ? members
      : members.filter((m: any) => m.jumuiyaId === memberJumuiyaFilter);

  const QuestionPicker = ({ value, onChange }: { value: number[]; onChange: (id: number) => void }) => (
    <div className="border border-stone-200 rounded-xl bg-stone-50 p-3 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-stone-600">
          Or pick from previously approved questions ({value.length} selected)
        </span>
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={form.questionSearch}
            onChange={(e) => setForm((f) => ({ ...f, questionSearch: e.target.value }))}
            placeholder="Search questions..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 bg-white rounded-lg border border-stone-100">
        {filteredQuestions.length === 0 ? (
          <p className="p-4 text-center text-xs text-stone-400">
            No approved questions. Generate a batch and approve questions first.
          </p>
        ) : (
          filteredQuestions.map((q: any) => {
            const checked = value.includes(q._id);
            return (
              <label
                key={q._id}
                className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                  checked ? "bg-amber-50" : "hover:bg-stone-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange(q._id)}
                  className="mt-0.5 accent-amber-600"
                />
                <span className="text-xs text-stone-700 leading-relaxed">{q.questionText}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 mt-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-sm text-white">
          <CalendarDays className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-stone-800 text-base">Weekly Challenge Builder</h3>
          <p className="text-xs text-stone-500">
            Curate approved questions into a Mon–Sun weekly challenge, then activate and publish results.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 mt-4 border-b border-stone-100 pb-3">
        {(
          [
            ["list", "Challenges"],
            ["create", "Create New"],
            ["review", "Review"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSubview(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subview === key
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-stone-50 text-stone-600 hover:bg-stone-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* LIST VIEW */}
      {subview === "list" && (
        <div className="mt-4">
          {loading ? (
            <div className="py-8 text-center text-xs text-stone-400">Loading challenges...</div>
          ) : challenges.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-400">
              No challenges created yet. Go to "Create New" to build this week's challenge.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-3">Week</th>
                    <th className="py-3 px-3">Topic</th>
                    <th className="py-3 px-3 text-center">Questions</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {challenges.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/80">
                      <td className="py-3 px-3 font-semibold text-stone-600 whitespace-nowrap">
                        {formatWeek(c.weekStart)} – {formatWeek(c.weekEnd)}
                      </td>
                      <td className="py-3 px-3 font-semibold max-w-xs truncate" title={c.topic}>
                        {c.topic}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-stone-500">{c.questionCount}</td>
                      <td className="py-3 px-3 text-center">{statusBadge(c.status)}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {c.status === "draft" && (
                            <button
                              onClick={() => handleActivate(c.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 flex items-center gap-1.5"
                              title="Activate challenge"
                            >
                              <FaPlay size={10} /> Activate
                            </button>
                          )}
                          {c.status === "active" && (
                            <button
                              onClick={() => handlePublish(c.id)}
                              disabled={loading}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center gap-1.5 disabled:opacity-50"
                              title="Publish this week's results"
                            >
                              <FaUpload size={10} /> Publish
                            </button>
                          )}
                          <button
                            onClick={() => openReview(c.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 flex items-center gap-1.5"
                            title="View / review challenge"
                          >
                            <FaEye size={10} /> {c.status === "draft" ? "Edit" : "Review"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE VIEW */}
      {subview === "create" && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Week</label>
              <input
                type="date"
                value={form.weekStart}
                onChange={(e) => setForm((f) => ({ ...f, weekStart: e.target.value }))}
                className="w-full border border-stone-200 rounded-xl p-2.5 text-xs bg-stone-50"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Any date in the week — the challenge runs Monday to Sunday.
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">Topic</label>
              <input
                type="text"
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                placeholder="E.g., Parables of the Kingdom"
                className="w-full border border-stone-200 rounded-xl p-2.5 text-xs bg-stone-50"
              />
            </div>
          </div>

          <QuestionPicker value={form.questionIds} onChange={toggleQuestion} />

          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm"
          >
            <FaSave size={12} />
            {loading ? "Creating..." : "Create Draft Challenge"}
          </button>
        </div>
      )}

      {/* REVIEW VIEW */}
      {subview === "review" && reviewChallenge && (
        <div className="mt-4 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50 border border-stone-200 rounded-xl p-4">
            <div>
              <p className="font-bold text-stone-800 text-sm">{reviewChallenge.topic}</p>
              <p className="text-xs text-stone-500 mt-0.5">
                {formatWeek(reviewChallenge.weekStart)} – {formatWeek(reviewChallenge.weekEnd)} ·{" "}
                {reviewChallenge.questionCount} questions
              </p>
            </div>
            <div className="flex items-center gap-2">
              {statusBadge(reviewChallenge.status)}
              {reviewChallenge.status === "active" && (
                <button
                  onClick={() => handlePublish(reviewChallenge.id)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <FaUpload size={11} /> Publish Results
                </button>
              )}
            </div>
          </div>

          {/* Draft editor */}
          {reviewChallenge.status === "draft" && (
            <div className="space-y-4 border border-amber-100 rounded-xl p-4 bg-amber-50/40">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Draft Editor</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">Topic</label>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl p-2.5 text-xs bg-white"
                  />
                </div>
              </div>
              <QuestionPicker value={form.questionIds} onChange={toggleQuestion} />
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm"
              >
                <FaSave size={12} /> {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {/* Answer key (liturgist only) */}
          <div>
            <h4 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3">
              Question Bank ({reviewChallenge.questionCount})
            </h4>
            {reviewDetail?.questions ? (
              <div className="space-y-3">
                {reviewDetail.questions.map((q: any, i: number) => (
                  <div key={q._id} className="border border-stone-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-stone-700">
                      {i + 1}. {q.questionText}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-bold mt-1">
                      Correct: {q.correctAnswer?.option}) {q.correctAnswer?.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400">Loading question bank...</p>
            )}
          </div>

          {/* Jumuiya standings */}
          <div>
            <h4 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Trophy size={12} /> Jumuiya Standings (avg member accuracy)
            </h4>
            {!reviewDetail ? (
              <p className="text-xs text-stone-400">Loading results...</p>
            ) : (reviewDetail.jumuiyas || []).length === 0 ? (
              <p className="text-xs text-stone-400">
                No attempts recorded for this week yet.
              </p>
            ) : (
              <div className="overflow-x-auto border border-stone-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">Jumuiya</th>
                      <th className="py-2.5 px-3 text-center">Members</th>
                      <th className="py-2.5 px-3 text-center">Attempts</th>
                      <th className="py-2.5 px-3 text-center">Avg Member Accuracy</th>
                      <th className="py-2.5 px-3 text-center">Overall Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {reviewDetail.jumuiyas.map((j: any, idx: number) => (
                      <tr key={j._id} className="hover:bg-stone-50">
                        <td className="py-2.5 px-3 font-bold text-stone-400">#{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold">{formatJumuiyaName(j._id, j.name)}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-stone-600">{j.participatingMembers}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-stone-600">{j.totalAttempts}</td>
                        <td className="py-2.5 px-3 text-center font-black text-amber-700">{j.avgMemberAccuracy}%</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-stone-600">{j.overallAccuracy}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Question performance */}
          <div>
            <h4 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity size={12} /> Question Performance
            </h4>
            {(reviewDetail?.questionStats || []).length === 0 ? (
              <p className="text-xs text-stone-400">No question stats yet.</p>
            ) : (
              <div className="overflow-x-auto border border-stone-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Question</th>
                      <th className="py-2.5 px-3 text-center">Attempted</th>
                      <th className="py-2.5 px-3 text-center">Correct</th>
                      <th className="py-2.5 px-3 text-center">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {reviewDetail.questionStats.map((q: any) => (
                      <tr key={q.questionId} className="hover:bg-stone-50">
                        <td className="py-2.5 px-3 font-semibold max-w-xs truncate" title={q.questionText}>
                          {q.questionText}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-stone-600">{q.attempted}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-emerald-600">{q.correctCount}</td>
                        <td className="py-2.5 px-3 text-center font-black text-amber-700">
                          {q.attempted ? Math.round((q.correctCount / q.attempted) * 100) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Member participation */}
          <div>
            <h4 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <FaCheckCircle size={12} /> Member Participation
            </h4>
            {members.length === 0 ? (
              <p className="text-xs text-stone-400">No members attempted this week yet.</p>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-stone-600">Filter by Jumuiya:</span>
                  <select
                    value={memberJumuiyaFilter}
                    onChange={(e) => setMemberJumuiyaFilter(e.target.value)}
                    className="border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="all">All Jumuiyas ({members.length})</option>
                    {memberJumuiyas.map((j) => (
                      <option key={String(j.id)} value={String(j.id)}>
                        {j.name}
                      </option>
                    ))}
                  </select>
                  {memberJumuiyaFilter !== "all" && (
                    <button
                      onClick={() => setMemberJumuiyaFilter("all")}
                      className="text-[10px] font-bold text-amber-700 hover:text-amber-900"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto border border-stone-100 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Member</th>
                        <th className="py-2.5 px-3">Jumuiya</th>
                        <th className="py-2.5 px-3 text-center">Answered</th>
                        <th className="py-2.5 px-3 text-center">Correct</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {filteredMembers.map((m: any) => (
                        <tr key={m.memberId} className="hover:bg-stone-50">
                          <td className="py-2.5 px-3 font-semibold">{m.name}</td>
                          <td className="py-2.5 px-3 text-stone-500">
                            {formatJumuiyaName(m.jumuiyaId, m.jumuiyaName)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold text-stone-600">{m.answered}</td>
                          <td className="py-2.5 px-3 text-center font-semibold text-emerald-600">{m.correct}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {subview === "review" && !reviewChallenge && (
        <div className="mt-4 py-8 text-center text-xs text-stone-400">
          Select a challenge from the Challenges tab to review it.
        </div>
      )}
    </div>
  );
}
