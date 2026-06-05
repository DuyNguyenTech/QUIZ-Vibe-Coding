using Microsoft.EntityFrameworkCore;
using QuizPlatform.Data;
using QuizPlatform.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "QuizPlatform API", Version = "v1" });
});

// Database - PostgreSQL (handle Render's postgres:// URL format)
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
var connectionString = !string.IsNullOrEmpty(databaseUrl)
    ? ConvertPostgresUrl(databaseUrl)
    : builder.Configuration.GetConnectionString("DefaultConnection")
      ?? "Host=localhost;Port=5432;Database=quizplatform;Username=postgres;Password=postgres";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register application services
builder.Services.AddSingleton<DocumentExtractorService>();
builder.Services.AddHttpClient<GeminiService>();

// CORS - Allow Vercel production + local development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? new[] { "http://localhost:3000", "http://localhost:3001" };

        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Auto-migrate database on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        dbContext.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Migration failed, attempting to ensure database is created...");
        dbContext.Database.EnsureCreated();
    }
}

// Enable Swagger in all environments for easier debugging
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");
app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Run($"http://0.0.0.0:{port}");

// Helper: Convert Render's postgres:// URI to Npgsql connection string
static string ConvertPostgresUrl(string url)
{
    // Handle postgres:// or postgresql:// format from Render
    var uri = new Uri(url.Replace("postgres://", "http://").Replace("postgresql://", "http://"));
    var userInfo = uri.UserInfo.Split(':');
    var host = uri.Host;
    var port = uri.Port > 0 ? uri.Port : 5432;
    var database = uri.AbsolutePath.TrimStart('/');
    var username = userInfo[0];
    var password = userInfo.Length > 1 ? userInfo[1] : "";

    return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
}
