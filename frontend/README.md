This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```You are an advanced autonomous full-stack AI engineer agent. Your task is to completely build a "Community Quiz & Document Platform" from scratch inside this workspace without requiring any incremental guidance. The final application must be fully functional, structured, and ready for deployment.

### CORE ARCHITECTURE REQUIREMENTS:
1. FRONTEND: Next.js 14+ (App Router), Tailwind CSS, shadcn/ui. (To be deployed on Vercel Free).
2. BACKEND: ASP.NET Core 8.0 Web API (Dockerized). (To be deployed on Render Free).
3. DATABASE: SQL Server/PostgreSQL setup using Entity Framework Core.
4. AI EXTRACTOR: Gemini 1.5 Flash API Integration via HttpClient.

### LANGUAGE REQUIREMENT (CRITICAL):
- ALL User Interfaces, buttons, labels, notifications, loading states, dashboards, and error messages in the Frontend MUST be in VIETNAMESE (Tiếng Việt). 
- Database logs, code comments, and API schemas can remain in English.

### STEP-BY-STEP AUTONOMOUS EXECUTION PLAN:

STEP 1: WORKSPACE SETUP
- Check the current directory. Automatically create two main project folders: `/frontend` and `/backend`.
- Initialize a standard ASP.NET Core 8 Web API project inside `/backend`.
- Initialize a Next.js 14+ project with Tailwind CSS inside `/frontend`.

STEP 2: DATABASE & BACKEND MODELING (EF CORE)
- Create domain entities: `Exam` (Id, Title, CreatedAt, Description) and `Question` (Id, ExamId, QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectAnswer).
- Configure the DbContext and Fluent API relationships.
- Create an `ExamController` with a `POST /api/exams/upload-exam` endpoint that accepts an `IFormFile` (.docx/.txt).
- Implement raw text extraction for documents (use OpenXML for .docx).
- Implement an HttpClient service to send raw text to Gemini 1.5 Flash API. Use a strict system prompt ensuring Gemini returns ONLY a raw JSON string matching the exact schema:
  {
    "exam_title": "Tên bài thi",
    "questions": [
      { "question_text": "Nội dung câu hỏi?", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correct_answer": "A" }
    ]
  }
- Clean the response (strip ```json wrappers) and parse it into EF Core entities to save to the database.

STEP 3: VIETNAMESE FRONTEND UI DEVELOPMENT (Next.js)
- Create a clean, modern homepage with a public link layout so anyone can access it.
- Build `/exams/upload` (Trang tải đề lên): A gorgeous drag-and-drop zone. When a file is uploaded, trigger a full-screen loading skeleton/spinner with the text: "AI đang phân tích và xử lý đề thi của bạn, vui lòng đợi trong giây lát...".
- Build `/exams/[id]` (Trang làm bài trắc nghiệm): 
  - Split layout: Right side has a Question Grid (Lưới câu hỏi) for fast navigation. Left/Center side shows the questions.
  - Operational countdown timer (Đồng hồ đếm ngược).
  - Use local state or Zustand to back up selected answers so reloading the page doesn't lose data.
  - Auto-submit on timer expiration, and a "Nộp bài" button.
  - After submission, show a beautifully styled Score Board (Bảng điểm), highlighting correct (green) and incorrect (red) choices.

STEP 4: DEPLOYMENT CONFIGURATION
- Generate a production-ready `Dockerfile` in `/backend` for Render deployment.
- Configure CORS in ASP.NET Core to accept Vercel production domains.

### COMPLETION PROTOCOL:
Do not stop until every single layer is fully coded, integrated, and verified. Once you have generated all necessary files and the codebase is completely autonomous and compile-ready, stop and reply with the EXACT text: "BÁO CÁO: TÔI ĐÃ HOÀN THÀNH 100% CODEBASE. HỆ THỐNG ĐÃ SẴN SÀNG ĐỂ DEPLOY!" followed by a brief summary of the structure you created.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
