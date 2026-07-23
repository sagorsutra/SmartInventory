var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// Debug endpoint - temporary
app.MapGet("/debug-config", (IConfiguration config) =>
{
    var allKeys = config.AsEnumerable()
        .Where(kvp => kvp.Key.StartsWith("ReverseProxy") || kvp.Key.StartsWith("Logging"))
        .Select(kvp => new { kvp.Key, kvp.Value });
    return Results.Json(allKeys);
});

app.MapReverseProxy();

app.Run();