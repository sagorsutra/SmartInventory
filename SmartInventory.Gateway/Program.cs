var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// Debug endpoint - temporary
app.MapGet("/debug-config", (IConfiguration config) =>
{
    var routes = config.GetSection("ReverseProxy:Routes").GetChildren();
    var result = routes.Select(r => new {
        Id = r.Key,
        Path = r["Match:Path"],
        ClusterId = r["ClusterId"]
    });
    return Results.Json(result);
});

app.MapReverseProxy();

app.Run();