using QuizPlatform.DTOs;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace QuizPlatform.Services;

/// <summary>
/// Service to interact with Gemini 1.5 Flash API for AI-powered exam parsing
/// </summary>
public class GeminiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GeminiService> _logger;

    public GeminiService(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Send raw document text to Gemini and get structured quiz JSON back
    /// </summary>
    public async Task<GeminiExamResponse> ParseExamFromTextAsync(string rawText)
    {
        // Try to get from direct environment variable first (easier to configure in Render), then fallback to appsettings
        var apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") 
            ?? Environment.GetEnvironmentVariable("Gemini__ApiKey")
            ?? _configuration["Gemini:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "YOUR_GEMINI_API_KEY_HERE")
        {
            throw new InvalidOperationException("Mã Gemini API key chưa được cấu hình đúng. Vui lòng kiểm tra lại biến môi trường GEMINI_API_KEY trên Render.");
        }

        var systemPrompt = @"You are an expert exam parser. Your task is to analyze the following document text and extract all multiple-choice questions from it.

You MUST return ONLY a valid raw JSON string (no markdown, no explanation, no code fences) that matches this EXACT schema:
{
  ""exam_title"": ""Tên bài thi"",
  ""questions"": [
    {
      ""question_text"": ""Nội dung câu hỏi?"",
      ""options"": [""A. Đáp án A"", ""B. Đáp án B"", ""C. Đáp án C"", ""D. Đáp án D""],
      ""correct_answer"": ""A""
    }
  ]
}

RULES:
1. The exam_title should be extracted from the document or generated based on content.
2. Each question must have exactly 4 options labeled A, B, C, D.
3. The correct_answer must be one of: ""A"", ""B"", ""C"", ""D"".
4. If the correct answer is indicated in the document, use it. If not, make your best educated guess.
5. Return ONLY the JSON. No additional text, no markdown code fences, no explanation.
6. Preserve the original language of the questions (Vietnamese or English).";

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = $"{systemPrompt}\n\n--- DOCUMENT TEXT ---\n{rawText}" }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.1,
                maxOutputTokens = 8192,
                responseMimeType = "application/json"
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var modelsToTry = new[] { "gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-flash-latest" };
        string responseText = "";
        bool success = false;
        Exception lastException = null;

        foreach (var model in modelsToTry)
        {
            try
            {
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
                _logger.LogInformation($"Sending document to Gemini API (Model: {model})...");
                
                var response = await _httpClient.PostAsync(url, content);
                responseText = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    success = true;
                    break;
                }
                
                _logger.LogWarning($"Gemini API error with {model}: {response.StatusCode} - {responseText}");
                lastException = new HttpRequestException($"Gemini API returned {response.StatusCode}: {responseText}");
                
                // If the error is not 503/429 (like 400 Bad Request), it's a fatal error, don't retry other models
                if (response.StatusCode != System.Net.HttpStatusCode.ServiceUnavailable && 
                    response.StatusCode != System.Net.HttpStatusCode.TooManyRequests)
                {
                    throw lastException;
                }
            }
            catch (HttpRequestException ex)
            {
                lastException = ex;
            }
        }

        if (!success)
        {
            _logger.LogError(lastException, "All Gemini models failed or timed out.");
            throw lastException ?? new InvalidOperationException("Failed to connect to Gemini API.");
        }

        // Parse the Gemini response to extract the generated text
        var geminiResponse = JsonSerializer.Deserialize<JsonElement>(responseText);
        var generatedText = geminiResponse
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        if (string.IsNullOrWhiteSpace(generatedText))
            throw new InvalidOperationException("Gemini returned an empty response.");

        // Clean up the response - strip markdown code fences if present
        var cleanedJson = CleanJsonResponse(generatedText);

        _logger.LogInformation("Gemini response cleaned. Parsing JSON...");

        // Parse the cleaned JSON
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var examResponse = JsonSerializer.Deserialize<GeminiExamResponse>(cleanedJson, options);

        if (examResponse == null || examResponse.questions.Count == 0)
            throw new InvalidOperationException("Failed to parse questions from Gemini response.");

        _logger.LogInformation("Successfully parsed {Count} questions from Gemini response.", examResponse.questions.Count);

        return examResponse;
    }

    /// <summary>
    /// Strip ```json wrappers and other markdown formatting from Gemini response
    /// </summary>
    private static string CleanJsonResponse(string response)
    {
        var cleaned = response.Trim();
        var startIndex = cleaned.IndexOf('{');
        var endIndex = cleaned.LastIndexOf('}');
        
        if (startIndex >= 0 && endIndex >= startIndex)
        {
            return cleaned.Substring(startIndex, endIndex - startIndex + 1);
        }
        
        return cleaned;
    }
}
