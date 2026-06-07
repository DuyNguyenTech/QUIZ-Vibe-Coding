"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  AlertCircle,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Target,
  BarChart3,
  ArrowDown,
  PartyPopper,
  BookOpen,
} from "lucide-react";
import { getExam, type ExamDetail } from "../../lib/api";
import { useQuizStore, useAuthStore } from "../../lib/store";
import Image from "next/image";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.id);

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const [hasScrolledToSummary, setHasScrolledToSummary] = useState(false);

  const {
    answers,
    currentQuestion,
    timeRemaining,
    isSubmitted,
    isStarted,
    setAnswer,
    setCurrentQuestion,
    decrementTime,
    setSubmitted,
    startExam,
    initExam,
    resetQuiz,
  } = useQuizStore();

  const { lobbyNickname, lobbyAvatar, setLobbyInfo, user } = useAuthStore();

  // Wait for zustand hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Fetch exam data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const data = await getExam(examId);
        setExam(data);
      } catch (err: any) {
        setError(err.message || "Không thể tải đề thi");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  // Initialize exam store
  useEffect(() => {
    if (exam && hydrated) {
      initExam(examId, exam.questions.length);
    }
  }, [exam, hydrated, examId, initExam]);

  // Compute score client-side
  const scoreResult = useMemo(() => {
    if (!exam) return null;

    const totalQuestions = exam.questions.length;
    const answeredCount = Object.keys(answers).length;

    let correctCount = 0;
    const details = exam.questions.map((q) => {
      const userAnswer = answers[q.id] || null;
      const isCorrect =
        userAnswer !== null &&
        userAnswer.trim().toUpperCase() ===
          q.correctAnswer.trim().toUpperCase();
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        userAnswer,
        isCorrect,
      };
    });

    return {
      totalQuestions,
      answeredCount,
      correctCount,
      wrongCount: answeredCount - correctCount,
      scorePercentage:
        totalQuestions > 0
          ? Math.round((correctCount / totalQuestions) * 1000) / 10
          : 0,
      allAnswered: answeredCount === totalQuestions,
      details,
    };
  }, [exam, answers]);

  // Auto-scroll to summary when all questions are answered
  useEffect(() => {
    if (scoreResult?.allAnswered && !hasScrolledToSummary && summaryRef.current) {
      setTimeout(() => {
        summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        setHasScrolledToSummary(true);
      }, 500);
    }
  }, [scoreResult?.allAnswered, hasScrolledToSummary]);

  // Stop timer when all answered
  useEffect(() => {
    if (scoreResult?.allAnswered && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [scoreResult?.allAnswered]);

  // Handle auto-submit when time runs out
  const handleTimeUp = useCallback(() => {
    if (!isSubmitted) {
      setSubmitted(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isSubmitted, setSubmitted]);

  // Countdown timer
  useEffect(() => {
    if (!exam || isSubmitted || !hydrated || scoreResult?.allAnswered || !isStarted) return;

    timerRef.current = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exam, isSubmitted, hydrated, decrementTime, scoreResult?.allAnswered]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && exam && !isSubmitted && hydrated && isStarted) {
      const state = useQuizStore.getState();
      if (state.examId === examId && state.timeRemaining === 0) {
        handleTimeUp();
      }
    }
  }, [timeRemaining, exam, isSubmitted, hydrated, handleTimeUp, examId, isStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (scoreResult?.allAnswered) return "text-emerald-400";
    if (timeRemaining <= 60) return "text-danger";
    if (timeRemaining <= 300) return "text-amber-400";
    return "text-emerald-400";
  };

  const handleRetake = () => {
    resetQuiz();
    setHasScrolledToSummary(false);
    if (exam) {
      initExam(examId, exam.questions.length);
    }
  };

  // Loading state
  if (loading || !hydrated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !exam) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="glass-card p-10 text-center max-w-md animate-fade-in">
          <AlertCircle className="w-14 h-14 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Lỗi</h2>
          <p className="text-muted-foreground mb-6">
            {error || "Không tìm thấy đề thi"}
          </p>
          <button onClick={() => router.push("/exams")} className="btn-primary">
            <Home className="w-4 h-4" />
            Về danh sách đề
          </button>
        </div>
      </div>
    );
  }

  // Submitted view (manual submit or time-up, not all answered)
  if (isSubmitted && !scoreResult?.allAnswered) {
    return (
      <SubmittedView
        exam={exam}
        scoreResult={scoreResult!}
        onRetake={handleRetake}
        reason={timeRemaining === 0 ? "timeout" : "manual"}
      />
    );
  }

  // Prevent out-of-bounds error if state hasn't been reset for the new exam yet
  if (!hydrated || useQuizStore.getState().examId !== examId) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const currentQ = exam.questions[currentQuestion];

  // Extra safety net
  if (!currentQ) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  // Lobby view (before starting)
  if (!isStarted) {
    return (
      <LobbyView
        exam={exam}
        onStart={() => startExam()}
        initialNickname={user?.nickname || user?.email.split("@")[0] || lobbyNickname}
        initialAvatar={lobbyAvatar}
        setLobbyInfo={setLobbyInfo}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Confirm submit modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="glass-card p-8 max-w-sm w-full animate-fade-in text-center">
            <Send className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Nộp bài thi?</h3>
            <p className="text-muted-foreground text-sm mb-2">
              Bạn đã trả lời <span className="font-bold text-foreground">{answeredCount}/{exam.questions.length}</span> câu hỏi.
            </p>
            {answeredCount < exam.questions.length && (
              <p className="text-amber-400 text-sm mb-4">
                ⚠️ Còn {exam.questions.length - answeredCount} câu chưa trả lời sẽ tính là sai.
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="btn-secondary flex-1 justify-center"
              >
                Quay lại
              </button>
              <button
                onClick={() => {
                  setShowConfirmSubmit(false);
                  setSubmitted(true);
                  if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                  }
                }}
                className="btn-primary flex-1 justify-center"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Top Bar */}
        <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{exam.title}</h1>
            <p className="text-sm text-muted-foreground">
              Câu {currentQuestion + 1} / {exam.questions.length} •{" "}
              Đã trả lời: {answeredCount}/{exam.questions.length}
              {scoreResult && answeredCount > 0 && (
                <span className="ml-2">
                  • Đúng: <span className="text-success font-semibold">{scoreResult.correctCount}</span>
                  {" "}Sai: <span className="text-danger font-semibold">{scoreResult.wrongCount}</span>
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border font-mono text-lg font-bold ${getTimerColor()}`}
            >
              <Clock className="w-5 h-5" />
              {scoreResult?.allAnswered ? "Hoàn thành!" : formatTime(timeRemaining)}
            </div>
            {/* Submit button - always visible */}
            {!scoreResult?.allAnswered && (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="btn-primary"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Nộp bài</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Question Area */}
          <div className="flex-1 min-w-0">
            <div className="glass-card p-8 animate-fade-in" key={currentQuestion}>
              {/* Question number badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                Câu {currentQuestion + 1}
              </div>

              {/* Question text */}
              <h2 className="text-lg sm:text-xl font-semibold leading-relaxed mb-8">
                {currentQ.questionText}
              </h2>

              <div className="space-y-3">
                {(
                  [
                    { key: "A", text: currentQ.optionA },
                    { key: "B", text: currentQ.optionB },
                    { key: "C", text: currentQ.optionC },
                    { key: "D", text: currentQ.optionD },
                  ] as const
                ).map((opt) => {
                  const userAnswer = answers[currentQ.id];
                  const hasAnswered = !!userAnswer;
                  const isSelected = userAnswer === opt.key;
                  const isCorrectAnswer = currentQ.correctAnswer === opt.key;
                  const isWrongSelection = isSelected && !isCorrectAnswer;

                  let className = "option-btn ";
                  if (hasAnswered) {
                    className += "disabled ";
                    if (isCorrectAnswer) className += "correct ";
                    else if (isWrongSelection) className += "incorrect ";
                    else className += "opacity-50 ";
                  }

                  return (
                    <button
                      key={opt.key}
                      onClick={() => {
                        if (!hasAnswered) {
                          setAnswer(currentQ.id, opt.key);
                        }
                      }}
                      className={className}
                      disabled={hasAnswered}
                    >
                      <span
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                          hasAnswered
                            ? isCorrectAnswer
                              ? "bg-success/20 text-success"
                              : isWrongSelection
                              ? "bg-danger/20 text-danger"
                              : "bg-secondary border border-border text-muted-foreground"
                            : "bg-secondary border border-border text-muted-foreground"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="flex-1 text-left">{opt.text}</span>
                      {hasAnswered && isCorrectAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      )}
                      {hasAnswered && isWrongSelection && (
                        <XCircle className="w-5 h-5 text-danger flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Answer feedback message */}
              {answers[currentQ.id] && (
                <div
                  className={`mt-6 p-4 rounded-xl animate-fade-in ${
                    answers[currentQ.id] === currentQ.correctAnswer
                      ? "bg-success/10 border border-success/20"
                      : "bg-danger/10 border border-danger/20"
                  }`}
                >
                  {answers[currentQ.id] === currentQ.correctAnswer ? (
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      <p className="text-success font-medium">
                        Chính xác! 🎉
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-danger font-medium">
                          Sai rồi! 😥
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Đáp án đúng là: <span className="text-success font-bold">{currentQ.correctAnswer}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <button
                  onClick={() =>
                    setCurrentQuestion(Math.max(0, currentQuestion - 1))
                  }
                  disabled={currentQuestion === 0}
                  className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Câu trước
                </button>
                <button
                  onClick={() =>
                    setCurrentQuestion(
                      Math.min(exam.questions.length - 1, currentQuestion + 1)
                    )
                  }
                  disabled={currentQuestion === exam.questions.length - 1}
                  className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Câu sau
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Question Grid - Right Side */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="glass-card p-5 lg:sticky lg:top-24">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Lưới câu hỏi
              </h3>
              <div className="grid grid-cols-6 lg:grid-cols-5 gap-2">
                {exam.questions.map((q, i) => {
                  const userAnswer = answers[q.id];
                  const isAnswered = !!userAnswer;
                  const isCurrent = i === currentQuestion;
                  const isCorrect =
                    isAnswered &&
                    userAnswer.trim().toUpperCase() ===
                      q.correctAnswer.trim().toUpperCase();
                  const isWrong = isAnswered && !isCorrect;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestion(i)}
                      className={`q-grid-item ${
                        isCorrect ? "correct" : ""
                      } ${isWrong ? "incorrect" : ""} ${
                        !isAnswered && isCurrent ? "current" : ""
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              {/* Live score in grid panel */}
              {scoreResult && answeredCount > 0 && (
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Tiến độ</span>
                    <span className="font-bold">
                      {answeredCount}/{exam.questions.length}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{
                        width: `${(answeredCount / exam.questions.length) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {scoreResult.correctCount} đúng
                    </span>
                    <span className="flex items-center gap-1 text-danger">
                      <XCircle className="w-3.5 h-3.5" />
                      {scoreResult.wrongCount} sai
                    </span>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="mt-5 pt-4 border-t border-border flex flex-col gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-success" />
                  <span>Trả lời đúng</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-danger" />
                  <span>Trả lời sai</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-border bg-secondary" />
                  <span>Chưa trả lời</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-accent shadow-[0_0_6px_rgba(124,77,255,0.4)]" />
                  <span>Câu hiện tại</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ SUMMARY SECTION — appears when all questions answered ═══════════ */}
        {scoreResult?.allAnswered && (
          <div ref={summaryRef} className="mt-10 animate-slide-up">
            {/* Divider with notification */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
                <PartyPopper className="w-4 h-4" />
                Bạn đã hoàn thành bài thi!
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            </div>

            {/* Score Card */}
            <ScoreBoard
              result={scoreResult}
              onRetake={handleRetake}
              exam={exam}
              answers={answers}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Score Board Component ─────────────────────────────────────────────

interface ScoreData {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  scorePercentage: number;
  allAnswered: boolean;
  details: {
    questionId: number;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    userAnswer: string | null;
    isCorrect: boolean;
  }[];
}

function ScoreBoard({
  result,
  onRetake,
  exam,
  answers,
}: {
  result: ScoreData;
  onRetake: () => void;
  exam: ExamDetail;
  answers: Record<number, string>;
}) {
  const router = useRouter();

  const getScoreGrade = () => {
    if (result.scorePercentage >= 90)
      return {
        label: "Xuất sắc!",
        emoji: "🏆",
        color: "from-amber-400 to-yellow-500",
      };
    if (result.scorePercentage >= 70)
      return {
        label: "Tốt!",
        emoji: "🎉",
        color: "from-emerald-400 to-teal-500",
      };
    if (result.scorePercentage >= 50)
      return {
        label: "Khá!",
        emoji: "👍",
        color: "from-blue-400 to-indigo-500",
      };
    return {
      label: "Cần cố gắng hơn!",
      emoji: "💪",
      color: "from-orange-400 to-rose-500",
    };
  };

  const grade = getScoreGrade();

  return (
    <div className="mx-auto max-w-3xl">
      {/* Score Card */}
      <div className="score-card mb-8 animate-slide-up">
        <div className="text-6xl mb-4">{grade.emoji}</div>
        <h2 className="text-3xl font-extrabold mb-2">{grade.label}</h2>

        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className={`text-6xl font-black bg-gradient-to-r ${grade.color} bg-clip-text text-transparent`}
          >
            {result.scorePercentage}%
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Tổng câu:</span>
            <span className="font-bold">{result.totalQuestions}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="text-muted-foreground">Đúng:</span>
            <span className="font-bold text-success">{result.correctCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-danger" />
            <span className="text-muted-foreground">Sai:</span>
            <span className="font-bold text-danger">{result.wrongCount}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <button onClick={onRetake} className="btn-primary">
            <RotateCcw className="w-4 h-4" />
            Làm lại
          </button>
          <button
            onClick={() => router.push("/exams")}
            className="btn-secondary"
          >
            <Home className="w-4 h-4" />
            Về danh sách đề
          </button>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="mb-6 flex items-center gap-3">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Chi tiết kết quả</h3>
      </div>

      <div className="space-y-4 pb-12">
        {result.details.map((q, i) => (
          <div
            key={q.questionId}
            className={`glass-card p-6 animate-slide-up ${
              q.isCorrect ? "border-success/20" : "border-danger/20"
            }`}
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            {/* Question header */}
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  q.isCorrect ? "bg-success/20" : "bg-danger/20"
                }`}
              >
                {q.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <XCircle className="w-5 h-5 text-danger" />
                )}
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">
                  Câu {i + 1}
                </span>
                <p className="font-semibold leading-relaxed">
                  {q.questionText}
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2 ml-11">
              {(
                [
                  { key: "A", text: q.optionA },
                  { key: "B", text: q.optionB },
                  { key: "C", text: q.optionC },
                  { key: "D", text: q.optionD },
                ] as const
              ).map((opt) => {
                const isCorrectAnswer = q.correctAnswer === opt.key;
                const isUserAnswer = q.userAnswer === opt.key;
                const isWrongSelection = isUserAnswer && !q.isCorrect;

                let className = "option-btn disabled text-sm py-3";
                if (isCorrectAnswer) className += " correct";
                else if (isWrongSelection) className += " incorrect";

                return (
                  <div key={opt.key} className={className}>
                    <span
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isCorrectAnswer
                          ? "bg-success/20 text-success"
                          : isWrongSelection
                          ? "bg-danger/20 text-danger"
                          : "bg-secondary border border-border text-muted-foreground"
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {isCorrectAnswer && (
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    )}
                    {isWrongSelection && (
                      <XCircle className="w-4 h-4 text-danger flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Submitted View — shown when manually submitting or time runs out ──────

function SubmittedView({
  exam,
  scoreResult,
  onRetake,
  reason,
}: {
  exam: ExamDetail;
  scoreResult: ScoreData;
  onRetake: () => void;
  reason: "timeout" | "manual";
}) {
  const router = useRouter();

  const title = reason === "timeout" ? "Hết giờ!" : "Đã nộp bài!";
  const emoji = reason === "timeout" ? "⏰" : "📋";

  const getScoreGrade = () => {
    if (scoreResult.scorePercentage >= 90)
      return { color: "from-amber-400 to-yellow-500" };
    if (scoreResult.scorePercentage >= 70)
      return { color: "from-emerald-400 to-teal-500" };
    if (scoreResult.scorePercentage >= 50)
      return { color: "from-blue-400 to-indigo-500" };
    return { color: "from-orange-400 to-rose-500" };
  };

  const grade = getScoreGrade();

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Score notice */}
        <div className="score-card mb-8 animate-slide-up">
          <div className="text-6xl mb-4">{emoji}</div>
          <h2 className="text-3xl font-extrabold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-6">
            Bạn đã trả lời {scoreResult.answeredCount}/{scoreResult.totalQuestions} câu hỏi
          </p>

          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`text-6xl font-black bg-gradient-to-r ${grade.color} bg-clip-text text-transparent`}>
              {scoreResult.scorePercentage}%
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tổng câu:</span>
              <span className="font-bold">{scoreResult.totalQuestions}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-muted-foreground">Đúng:</span>
              <span className="font-bold text-success">{scoreResult.correctCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-danger" />
              <span className="text-muted-foreground">Sai:</span>
              <span className="font-bold text-danger">{scoreResult.wrongCount}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <button onClick={onRetake} className="btn-primary">
              <RotateCcw className="w-4 h-4" />
              Làm lại
            </button>
            <button
              onClick={() => router.push("/exams")}
              className="btn-secondary"
            >
              <Home className="w-4 h-4" />
              Về danh sách đề
            </button>
          </div>
        </div>

        {/* Detailed results */}
        <div className="mb-6 flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold">Chi tiết kết quả</h3>
        </div>

        <div className="space-y-4 pb-12">
          {scoreResult.details.map((q, i) => (
            <div
              key={q.questionId}
              className={`glass-card p-6 animate-slide-up ${
                q.userAnswer
                  ? q.isCorrect
                    ? "border-success/20"
                    : "border-danger/20"
                  : "border-border"
              }`}
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    !q.userAnswer
                      ? "bg-secondary"
                      : q.isCorrect
                      ? "bg-success/20"
                      : "bg-danger/20"
                  }`}
                >
                  {!q.userAnswer ? (
                    <span className="text-xs text-muted-foreground font-bold">—</span>
                  ) : q.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-danger" />
                  )}
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Câu {i + 1}
                    {!q.userAnswer && (
                      <span className="ml-2 text-amber-400">(Chưa trả lời)</span>
                    )}
                  </span>
                  <p className="font-semibold leading-relaxed">
                    {q.questionText}
                  </p>
                </div>
              </div>

              <div className="space-y-2 ml-11">
                {(
                  [
                    { key: "A", text: q.optionA },
                    { key: "B", text: q.optionB },
                    { key: "C", text: q.optionC },
                    { key: "D", text: q.optionD },
                  ] as const
                ).map((opt) => {
                  const isCorrectAnswer = q.correctAnswer === opt.key;
                  const isUserAnswer = q.userAnswer === opt.key;
                  const isWrongSelection = isUserAnswer && !q.isCorrect;

                  let className = "option-btn disabled text-sm py-3";
                  if (isCorrectAnswer) className += " correct";
                  else if (isWrongSelection) className += " incorrect";

                  return (
                    <div key={opt.key} className={className}>
                      <span
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isCorrectAnswer
                            ? "bg-success/20 text-success"
                            : isWrongSelection
                            ? "bg-danger/20 text-danger"
                            : "bg-secondary border border-border text-muted-foreground"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                      {isCorrectAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      )}
                      {isWrongSelection && (
                        <XCircle className="w-4 h-4 text-danger flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Lobby View ────────────────────────────────────────────────────────
function LobbyView({
  exam,
  onStart,
  initialNickname,
  initialAvatar,
  setLobbyInfo,
}: {
  exam: ExamDetail;
  onStart: () => void;
  initialNickname: string;
  initialAvatar: string;
  setLobbyInfo: (n: string, a: string) => void;
}) {
  const router = useRouter();
  const [nickname, setNickname] = useState(initialNickname);
  const [avatarSeed, setAvatarSeed] = useState(
    initialAvatar.includes("dicebear") ? initialAvatar.split("seed=")[1]?.split("&")[0] || "quiz" : "quiz"
  );

  const currentAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}&backgroundColor=transparent`;

  const handleStart = () => {
    if (!nickname.trim()) return;
    setLobbyInfo(nickname, currentAvatarUrl);
    onStart();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-xl p-8 animate-fade-in text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-3">{exam.title}</h1>
        <p className="text-muted-foreground mb-8">
          {exam.questions.length} câu hỏi • Thời gian: {Math.ceil(exam.questions.length * 1.5)} phút
        </p>

        <div className="bg-secondary/50 rounded-2xl p-6 border border-border mb-8">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Hồ sơ người thi</h2>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* Avatar Selector */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-background border-4 border-primary/20 overflow-hidden shadow-lg flex items-center justify-center relative group">
                <Image src={currentAvatarUrl} alt="Avatar" width={96} height={96} />
              </div>
              <button
                onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Đổi Avatar
              </button>
            </div>

            {/* Nickname Input */}
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium mb-2 text-left text-foreground">Biệt danh của bạn</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Nhập tên để hiển thị trên bảng điểm..."
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                maxLength={30}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => router.back()} className="btn-secondary">
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </button>
          <button 
            onClick={handleStart} 
            disabled={!nickname.trim()}
            className="btn-primary"
          >
            Bắt đầu thi <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
