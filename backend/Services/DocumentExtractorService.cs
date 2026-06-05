using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using System.Text;

namespace QuizPlatform.Services;

/// <summary>
/// Service to extract raw text from uploaded documents (.docx, .txt)
/// </summary>
public class DocumentExtractorService
{
    /// <summary>
    /// Extract text from an uploaded file based on its extension
    /// </summary>
    public async Task<string> ExtractTextAsync(Stream fileStream, string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();

        return extension switch
        {
            ".docx" => ExtractFromDocx(fileStream),
            ".txt" => await ExtractFromTxt(fileStream),
            _ => throw new NotSupportedException($"File type '{extension}' is not supported. Please upload .docx or .txt files.")
        };
    }

    private string ExtractFromDocx(Stream stream)
    {
        using var doc = WordprocessingDocument.Open(stream, false);
        var body = doc.MainDocumentPart?.Document.Body;

        if (body == null)
            throw new InvalidOperationException("The .docx file has no readable content.");

        var sb = new StringBuilder();

        foreach (var paragraph in body.Elements<Paragraph>())
        {
            var text = paragraph.InnerText;
            if (!string.IsNullOrWhiteSpace(text))
            {
                sb.AppendLine(text);
            }
        }

        var result = sb.ToString().Trim();

        if (string.IsNullOrWhiteSpace(result))
            throw new InvalidOperationException("The .docx file is empty or contains no extractable text.");

        return result;
    }

    private async Task<string> ExtractFromTxt(Stream stream)
    {
        using var reader = new StreamReader(stream, Encoding.UTF8);
        var text = await reader.ReadToEndAsync();

        if (string.IsNullOrWhiteSpace(text))
            throw new InvalidOperationException("The .txt file is empty.");

        return text.Trim();
    }
}
