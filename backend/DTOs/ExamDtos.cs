namespace QuizPlatform.DTOs;

/// <summary>
/// DTO representing the parsed Gemini response
/// </summary>
public class GeminiExamResponse
{
    public string exam_title { get; set; } = string.Empty;
    public List<GeminiQuestionDto> questions { get; set; } = new();
}

public class GeminiQuestionDto
{
    public string question_text { get; set; } = string.Empty;
    public List<string> options { get; set; } = new();
    public string correct_answer { get; set; } = string.Empty;
}

/// <summary>
/// DTO for returning exam data to the frontend
/// </summary>
public class ExamDetailDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<QuestionDto> Questions { get; set; } = new();
}

public class QuestionDto
{
    public int Id { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;
}

/// <summary>
/// DTO for submitting answers and getting the score
/// </summary>
public class SubmitAnswersDto
{
    public int ExamId { get; set; }
    public Dictionary<int, string> Answers { get; set; } = new(); // QuestionId -> "A"/"B"/"C"/"D"
}

public class ScoreResultDto
{
    public int TotalQuestions { get; set; }
    public int CorrectCount { get; set; }
    public double ScorePercentage { get; set; }
    public List<QuestionResultDto> Details { get; set; } = new();
}

public class QuestionResultDto
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public string? UserAnswer { get; set; }
    public bool IsCorrect { get; set; }
}
