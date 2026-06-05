using Microsoft.EntityFrameworkCore;
using QuizPlatform.Models;

namespace QuizPlatform.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Exam> Exams => Set<Exam>();
    public DbSet<Question> Questions => Set<Question>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Exam>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
        });

        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasKey(q => q.Id);
            entity.Property(q => q.QuestionText).IsRequired();
            entity.Property(q => q.OptionA).IsRequired().HasMaxLength(1000);
            entity.Property(q => q.OptionB).IsRequired().HasMaxLength(1000);
            entity.Property(q => q.OptionC).IsRequired().HasMaxLength(1000);
            entity.Property(q => q.OptionD).IsRequired().HasMaxLength(1000);
            entity.Property(q => q.CorrectAnswer).IsRequired().HasMaxLength(1);

            entity.HasOne(q => q.Exam)
                  .WithMany(e => e.Questions)
                  .HasForeignKey(q => q.ExamId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
