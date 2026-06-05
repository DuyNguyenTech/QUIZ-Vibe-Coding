const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface ExamListItem {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  questionCount: number;
}

export interface QuestionDetail {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface ExamDetail {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  questions: QuestionDetail[];
}

export interface QuestionResult {
  questionId: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean;
}

export interface ScoreResult {
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  details: QuestionResult[];
}

export interface UploadResult {
  examId: number;
  title: string;
  questionCount: number;
}

export async function uploadExam(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/exams/upload-exam`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Lỗi không xác định" }));
    throw new Error(err.error || `Upload failed with status ${res.status}`);
  }

  return res.json();
}

export async function getExams(): Promise<ExamListItem[]> {
  const res = await fetch(`${API_BASE}/api/exams`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Không thể tải danh sách đề thi");
  return res.json();
}

export async function getExam(id: number): Promise<ExamDetail> {
  const res = await fetch(`${API_BASE}/api/exams/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Không tìm thấy đề thi");
  return res.json();
}

export async function submitAnswers(
  examId: number,
  answers: Record<number, string>
): Promise<ScoreResult> {
  const res = await fetch(`${API_BASE}/api/exams/${examId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ examId, answers }),
  });

  if (!res.ok) throw new Error("Không thể nộp bài");
  return res.json();
}

export async function deleteExam(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/exams/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Không thể xoá đề thi");
}
