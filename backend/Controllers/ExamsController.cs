using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizPlatform.Data;
using QuizPlatform.DTOs;
using QuizPlatform.Models;
using QuizPlatform.Services;

namespace QuizPlatform.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExamsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly DocumentExtractorService _documentExtractor;
    private readonly GeminiService _geminiService;
    private readonly ILogger<ExamsController> _logger;

    public ExamsController(
        AppDbContext context,
        DocumentExtractorService documentExtractor,
        GeminiService geminiService,
        ILogger<ExamsController> logger)
    {
        _context = context;
        _documentExtractor = documentExtractor;
        _geminiService = geminiService;
        _logger = logger;
    }

    /// <summary>
    /// Upload a document and use AI to extract multiple-choice questions
    /// POST /api/exams/upload-exam
    /// </summary>
    [HttpPost("upload-exam")]
    [RequestSizeLimit(10_000_000)] // 10MB limit
    public async Task<IActionResult> UploadExam(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file was uploaded." });

        var allowedExtensions = new[] { ".docx", ".txt" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
            return BadRequest(new { error = "Only .docx and .txt files are supported." });

        try
        {
            // Step 1: Extract text from document
            _logger.LogInformation("Extracting text from {FileName}...", file.FileName);
            using var stream = file.OpenReadStream();
            var rawText = await _documentExtractor.ExtractTextAsync(stream, file.FileName);

            // Step 2: Send to Gemini for AI parsing
            _logger.LogInformation("Sending extracted text to Gemini for parsing...");
            var geminiResult = await _geminiService.ParseExamFromTextAsync(rawText);

            // Step 3: Map to EF Core entities and save
            var exam = new Exam
            {
                Title = geminiResult.exam_title,
                Description = $"Extracted from: {file.FileName}",
                CreatedAt = DateTime.UtcNow
            };

            foreach (var q in geminiResult.questions)
            {
                var question = new Question
                {
                    QuestionText = q.question_text,
                    OptionA = q.options.ElementAtOrDefault(0) ?? "A. N/A",
                    OptionB = q.options.ElementAtOrDefault(1) ?? "B. N/A",
                    OptionC = q.options.ElementAtOrDefault(2) ?? "C. N/A",
                    OptionD = q.options.ElementAtOrDefault(3) ?? "D. N/A",
                    CorrectAnswer = q.correct_answer.Trim().ToUpper()
                };
                exam.Questions.Add(question);
            }

            _context.Exams.Add(exam);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Exam '{Title}' saved with {Count} questions. ID: {Id}", exam.Title, exam.Questions.Count, exam.Id);

            return Ok(new { examId = exam.Id, title = exam.Title, questionCount = exam.Questions.Count });
        }
        catch (NotSupportedException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Gemini API call failed.");
            return StatusCode(502, new { error = $"Lỗi kết nối AI: {ex.Message}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during exam upload.");
            return StatusCode(500, new { error = "An unexpected error occurred. Please try again later." });
        }
    }

    /// <summary>
    /// Get all exams (list)
    /// GET /api/exams
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllExams()
    {
        var exams = await _context.Exams
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new
            {
                e.Id,
                e.Title,
                e.Description,
                e.CreatedAt,
                QuestionCount = e.Questions.Count
            })
            .ToListAsync();

        return Ok(exams);
    }

    /// <summary>
    /// Get a specific exam with all questions (without correct answers for quiz mode)
    /// GET /api/exams/{id}
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetExam(int id)
    {
        var exam = await _context.Exams
            .Include(e => e.Questions)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (exam == null)
            return NotFound(new { error = "Exam not found." });

        var dto = new ExamDetailDto
        {
            Id = exam.Id,
            Title = exam.Title,
            Description = exam.Description,
            CreatedAt = exam.CreatedAt,
            Questions = exam.Questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                QuestionText = q.QuestionText,
                OptionA = q.OptionA,
                OptionB = q.OptionB,
                OptionC = q.OptionC,
                OptionD = q.OptionD
            }).ToList()
        };

        return Ok(dto);
    }

    /// <summary>
    /// Submit answers and get scored results
    /// POST /api/exams/{id}/submit
    /// </summary>
    [HttpPost("{id:int}/submit")]
    public async Task<IActionResult> SubmitAnswers(int id, [FromBody] SubmitAnswersDto submission)
    {
        var exam = await _context.Exams
            .Include(e => e.Questions)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (exam == null)
            return NotFound(new { error = "Exam not found." });

        var results = new List<QuestionResultDto>();
        int correctCount = 0;

        foreach (var question in exam.Questions)
        {
            var userAnswer = submission.Answers.GetValueOrDefault(question.Id);
            var isCorrect = !string.IsNullOrEmpty(userAnswer) &&
                           userAnswer.Trim().ToUpper() == question.CorrectAnswer.Trim().ToUpper();

            if (isCorrect) correctCount++;

            results.Add(new QuestionResultDto
            {
                QuestionId = question.Id,
                QuestionText = question.QuestionText,
                OptionA = question.OptionA,
                OptionB = question.OptionB,
                OptionC = question.OptionC,
                OptionD = question.OptionD,
                CorrectAnswer = question.CorrectAnswer,
                UserAnswer = userAnswer,
                IsCorrect = isCorrect
            });
        }

        var score = new ScoreResultDto
        {
            TotalQuestions = exam.Questions.Count,
            CorrectCount = correctCount,
            ScorePercentage = exam.Questions.Count > 0
                ? Math.Round((double)correctCount / exam.Questions.Count * 100, 1)
                : 0,
            Details = results
        };

        return Ok(score);
    }

    /// <summary>
    /// Delete an exam
    /// DELETE /api/exams/{id}
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteExam(int id)
    {
        var exam = await _context.Exams.FindAsync(id);
        if (exam == null)
            return NotFound(new { error = "Exam not found." });

        _context.Exams.Remove(exam);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Exam deleted successfully." });
    }
}
