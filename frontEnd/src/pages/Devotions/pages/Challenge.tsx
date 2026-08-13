import { useState, useEffect } from "react";
import { FaHome, FaInbox } from "react-icons/fa";
import type { Question } from "../data/questions";
import {
  recordAttemptApi,
  fetchTodayChallengeStatus,
  fetchCurrentWeeklyChallenge,
} from "../../../api/axiosInstance";
import { useAuth } from "../../../context/AuthContext";
import { ArrowRightIcon, CheckCircle2, CalendarDays } from "lucide-react";

interface ChallengeInfo {
  id: number;
  weekStart: string;
  weekEnd: string;
  topic: string;
  questionCount: number;
}

interface AnswerResult {
  selectedIndex: number;
  correct: boolean;
  explanation: string;
}

// Weekly challenge questions carry no answer key — correctness only arrives
// from the server's attempt response, one attempt per question per week.
const mapWeeklyQuestion = (q: any): Question => ({
  id: q._id,
  question: q.questionText || "",
  options: q.answers?.map((a: any) => a.text) || [],
  correctAnswer: -1, // unknown client-side
  category: "Weekly Challenge",
  difficulty: "Medium",
  reward: 10,
  explanation: "",
});

const formatWeekRange = (start: string, end: string) => {
  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
};

