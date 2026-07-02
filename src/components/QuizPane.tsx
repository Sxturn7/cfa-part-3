import React, { useState, useEffect } from "react";
import { Subject, ModuleProgress } from "../types";
import { Question } from "../curriculum";
import { getProceduralQuestion } from "../utils/proceduralQuiz";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, HelpCircle, BookMarked, Award, ChevronRight, Zap, ArrowUp, ArrowDown } from "lucide-react";

interface QuizPaneProps {
  subjects: Subject[];
  progress: Record<string, ModuleProgress>;
  onRecordQuizScore: (moduleId: string, score: number) => void;
}

const DIFFICULTIES = ["easy", "medium", "hard", "expert", "superhuman"] as const;
type Difficulty = typeof DIFFICULTIES[number];

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy (Fundamentals)",
  medium: "Medium (Conceptual AP)",
  hard: "Hard (Exam Vignette)",
  expert: "Expert (Curriculum Traps)",
  superhuman: "Superhuman (Quantitative Master)"
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "bg-emerald-950/20 text-emerald-400 border-emerald-800/80",
  medium: "bg-blue-950/20 text-blue-400 border-blue-800/80",
  hard: "bg-amber-950/20 text-amber-400 border-amber-800/80",
  expert: "bg-orange-950/20 text-orange-400 border-orange-800/80",
  superhuman: "bg-red-950/20 text-red-400 border-red-800/80 animate-pulse"
};

