"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { uploadExam } from "../../lib/api";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  const allowedExtensions = [".pdf", ".docx", ".txt"];

  const validateFile = (f: File): boolean => {
    const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setError("Chỉ chấp nhận file .pdf, .docx hoặc .txt");
      return false;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Kích thước file không được vượt quá 10MB");
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = useCallback((f: File) => {
    if (validateFile(f)) {
      setFile(f);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadExam(file);
      // Navigate to the exam page
      router.push(`/exams/${result.examId}`);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải lên. Vui lòng thử lại.");
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (isUploading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            <span className="gradient-text">Tải đề thi lên</span>
          </h1>
          <p className="text-muted-foreground text-base">
            Tải lên file tài liệu và AI sẽ tự động tạo bộ câu hỏi trắc nghiệm
          </p>
        </div>

        {/* Drop Zone */}
        <div
          className={`drop-zone p-12 text-center transition-all duration-300 ${
            isDragging ? "active" : ""
          } ${file ? "border-solid border-primary/40" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          {!file ? (
            <div className="space-y-5">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-float">
                <Upload className="w-9 h-9 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold mb-1">
                  Kéo & thả file vào đây
                </p>
                <p className="text-muted-foreground text-sm">
                  hoặc{" "}
                  <span className="text-primary font-medium cursor-pointer hover:underline">
                    nhấn để chọn file
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
                <span className="px-3 py-1 rounded-full bg-secondary border border-border">
                  .pdf
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary border border-border">
                  .docx
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary border border-border">
                  .txt
                </span>
                <span>Tối đa 10MB</span>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-base truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center hover:bg-danger/20 transition-colors"
                >
                  <X className="w-4 h-4 text-danger" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                File đã sẵn sàng để xử lý
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-danger/10 border border-danger/20 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {/* Upload Button */}
        {file && (
          <div className="mt-6 animate-fade-in">
            <button
              onClick={handleUpload}
              className="btn-primary w-full justify-center text-base py-4"
            >
              <Upload className="w-5 h-5" />
              Bắt đầu phân tích bằng AI
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
