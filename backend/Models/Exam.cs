namespace QuizPlatform.Models;

public class Exam
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public int? CreatedById { get; set; }
    public User? CreatedBy { get; set; }

    public ICollection<Question> Questions { get; set; } = new List<Question>();
}
