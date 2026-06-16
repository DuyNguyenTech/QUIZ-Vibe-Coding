# 🧠 Community Quiz & Document Platform (Dự Án Vibe Coding AI)

Chào mừng bạn đến với **Community Quiz & Document Platform**! Đây là một hệ thống trắc nghiệm trực tuyến thông minh, cho phép người dùng tải lên các tài liệu (Word, PDF, TXT) và tự động tạo ra các bài kiểm tra trắc nghiệm nhờ sức mạnh của AI.

**Đặc biệt:** Dự án này là một sản phẩm của phương pháp **"Vibe Coding"**, được phát triển và hoàn thiện tự động bởi AI (Trí tuệ nhân tạo) từ khâu thiết kế kiến trúc, viết mã nguồn (frontend & backend) cho đến cấu hình triển khai.

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

Hệ thống được thiết kế theo kiến trúc Microservices với Frontend và Backend tách biệt, sử dụng các công nghệ hiện đại nhất:

### 🎨 Frontend (Giao diện người dùng)
*   **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
*   **Ngôn ngữ:** TypeScript, React 19
*   **Styling:** Tailwind CSS v4, Lucide React (Icons)
*   **Quản lý State:** Zustand
*   **Ngôn ngữ giao diện:** 100% Tiếng Việt

### ⚙️ Backend (Hệ thống xử lý)
*   **Framework:** ASP.NET Core 8.0 Web API
*   **Ngôn ngữ:** C#
*   **ORM:** Entity Framework Core 8
*   **AI Integration:** Tích hợp **Gemini 1.5 Flash API** (để đọc hiểu tài liệu và tạo câu hỏi tự động)
*   **Xử lý tài liệu:** OpenXML (cho file .docx), PdfPig (cho file .pdf)
*   **Bảo mật:** JWT Authentication, mã hóa mật khẩu với BCrypt
*   **Containerization:** Docker (sẵn sàng deploy lên các nền tảng cloud)

### 🗄️ Cơ Sở Dữ Liệu (Database)
*   **Hệ quản trị CSDL:** PostgreSQL

---

## 📖 Hướng Dẫn Sử Dụng

1.  **Tải lên đề thi:** Truy cập vào trang `Tải đề lên` (`/exams/upload`). Tại đây, bạn có thể tải lên file tài liệu (.docx, .pdf, .txt) chứa nội dung cần kiểm tra.
2.  **AI Xử lý tự động:** Hệ thống sẽ gửi tài liệu của bạn cho AI (Gemini 1.5 Flash) phân tích, trích xuất dữ liệu và tự động khởi tạo thành một bộ câu hỏi trắc nghiệm với các đáp án hoàn chỉnh.
3.  **Làm bài trắc nghiệm:** 
    *   Truy cập vào bài thi vừa được AI tạo ra.
    *   Giao diện làm bài trực quan gồm: Lưới câu hỏi (chuyển câu nhanh chóng), nội dung câu hỏi và đồng hồ đếm ngược.
    *   Hệ thống sẽ tự động sao lưu các đáp án bạn đã chọn (thông qua Zustand), không lo mất dữ liệu khi vô tình tải lại trang.
4.  **Nộp bài & Xem điểm:** Khi hết thời gian hoặc khi bạn chủ động bấm "Nộp bài", hệ thống sẽ chấm điểm ngay lập tức và hiển thị Bảng điểm chi tiết (Câu đúng được tô màu xanh, câu sai màu đỏ).

---

## 🛠️ Hướng Dẫn Cài Đặt (Chạy Local)

Để chạy dự án này trên máy tính của bạn, hãy làm theo các bước sau:

### Yêu cầu hệ thống:
*   [Node.js](https://nodejs.org/) (phiên bản 18+ hoặc 20+)
*   [.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
*   [PostgreSQL](https://www.postgresql.org/) (Đang chạy ở port `5432` hoặc tùy chỉnh)
*   Tài khoản lấy [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Bước 1: Clone dự án
```bash
git clone <URL_CỦA_REPO>
cd QUIZ
```

### Bước 2: Thiết lập Backend (.NET Core)
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cấu hình Database & API Key:
   * Mở file `appsettings.json` (hoặc `appsettings.Development.json`).
   * Cập nhật chuỗi kết nối PostgreSQL tại `ConnectionStrings:DefaultConnection`.
   * Cập nhật Gemini API Key của bạn tại `Gemini:ApiKey`.
3. Chạy Migration để tạo Database và các bảng:
   ```bash
   dotnet ef database update
   ```
4. Khởi chạy Backend:
   ```bash
   dotnet run
   ```
   *(API sẽ mặc định chạy tại các port cấu hình sẵn như `http://localhost:5000` hoặc port của Kestrel/IIS Express in ra trên màn hình console)*

### Bước 3: Thiết lập Frontend (Next.js)
1. Mở một Terminal/Command Prompt mới và di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   # hoặc: yarn install / pnpm install
   ```
3. Cấu hình biến môi trường:
   * Xây dựng file biến môi trường local: Copy file `.env.example` thành `.env.local`.
   * Cập nhật nội dung trong `.env.local` nếu cần, đảm bảo URL API Backend đã được trỏ chính xác (VD: `NEXT_PUBLIC_API_URL=http://localhost:5000`).
4. Khởi chạy server Frontend:
   ```bash
   npm run dev
   ```
5. Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000) để trải nghiệm thành quả!

---

## 🌐 Hướng Dẫn Triển Khai (Deployment)
Dự án được thiết kế để dễ dàng deploy lên các nền tảng PaaS miễn phí phổ biến:
*   **Frontend:** Đã được tối ưu để triển khai chỉ với 1-click lên **Vercel**.
*   **Backend:** Mã nguồn đã tích hợp sẵn `Dockerfile`. Bạn có thể sử dụng Docker để build image và triển khai lên các dịch vụ như **Render** (Web Service), Railway hoặc Fly.io.
*   **Database:** Có thể sử dụng các dịch vụ Managed PostgreSQL miễn phí như **Supabase** hoặc Render PostgreSQL.