export default function Challenge() {
  const { user } = useAuth();

  const [status, setStatus] = useState<"loading" | "none" | "welcome" | "portal" | "completed">("loading");
  const [challenge, setChallenge] = useState<ChallengeInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<Record<string, AnswerResult>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // LOAD: current weekly challenge, minus anything already answered this week.
  useEffect(() => {
    const load = async () => {
      if (!user) {
        setStatus("none");
        return;
      }

      try {
        const res = await fetchCurrentWeeklyChallenge();
        const ch = res.data?.challenge;
        const qs: Question[] = Array.isArray(res.data?.questions)
          ? res.data.questions.map(mapWeeklyQuestion)
          : [];

        if (!ch || qs.length === 0) {
          setStatus("none");
          return;
        }

        setChallenge({
          id: ch.id,
          weekStart: ch.weekStart,
          weekEnd: ch.weekEnd,
          topic: ch.topic,
          questionCount: ch.questionCount,
        });

        let answered: (number | string)[] = [];
        try {
          const st = await fetchTodayChallengeStatus();
          if (Array.isArray(st.data?.answeredQuestionIds)) {
            answered = st.data.answeredQuestionIds;
          }
        } catch (err) {
          console.error("Failed to check challenge status", err);
        }

        const remaining = qs.filter((q) => !answered.includes(q.id));
        if (remaining.length === 0) {
          setQuestions(qs);
          setStatus("completed");
        } else {
          setQuestions(remaining);
          setStatus("welcome");
        }
      } catch (err: any) {
        // 404 => no active challenge for this week
        console.error("Failed to load weekly challenge", err);
        setStatus("none");
      }
    };

    load();
  }, [user]);

  const handleStartChallenge = () => {
    setStatus("portal");
    setCurrentQuestionIndex(0);
    setResults({});
  };

  // One attempt per question per week — no going back, no retries.
  const handleNextQuestion = async (selectedIndex: number) => {
    const current = questions[currentQuestionIndex];
    const key = String(current.id);

    try {
      const res = await recordAttemptApi({
        questionId: current.id,
        selectedOption: selectedIndex,
      });
      setResults((prev) => ({
        ...prev,
        [key]: {
          selectedIndex,
          correct: !!res.data?.correct,
          explanation: res.data?.explanation || "",
        },
      }));
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setResults((prev) => ({
          ...prev,
          [key]: {
            selectedIndex,
            correct: false,
            explanation: "You already answered this question this week.",
          },
        }));
      } else {
        console.warn("Attempt recording failed:", err);
        setResults((prev) => ({
          ...prev,
          [key]: {
            selectedIndex,
            correct: false,
            explanation: "Could not record your answer. Try again next week.",
          },
        }));
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setStatus("completed");
    }
  };

  const score = Object.values(results).filter((r) => r.correct).length;

  // ================= UI =================

  const styles = `
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 2s ease-in-out forwards;
  }
}
`;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="text-slate-400 text-sm italic">Loading this week's challenge...</div>
      </div>
    );
  }

  // ✅ NO ACTIVE CHALLENGE
  if (status === "none") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full mb-4 bg-amber-500/10">
            <FaInbox className="text-2xl text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Active Challenge This Week</h2>
          <p className="text-slate-300 mb-6">
            The weekly liturgical challenge has not been activated yet. Check back soon — new
            challenges are released by the liturgist every week.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition-all duration-300"
          >
            <FaHome />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // ✅ WELCOME
  if (status === "welcome") {
    const allDone = questions.length > 0 && Object.keys(results).length === questions.length;
    return (
      <>
        <style>{styles}</style>
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
          <div className="w-full max-w-4xl p-8 sm:p-10 relative overflow-hidden text-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-4">
                <CalendarDays size={12} />
                Weekly Liturgical Challenge
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-700 mb-4 tracking-tight drop-shadow-lg animate-fadeIn">
                {challenge?.topic || "Weekly Challenge"}
              </h1>

              <p className="italic text-slate-300 text-base sm:text-lg mb-6 max-w-xl mx-auto leading-relaxed">
                One attempt per question. No going back. Let your knowledge of the faith grow this
                week.
              </p>

              <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-slate-400 italic">
                <span>{questions.length} Questions</span>
                {challenge && (
                  <span>{formatWeekRange(challenge.weekStart, challenge.weekEnd)}</span>
                )}
              </div>

              {allDone ? (
                <div className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600/90 text-white rounded-lg text-lg font-semibold shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                  Challenge Completed This Week
                </div>
              ) : (
                <button
                  onClick={handleStartChallenge}
                  disabled={questions.length <= 0}
                  className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-amber-600 text-white rounded-lg text-lg font-semibold shadow-md hover:shadow-xl hover:scale-105 hover:bg-amber-700 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {questions.length <= 0 ? "No Questions Available" : "Let’s Go!"}
                  <ArrowRightIcon className="w-6 h-6" />
                </button>
              )}

              <p className="italic text-xs text-slate-500 mt-6">
                New questions unlock each week to keep your streak
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ✅ PORTAL (EXAM MODE)
  if (status === "portal" && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-300 font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="px-3 py-1 text-sm rounded-full bg-amber-500/10 text-amber-400 font-semibold">
              {challenge?.topic || "Weekly Challenge"}
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full mb-6">
            <div
              className="h-2 bg-amber-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h3 className="text-xl font-semibold text-white mb-6 leading-relaxed">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleNextQuestion(index)}
                className="w-full text-left p-4 rounded-xl border border-slate-800/50 bg-[#0a0f1c] hover:bg-[#0f1526] hover:border-amber-600/50 transition-all duration-200 shadow-sm"
              >
                <span className="font-medium text-slate-200">{option}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ✅ COMPLETED (REVIEW MODE)
  return (
    <div className="min-h-screen bg-transparent px-4 py-12 flex justify-center overflow-y-auto no-scrollbar">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center sm:items-start mb-12 px-2 gap-5">
          <div className="flex items-center gap-5">
            <div className="text-4xl sm:text-5xl animate-bounce">🏆</div>
            <div>
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.3em] italic">
                Weekly Challenge
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-none mb-1">
                Score: {score}
                <span className="text-slate-500">/{questions.length}</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">
                Know the Church
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-16 pb-32">
          {questions.map((q, i) => {
            const result = results[String(q.id)];
            const isCorrect = result?.correct === true;
            const isRecorded = !!result;

            return (
              <div
                key={q.id}
                className="animate-fadeIn relative"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-black text-slate-400 italic tracking-tighter">
                    QUESTION {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className={`h-[1px] flex-1 ${isRecorded && isCorrect ? "bg-green-500/20" : "bg-slate-700/30"}`} />
                  {isRecorded && isCorrect ? (
                    <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Mastered</span>
                  ) : (
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {isRecorded ? "Answered" : "Pending"}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-xl text-white mb-8 leading-snug max-w-xl">
                  {q.question}
                </h3>

                <div className="space-y-4">
                  {q.options.map((opt, idx) => {
                    const isUserChoice = result?.selectedIndex === idx;
                    const isCorrectAnswer = isRecorded && isCorrect && isUserChoice;

                    return (
                      <div key={idx} className="flex items-start gap-4 group">
                        <div
                          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 transition-all ${
                            isCorrectAnswer
                              ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                              : isUserChoice
                                ? "bg-red-400"
                                : "bg-slate-600"
                          }`}
                        />
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-medium transition-colors ${
                              isCorrectAnswer
                                ? "text-white font-bold"
                                : isUserChoice
                                  ? "text-red-400"
                                  : "text-slate-300"
                            }`}
                          >
                            {opt}
                          </span>
                          {isCorrectAnswer && (
                            <span className="text-[8px] font-black text-green-400 uppercase tracking-widest mt-1">
                              Correct Answer
                            </span>
                          )}
                          {isUserChoice && !isCorrect && isRecorded && (
                            <span className="text-[8px] font-black text-red-400 uppercase tracking-widest mt-1">
                              Your Selection
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {result?.explanation && (
                  <div className="mt-8 pl-6 border-l-2 border-slate-800/50">
                    <p className="text-xs text-slate-400 italic leading-relaxed font-semibold">
                      {result.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
