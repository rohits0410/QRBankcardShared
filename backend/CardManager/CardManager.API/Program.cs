using CardManager.Core.Interfaces;
using CardManager.Infrastructure.Data;
using CardManager.Infrastructure.UnitOfWork;
using CardManager.Services.Services;
using CardManager.API.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configuration
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("JWT Secret not configured");

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseNpgsql(connectionString);
});

// Unit of Work Pattern
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICardService, CardService>();

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero,
            ValidateLifetime = true
        };

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                var userIdClaim = context.Principal?.FindFirst("user_id");
                if (userIdClaim != null)
                {
                    context.HttpContext.Items["UserId"] = userIdClaim.Value;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Card Manager API",
        Version = "v1",
        Description = "Bank kartlarını idarə etmək üçün REST API",
        Contact = new OpenApiContact
        {
            Name = "Card Manager Team",
            Email = "support@cardmanager.az"
        }
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

builder.Services.AddHealthChecks()
    .AddNpgSql(
        builder.Configuration.GetConnectionString("DefaultConnection")!,
        name: "postgres",
        timeout: TimeSpan.FromSeconds(3),
        tags: new[] { "ready" });

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var app = builder.Build();

try
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    var appLogger = services.GetRequiredService<ILogger<Program>>();

    appLogger.LogInformation("Starting database migration...");

    var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
    if (pendingMigrations.Any())
    {
        appLogger.LogInformation("Found {Count} pending migrations: {Migrations}",
            pendingMigrations.Count(),
            string.Join(", ", pendingMigrations));

        await context.Database.MigrateAsync();

        appLogger.LogInformation("Database migration completed successfully");
    }
    else
    {
        appLogger.LogInformation("No pending migrations found");
    }

    var canConnect = await context.Database.CanConnectAsync();
    if (canConnect)
    {
        appLogger.LogInformation("Database connection successful");
    }
    else
    {
        appLogger.LogError("Database connection failed");
        throw new Exception("Cannot connect to database");
    }
}
catch (Exception ex)
{
    var startupLogger = app.Services.GetRequiredService<ILogger<Program>>();
    startupLogger.LogError(ex, "An error occurred while migrating the database: {Message}", ex.Message);

    if (app.Environment.IsProduction())
    {
        startupLogger.LogWarning("Continuing startup despite migration error (Production mode)");
    }
    else
    {
        throw; 
    }
}

app.UseMiddleware<ExceptionMiddleware>();
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Card Manager API v1");
    options.RoutePrefix = "swagger";
    options.DocumentTitle = "Card Manager API Documentation";
});

app.MapHealthChecks("/health");
app.UseCors("AllowAll");
if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/", () => Results.Redirect("/swagger"));

// Startup log
var finalLogger = app.Services.GetRequiredService<ILogger<Program>>();
finalLogger.LogInformation("Card Manager API started successfully");
finalLogger.LogInformation("Environment: {Environment}", app.Environment.EnvironmentName);
finalLogger.LogInformation("Swagger UI: /swagger");
finalLogger.LogInformation("Health Check: /health");

app.Run();