export default function QuizPane({ subjects, progress, onRecordQuizScore }: QuizPaneProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  // Selection states
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  
  // Quiz progress stats
  const [streak, setStreak] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [totalCorrect, setTotalCorrect] = useState<number>(0);
  
  // System states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUsingAi, setIsUsingAi] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [errorLog, setErrorLog] = useState<string | null>(null);
 
  // Load a question immediately upon choosing/starting
  const fetchQuestion = async (subjId: string, diff: Difficulty) => {
    setIsLoading(true);
    setErrorLog(null);
    setSelectedAnswer(null);
    setAnswered(false);
 
    // Emulate a micro-loading state for high-quality feel, completely client-side
    setTimeout(() => {
      try {
        const quest = getProceduralQuestion(subjId, diff);
        setCurrentQuestion(quest);
        setIsUsingAi(false);
      } catch (err: any) {
        console.error("Local generator failed:", err);
        setErrorLog("Could not generate a local study vignette.");
      } finally {
        setIsLoading(false);
      }
    }, 250);
  };

  // Trigger initial question on first load
  useEffect(() => {
    fetchQuestion(selectedSubjectId, difficulty);
  }, []);

  const handleSelectAnswer = (optionIdx: number) => {
    if (answered || isLoading) return;
    setSelectedAnswer(optionIdx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const correct = selectedAnswer === currentQuestion.correctAnswerIndex;
    setIsCorrect(correct);
    setAnswered(true);

    // Update running counts
    setTotalAnswered(prev => prev + 1);
    if (correct) {
      setTotalCorrect(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    // Log the score back to curriculum modules! (This makes sure the curriculum progress state is reactive)
    const scoreVal = correct ? 100 : 0;
    // We update module average scores in root
    onRecordQuizScore(currentQuestion.moduleId, scoreVal);
  };

  // Adjust difficulty and fetch next
  const handleDifficultyAdjust = (direction: "up" | "down") => {
    const currentIdx = DIFFICULTIES.indexOf(difficulty);
    let nextIdx = currentIdx;

    if (direction === "up" && currentIdx < DIFFICULTIES.length - 1) {
      nextIdx = currentIdx + 1;
    } else if (direction === "down" && currentIdx > 0) {
      nextIdx = currentIdx - 1;
    }

    const nextDiff = DIFFICULTIES[nextIdx];
    setDifficulty(nextDiff);
    fetchQuestion(selectedSubjectId, nextDiff);
  };

  const handleNextQuestion = () => {
    fetchQuestion(selectedSubjectId, difficulty);
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Quiz Top Control Dashboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
              📝 Practice & Diagnostic Quizzes
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select any topic area to review multiple choice questions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs px-3 py-1 font-sans rounded-full border font-medium ${DIFFICULTY_COLORS[difficulty]}`}>
              {DIFFICULTY_LABELS[difficulty]}
            </span>
          </div>
        </div>

        {/* Options Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Target Curriculum Topic
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                fetchQuestion(e.target.value, difficulty);
              }}
              className="w-full bg-slate-900 text-slate-100 text-xs font-sans font-medium outline-none border border-slate-800 rounded-lg p-2.5 focus:border-blue-500"
            >
              <option value="all">Mixed Levels (Comprehensive Review)</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.weight})
                </option>
              ))}
            </select>
          </div>

          {/* Micro Stats Grid */}
          <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
            <div className="text-center px-2">
              <span className="block text-lg font-sans font-bold text-slate-100">{accuracy}%</span>
              <span className="text-[10px] text-slate-400 font-sans block mt-0.5">Accuracy</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-lg font-sans font-bold text-slate-100">{streak}</span>
              <span className="text-[10px] text-slate-400 font-sans block mt-0.5">Streak 🔥</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-lg font-sans font-bold text-slate-100">{totalAnswered}</span>
              <span className="text-[10px] text-slate-400 font-sans block mt-0.5">Solved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Active Question panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm lg:col-span-2 relative min-h-[400px] flex flex-col justify-between">
          
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-16">
              <RefreshCw size={36} className="text-blue-500 animate-spin" />
              <p className="text-xs text-slate-400 font-mono animate-pulse">
                Formulating quiz questions...
              </p>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div>
                {/* Meta Row */}
                <div className="flex justify-between items-center text-xs text-slate-400 font-sans border-b border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-semibold text-slate-400">
                    Topic: {subjects.find(s => s.id === currentQuestion.subjectId)?.name || "Mixed Levels"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(currentQuestion.id)}
                    className="flex items-center gap-1.5 hover:text-amber-500 font-sans transition"
                  >
                    <BookMarked size={14} className={bookmarkedIds.includes(currentQuestion.id) ? "text-amber-500 fill-amber-500" : "text-slate-400"} />
                    <span className="text-[10px]">{bookmarkedIds.includes(currentQuestion.id) ? "Flagged" : "Flag Question"}</span>
                  </button>
                </div>

                {/* Vignette Statement */}
                <div className="bg-slate-850 border border-slate-800 p-5 rounded-xl text-sm leading-relaxed text-slate-100 font-serif mb-5 shadow-inner">
                  <HelpCircle size={16} className="inline text-blue-500 mr-2 -mt-1.5" />
                  {currentQuestion.question}
                </div>

                {/* Question Options */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((opt, oIdx) => {
                    const isOptSelected = selectedAnswer === oIdx;
                    const isCorr = oIdx === currentQuestion.correctAnswerIndex;
                    const wasThisChosen = answered && isOptSelected;

                    // Option color scheme variables
                    let optionStyles = "bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-200";
                    if (isOptSelected && !answered) {
                      optionStyles = "bg-slate-800 border-blue-500 text-slate-100 ring-1 ring-blue-500/30";
                    } else if (answered) {
                      if (isCorr) {
                        optionStyles = "bg-emerald-950/20 border-emerald-500 text-emerald-500 font-semibold ring-1 ring-emerald-500/25";
                      } else if (wasThisChosen) {
                        optionStyles = "bg-red-950/20 border-red-500 text-red-500 ring-1 ring-red-500/30";
                      } else {
                        optionStyles = "bg-slate-900/50 border-slate-800/50 text-slate-500 opacity-60 cursor-not-allowed";
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        disabled={answered}
                        onClick={() => handleSelectAnswer(oIdx)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-medium transition duration-150 flex justify-between items-center ${optionStyles} cursor-pointer`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-400">
                            {["A", "B", "C", "D"][oIdx]}.
                          </span>
                          <span>{opt}</span>
                        </span>

                        {answered && isCorr && <CheckCircle2 className="text-emerald-500 w-4 h-4 shrink-0" />}
                        {answered && wasThisChosen && !isCorr && <XCircle className="text-red-500 w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action operations bar */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
                <div className="text-[10px] text-slate-400 font-mono">
                  {answered ? (
                    isCorrect ? (
                      <span className="text-emerald-400 font-bold">✨ Correct! Score logged.</span>
                    ) : (
                      <span className="text-red-400 font-bold">❌ Incorrect. Review analysis below.</span>
                    )
                  ) : (
                    <span>⚠️ Select an option above to submit.</span>
                  )}
                </div>

                {!answered ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-xs font-bold px-6 py-2.5 rounded-xl tracking-wider uppercase transition active:scale-95 border-none shadow-sm cursor-pointer"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl tracking-wider uppercase transition flex items-center gap-1 cursor-pointer"
                  >
                    Next Question <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <AlertCircle className="text-amber-500 w-8 h-8 mb-2 animate-bounce" />
              <p className="text-xs text-slate-500">Failed to load active study card.</p>
              <button onClick={handleNextQuestion} className="mt-4 bg-blue-600 text-white text-xs px-4 py-2 rounded-xl cursor-pointer">
                Reset & Retry
              </button>
            </div>
          )}

        </div>

        {/* Right column: Explanations AND Difficulty Controllers */}
        <div className="space-y-4">
          
          {/* Real-time difficulty controllers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h5 className="text-xs font-bold text-slate-100 mb-2 flex items-center gap-1.5">
              <Zap size={14} className="text-blue-500" />
              Difficulty level
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Select the cognitive challenge level of your generated questions:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDifficultyAdjust("down")}
                disabled={difficulty === "easy" || isLoading}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700 text-slate-200 transition cursor-pointer"
                title="Shift to simpler core formulations"
              >
                <ArrowDown size={14} className="text-blue-500" />
                Go Easier
              </button>
              <button
                type="button"
                onClick={() => handleDifficultyAdjust("up")}
                disabled={difficulty === "superhuman" || isLoading}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-700 text-slate-200 transition cursor-pointer"
                title="Shift to complex vignettes and obscure exceptions"
              >
                <ArrowUp size={14} className="text-blue-500" />
                Go Harder
              </button>
            </div>

            <div className="text-[11px] text-slate-400 mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
              <span>Current scale:</span>
              <span className="font-sans text-blue-500 font-bold capitalize">{difficulty}</span>
            </div>
          </div>

          {/* Active Question Explanatory breakdown */}
          {answered && currentQuestion && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm animate-fadeIn max-h-[340px] overflow-y-auto scrollbar-thin">
              <div className="text-xs font-bold text-blue-500 mb-2.5 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <AlertCircle size={13} className="text-blue-500" />
                CFA Analysis & Explanations
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {currentQuestion.explanation}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 italic">
                Citing Module ID: {currentQuestion.moduleId.toUpperCase()}
              </div>
            </div>
          )}

          {/* Instruction helper */}
          {!answered && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center text-xs text-slate-500 py-8 shadow-sm">
              <Award size={28} className="mx-auto mb-2 text-slate-400 opacity-75" />
              <p className="font-medium text-slate-200">Select an Option</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed max-w-xs mx-auto">
                Choose the best answer option to evaluate your understanding of this topic.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
