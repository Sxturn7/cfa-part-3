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
  easy: "bg-emerald-50 text-emerald-800 border-emerald-100",
  medium: "bg-blue-50 text-blue-800 border-blue-100",
  hard: "bg-amber-50 text-amber-800 border-amber-100",
  expert: "bg-orange-50 text-orange-800 border-orange-100",
  superhuman: "bg-rose-50 text-rose-800 border-rose-100"
};

export default function QuizPane({ subjects, onRecordQuizScore }: QuizPaneProps) {
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
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [, setErrorLog] = useState<string | null>(null);
 
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
      <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--theme-border)]/20 pb-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-[var(--theme-text-dark)] tracking-tight">
              Curriculum Diagnostic Quiz
            </h3>
            <p className="text-xs text-[var(--theme-text-main)] mt-1.5 opacity-75">
              Formulate conceptual vignette questions across the active CFA Level I syllabus.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] px-3 py-1 font-medium rounded-full border ${DIFFICULTY_COLORS[difficulty]}`}>
              {DIFFICULTY_LABELS[difficulty]}
            </span>
          </div>
        </div>

        {/* Options Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 bg-[var(--theme-beige)]/20 p-5 rounded-2xl border border-[var(--theme-border)]/30">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-medium text-[var(--theme-text-main)] mb-1.5 opacity-80">
              Select Syllabus Chapter
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                fetchQuestion(e.target.value, difficulty);
              }}
              className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)]/40 text-[var(--theme-text-dark)] text-xs font-medium outline-none rounded-xl p-2.5 focus:border-[var(--theme-accent)] transition cursor-pointer"
            >
              <option value="all">Comprehensive Mix (All Chapters)</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.weight})
                </option>
              ))}
            </select>
          </div>

          {/* Micro Stats Grid */}
          <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-[var(--theme-border)]/20 pt-4 sm:pt-0 sm:pl-6">
            <div className="text-center px-2">
              <span className="block text-lg font-semibold text-[var(--theme-text-dark)]">{accuracy}%</span>
              <span className="text-[10px] text-[var(--theme-text-main)] opacity-70 block mt-0.5">Accuracy</span>
            </div>
            <div className="text-center px-3 border-l border-[var(--theme-border)]/20">
              <span className="block text-lg font-semibold text-[var(--theme-text-dark)]">{streak}</span>
              <span className="text-[10px] text-[var(--theme-text-main)] opacity-70 block mt-0.5">Streak 🔥</span>
            </div>
            <div className="text-center px-2 border-l border-[var(--theme-border)]/20">
              <span className="block text-lg font-semibold text-[var(--theme-text-dark)]">{totalAnswered}</span>
              <span className="text-[10px] text-[var(--theme-text-main)] opacity-70 block mt-0.5">Solved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Active Question panel */}
        <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 rounded-2xl p-6 shadow-xs lg:col-span-2 relative min-h-[400px] flex flex-col justify-between">
          
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-16 animate-fadeIn">
              <RefreshCw size={28} className="text-[var(--theme-accent)] animate-spin opacity-85" />
              <p className="text-[11px] text-[var(--theme-text-main)] opacity-70 animate-pulse font-mono">
                Formulating quiz questions...
              </p>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between animate-fadeIn">
              <div>
                {/* Meta Row */}
                <div className="flex justify-between items-center text-xs text-[var(--theme-text-main)] opacity-85 border-b border-[var(--theme-border)]/20 pb-3 mb-4">
                  <span className="text-[11px] font-semibold text-[var(--theme-text-dark)] opacity-90">
                    Category: {subjects.find(s => s.id === currentQuestion.subjectId)?.name || "Mixed Chapters"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(currentQuestion.id)}
                    className="flex items-center gap-1.5 hover:text-[var(--theme-accent)] transition cursor-pointer"
                  >
                    <BookMarked size={13} className={bookmarkedIds.includes(currentQuestion.id) ? "text-[var(--theme-accent)] fill-[var(--theme-accent)]" : "text-[var(--theme-text-main)] opacity-60"} />
                    <span className="text-[10px]">{bookmarkedIds.includes(currentQuestion.id) ? "Flagged" : "Flag Question"}</span>
                  </button>
                </div>

                {/* Vignette Statement */}
                <div className="bg-[var(--theme-beige)]/30 border border-[var(--theme-border)]/20 p-5 rounded-xl text-xs leading-relaxed text-[var(--theme-text-dark)] mb-5">
                  <HelpCircle size={15} className="inline text-[var(--theme-accent)] mr-2 -mt-0.5 opacity-80" />
                  {currentQuestion.question}
                </div>

                {/* Question Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((opt, oIdx) => {
                    const isOptSelected = selectedAnswer === oIdx;
                    const isCorr = oIdx === currentQuestion.correctAnswerIndex;
                    const wasThisChosen = answered && isOptSelected;

                    let optionStyles = "bg-[var(--theme-card)] border-[var(--theme-border)]/35 text-[var(--theme-text-dark)] hover:bg-[var(--theme-beige)]/30";
                    if (isOptSelected && !answered) {
                      optionStyles = "bg-[var(--theme-accent-light)] border-[var(--theme-accent)] text-[var(--theme-accent)] font-semibold";
                    } else if (answered) {
                      if (isCorr) {
                        optionStyles = "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold";
                      } else if (wasThisChosen) {
                        optionStyles = "bg-rose-50 border-rose-300 text-rose-800";
                      } else {
                        optionStyles = "bg-[var(--theme-card)] border-[var(--theme-border)]/20 text-[var(--theme-text-main)] opacity-50 cursor-not-allowed";
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        disabled={answered}
                        onClick={() => handleSelectAnswer(oIdx)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border text-xs font-medium transition-all duration-150 flex justify-between items-center ${optionStyles} cursor-pointer hover:-translate-y-[1px]`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="font-mono text-[10px] opacity-50">
                            {["A", "B", "C", "D"][oIdx]}.
                          </span>
                          <span>{opt}</span>
                        </span>

                        {answered && isCorr && <CheckCircle2 className="text-emerald-600 w-4 h-4 shrink-0" />}
                        {answered && wasThisChosen && !isCorr && <XCircle className="text-rose-600 w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action operations bar */}
              <div className="flex items-center justify-between border-t border-[var(--theme-border)]/20 pt-4 mt-6">
                <div className="text-[10px] text-[var(--theme-text-main)]">
                  {answered ? (
                    isCorrect ? (
                      <span className="text-emerald-700 font-semibold">✨ Correct! Progress logged.</span>
                    ) : (
                      <span className="text-rose-700 font-semibold">❌ Incorrect. Review explanation.</span>
                    )
                  ) : (
                    <span className="opacity-70">Select an option above to check.</span>
                  )}
                </div>

                {!answered ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-bg)] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-[1px] cursor-pointer"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-bg)] text-xs font-semibold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-[1px] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next Question</span> <ChevronRight size={14} className="opacity-80" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <AlertCircle className="text-amber-600 w-8 h-8 mb-2 animate-bounce" />
              <p className="text-xs text-[var(--theme-text-main)]">Failed to load active study card.</p>
              <button onClick={handleNextQuestion} className="mt-4 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-xs px-4 py-2 rounded-xl cursor-pointer">
                Reset & Retry
              </button>
            </div>
          )}

        </div>

        {/* Right column: Explanations AND Difficulty Controllers */}
        <div className="space-y-4">
          
          {/* Real-time difficulty controllers */}
          <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 rounded-2xl p-5 shadow-xs">
            <h5 className="text-xs font-semibold text-[var(--theme-text-dark)] mb-2.5 flex items-center gap-1.5">
              <Zap size={14} className="text-[var(--theme-accent)] opacity-70" />
              Challenge Level
            </h5>
            <p className="text-xs text-[var(--theme-text-main)] opacity-75 leading-relaxed mb-4">
              Select the cognitive depth of your vignette questions:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDifficultyAdjust("down")}
                disabled={difficulty === "easy" || isLoading}
                className="flex items-center justify-center gap-1 bg-[var(--theme-beige)]/50 hover:bg-[var(--theme-beige)]/70 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium px-3 py-2.5 rounded-xl border border-[var(--theme-border)]/20 text-[var(--theme-text-dark)] transition-all cursor-pointer hover:-translate-y-[1px]"
              >
                <ArrowDown size={14} className="opacity-70" />
                <span>Go Easier</span>
              </button>
              <button
                type="button"
                onClick={() => handleDifficultyAdjust("up")}
                disabled={difficulty === "superhuman" || isLoading}
                className="flex items-center justify-center gap-1 bg-[var(--theme-beige)]/50 hover:bg-[var(--theme-beige)]/70 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium px-3 py-2.5 rounded-xl border border-[var(--theme-border)]/20 text-[var(--theme-text-dark)] transition-all cursor-pointer hover:-translate-y-[1px]"
              >
                <ArrowUp size={14} className="opacity-70" />
                <span>Go Harder</span>
              </button>
            </div>

            <div className="text-[11px] text-[var(--theme-text-main)] opacity-80 mt-4 flex items-center justify-between border-t border-[var(--theme-border)]/15 pt-3">
              <span>Current difficulty:</span>
              <span className="text-[var(--theme-accent)] font-semibold capitalize">{difficulty}</span>
            </div>
          </div>

          {/* Active Question Explanatory breakdown */}
          {answered && currentQuestion && (
            <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 rounded-2xl p-5 shadow-xs animate-fadeIn max-h-[340px] overflow-y-auto">
              <div className="text-xs font-semibold text-[var(--theme-accent)] mb-3 flex items-center gap-1.5 border-b border-[var(--theme-border)]/15 pb-2">
                <AlertCircle size={13} className="opacity-70" />
                Rationale & Explanation
              </div>
              <p className="text-xs text-[var(--theme-text-dark)] leading-relaxed whitespace-pre-line font-sans opacity-95">
                {currentQuestion.explanation}
              </p>
              <div className="mt-4 pt-3 border-t border-[var(--theme-border)]/15 text-[10px] text-[var(--theme-text-main)] opacity-50 italic">
                Citing Module: {currentQuestion.moduleId.toUpperCase()}
              </div>
            </div>
          )}

          {/* Instruction helper */}
          {!answered && (
            <div className="bg-[var(--theme-card)] border border-[var(--theme-border)]/35 rounded-2xl p-6 text-center text-xs text-[var(--theme-text-main)] py-8 shadow-xs">
              <Award size={24} className="mx-auto mb-2.5 text-[var(--theme-text-main)] opacity-35" />
              <p className="font-semibold text-[var(--theme-text-dark)]">Evaluate Your Recall</p>
              <p className="text-[10px] opacity-70 mt-1 max-w-xs mx-auto leading-relaxed">
                Choose the best answer option to verify your understanding. Correct answers update your chapters' review ratings in the curriculum directory.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
