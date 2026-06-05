"use client";

import Link from "next/link";
import {
  Upload,
  Brain,
  Timer,
  BarChart3,
  ArrowRight,
  Sparkles,
  FileText,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Được hỗ trợ bởi Google Gemini AI
            </div>

            {/* Heading */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-normal mb-6 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              Biến tài liệu thành{" "}
              <span className="gradient-text">đề thi trắc nghiệm</span>{" "}
              trong tích tắc
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              Chỉ cần tải lên file tài liệu (.docx hoặc .txt), AI sẽ tự động
              phân tích và tạo bộ câu hỏi trắc nghiệm hoàn chỉnh cho bạn.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Link href="/exams/upload" className="btn-primary text-base px-8 py-4 animate-pulse-glow">
                <Upload size={20} className="w-5 h-5" />
                Tải đề lên ngay
                <ArrowRight size={20} className="w-5 h-5" />
              </Link>
              <Link href="/exams" className="btn-secondary text-base px-8 py-4">
                <FileText size={20} className="w-5 h-5" />
                Xem danh sách đề thi
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tại sao chọn <span className="gradient-text">QuizAI</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Nền tảng thi trắc nghiệm thông minh với nhiều tính năng vượt trội
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Thông Minh",
                desc: "Sử dụng Google Gemini AI để phân tích và trích xuất câu hỏi tự động từ tài liệu",
                color: "from-violet-500 to-purple-500",
              },
              {
                icon: Zap,
                title: "Xử Lý Nhanh",
                desc: "Chỉ mất vài giây để chuyển đổi tài liệu thành bộ đề thi hoàn chỉnh",
                color: "from-amber-500 to-orange-500",
              },
              {
                icon: Timer,
                title: "Hẹn Giờ Tự Động",
                desc: "Đồng hồ đếm ngược thông minh, tự động nộp bài khi hết thời gian",
                color: "from-emerald-500 to-teal-500",
              },
              {
                icon: BarChart3,
                title: "Bảng Điểm Chi Tiết",
                desc: "Xem kết quả ngay lập tức với phân tích chi tiết từng câu hỏi",
                color: "from-rose-500 to-pink-500",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass-card p-7 group hover:border-primary/30 transition-all duration-300 hover:translate-y-[-4px]"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}
                >
                  <feature.icon size={24} className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Cách sử dụng <span className="gradient-text">đơn giản</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Chỉ 3 bước đơn giản để bắt đầu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Tải tài liệu lên",
                desc: "Kéo thả hoặc chọn file .docx/.txt chứa nội dung đề thi",
              },
              {
                step: "02",
                title: "AI phân tích",
                desc: "Gemini AI sẽ tự động đọc và trích xuất các câu hỏi trắc nghiệm",
              },
              {
                step: "03",
                title: "Làm bài & xem điểm",
                desc: "Làm bài thi với hẹn giờ và nhận kết quả chi tiết ngay lập tức",
              },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 mb-5 transition-transform group-hover:scale-110">
                  <span className="text-2xl font-black gradient-text">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 QuizAI — Nền tảng thi trắc nghiệm thông minh với AI</p>
        </div>
      </footer>
    </div>
  );
}
