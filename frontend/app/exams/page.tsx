"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  HelpCircle,
  ArrowRight,
  Upload,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { getExams, deleteExam, type ExamListItem } from "../lib/api";

export default function ExamsListPage() {
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await getExams();
        setExams(data);
      } catch (err: any) {
        setError(err.message || "Không thể tải danh sách đề thi");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Bạn có chắc chắn muốn xoá đề thi này không? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      await deleteExam(id);
      setExams(exams.filter((exam) => exam.id !== id));
    } catch (err: any) {
      alert(err.message || "Không thể xoá đề thi");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Đang tải danh sách đề thi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">
              <span className="gradient-text">Danh sách đề thi</span>
            </h1>
            <p className="text-muted-foreground">
              {exams.length > 0
                ? `Tổng cộng ${exams.length} đề thi`
                : "Chưa có đề thi nào"}
            </p>
          </div>
          <Link href="/exams/upload" className="btn-primary">
            <Upload className="w-4 h-4" />
            Tải đề mới
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-danger/10 border border-danger/20 mb-6 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {exams.length === 0 && !error && (
          <div className="glass-card p-16 text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">Chưa có đề thi nào</h3>
            <p className="text-muted-foreground mb-6">
              Hãy tải lên tài liệu đầu tiên để AI tạo đề thi cho bạn
            </p>
            <Link href="/exams/upload" className="btn-primary">
              <Upload className="w-4 h-4" />
              Tải đề lên ngay
            </Link>
          </div>
        )}

        {/* Exam Cards */}
        <div className="space-y-4">
          {exams.map((exam, index) => (
            <Link
              key={exam.id}
              href={`/exams/${exam.id}`}
              className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-primary/30 transition-all duration-300 hover:translate-y-[-2px] block animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">
                    {exam.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {exam.questionCount} câu hỏi
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(exam.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto">
                <div className="flex items-center gap-2 text-primary">
                  <span className="text-sm font-medium hidden sm:inline">
                    Làm bài
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </div>
                {/* <button
                  onClick={(e) => handleDelete(e, exam.id)}
                  className="p-2.5 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
                  title="Xoá đề thi"
                >
                  <Trash2 className="w-4 h-4" />
                </button> */}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
