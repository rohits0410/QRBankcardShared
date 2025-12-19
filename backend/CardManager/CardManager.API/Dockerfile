# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY CardManager.sln ./

# Copy ALL project files first
COPY CardManager.Core/CardManager.Core.csproj CardManager.Core/
COPY CardManager.Infrastructure/CardManager.Infrastructure.csproj CardManager.Infrastructure/
COPY CardManager.Services/CardManager.Services.csproj CardManager.Services/
COPY CardManager.API/CardManager.API.csproj CardManager.API/

# Clear any local NuGet config
RUN rm -f NuGet.Config nuget.config

# Restore ALL packages
RUN dotnet restore CardManager.sln

# Now copy all source code (EXCEPT NuGet.Config)
COPY CardManager.Core/ CardManager.Core/
COPY CardManager.Infrastructure/ CardManager.Infrastructure/
COPY CardManager.Services/ CardManager.Services/
COPY CardManager.API/ CardManager.API/

# Remove any copied NuGet configs
RUN find . -iname "nuget.config" -delete

# Build
WORKDIR /src/CardManager.API
RUN dotnet build -c Release -o /app/build --no-restore

# Publish
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish --no-restore /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published files
COPY --from=publish /app/publish .

# Expose port
EXPOSE 5000

# Environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Entry point
ENTRYPOINT ["dotnet", "CardManager.API.dll"]