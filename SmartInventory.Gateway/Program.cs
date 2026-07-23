var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// Debug endpoint - temporary
app.MapGet("/debug-config", () =>
{
    var currentDir = Directory.GetCurrentDirectory();
    var files = Directory.GetFiles(currentDir);
    var appsettingsExists = File.Exists(Path.Combine(currentDir, "appsettings.json"));
    string content = appsettingsExists ? File.ReadAllText(Path.Combine(currentDir, "appsettings.json")) : "FILE NOT FOUND";

    return Results.Json(new
    {
        currentDir,
        files,
        appsettingsExists,
        content
    });
});

app.MapReverseProxy();

app.Run();