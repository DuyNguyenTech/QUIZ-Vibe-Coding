"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
} from "lucide-react";
import { getExam, submitAnswers, type ExamDetail, type ScoreResult } from "../../lib/api";
import { useQuizStore } from "../../lib/store";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.id);

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    answers,
    currentQuestion,
    timeRemaining,
    isSubmitted,
    setAnswer,
    setCurrentQuestion,
    decrementTime,
    setSubmitted,
    initExam,
    resetQuiz,
  } = useQuizStore();

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

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!exam || submitting) return;

    setSubmitting(true);
    setShowConfirmSubmit(false);

    try {
      const result = await submitAnswers(examId, answers);
      setScoreResult(result);
      setSubmitted(true);

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (err: any) {
      setError(err.message || "Không thể nộp bài");
    } finally {
      setSubmitting(false);
    }
  }, [exam, examId, answers, submitting, setSubmitted]);

  // Countdown timer
  useEffect(() => {
    if (!exam || isSubmitted || !hydrated) return;

    timerRef.current = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exam, isSubmitted, hydrated, decrementTime]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && exam && !isSubmitted && hydrated) {
      handleSubmit();
    }
  }, [timeRemaining, exam, isSubmitted, hydrated, handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 60) return "text-danger";
    if (timeRemaining <= 300) return "text-amber-400";
    return "text-emerald-400";
  };

  const handleRetake = () => {
    resetQuiz();
    setScoreResult(null);
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

  // Score result view
  if (isSubmitted && scoreResult) {
    return <ScoreBoard result={scoreResult} onRetake={handleRetake} />;
  }

  const currentQ = exam.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Submitting overlay */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Đang nộp bài...</p>
          </div>
        </div>
      )}

      {/* Confirm submit modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="glass-card p-8 max-w-sm w-full animate-fade-in text-center">
            <Send className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Xác nhận nộp bài?</h3>
            <p className="text-muted-foreground text-sm mb-2">
              Bạn đã trả lời {answeredCount}/{exam.questions.length} câu hỏi.
            </p>
            {answeredCount < exam.questions.length && (
              <p className="text-amber-400 text-sm mb-4">
                ⚠️ Còn {exam.questions.length - answeredCount} câu chưa trả lời!
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
                onClick={handleSubmit}
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
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border font-mono text-lg font-bold ${getTimerColor()}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeRemaining)}
            </div>
            {/* Submit button */}
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="btn-primary"
              disabled={submitting}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Nộp bài</span>
            </button>
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

              {/* Options */}
              <div className="space-y-3">
                {(
                  [
                    { key: "A", text: currentQ.optionA },
                    { key: "B", text: currentQ.optionB },
                    { key: "C", text: currentQ.optionC },
                    { key: "D", text: currentQ.optionD },
                  ] as const
                ).map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => {
                        console.log(`Selecting answer ${opt.key} for question ${currentQ.id}`);
                        setAnswer(currentQ.id, opt.key);
                      }}
                      className={`option-btn ${isSelected ? "selected" : ""}`}
                    >
                      <span
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-secondary border border-border text-muted-foreground"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
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
                  const isAnswered = !!answers[q.id];
                  const isCurrent = i === currentQuestion;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestion(i)}
                      className={`q-grid-item ${isAnswered ? "answered" : ""} ${
                        isCurrent ? "current" : ""
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-5 pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary" />
                  <span>Đã trả lời</span>
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
      </div>
    </div>
  );
}

// ─── Score Board Component ─────────────────────────────────────────────

function ScoreBoard({
  result,
  onRetake,
}: {
  result: ScoreResult;
  onRetake: () => void;
}) {
  const router = useRouter();

  const getScoreGrade = () => {
    if (result.scorePercentage >= 90) return { label: "Xuất sắc!", emoji: "🏆", color: "from-amber-400 to-yellow-500" };
    if (result.scorePercentage >= 70) return { label: "Tốt!", emoji: "🎉", color: "from-emerald-400 to-teal-500" };
    if (result.scorePercentage >= 50) return { label: "Khá!", emoji: "👍", color: "from-blue-400 to-indigo-500" };
    return { label: "Cần cố gắng hơn!", emoji: "💪", color: "from-orange-400 to-rose-500" };
  };

  const grade = getScoreGrade();

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Score Card */}
        <div className="score-card mb-8 animate-slide-up">
          <div className="text-6xl mb-4">{grade.emoji}</div>
          <h2 className="text-3xl font-extrabold mb-2">{grade.label}</h2>

          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`text-6xl font-black bg-gradient-to-r ${grade.color} bg-clip-text text-transparent`}>
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
              <span className="font-bold text-danger">
                {result.totalQuestions - result.correctCount}
              </span>
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

        <div className="space-y-4">
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
    </div>
  );
}
