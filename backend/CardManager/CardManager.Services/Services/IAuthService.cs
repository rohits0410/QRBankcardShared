using CardManager.Core.DTOs;
using CardManager.Core.Entities;
using CardManager.Core.Interfaces;
using CardManager.Infrastructure.Helpers;
using Microsoft.Extensions.Configuration;

namespace CardManager.Services.Services;

public interface IAuthService
{
    Task<LoginResponse> RegisterAsync(RegisterDto dto);
    Task<LoginResponse> LoginAsync(LoginDto dto);
    Task<User?> GetUserByIdAsync(int userId);
}

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly string _jwtSecret;

    public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _jwtSecret = configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT Secret not configured");
    }

    public async Task<LoginResponse> RegisterAsync(RegisterDto dto)
    {
        // Email yoxla
        if (await _unitOfWork.Users.AnyAsync(u => u.Email == dto.Email))
        {
            throw new InvalidOperationException("Bu email artıq qeydiyyatdan keçib");
        }

        // User yarat
        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CompleteAsync();

        // Token generate et
        var token = JwtHelper.GenerateToken(user.Id, user.Email, _jwtSecret);

        return new LoginResponse(token, user.Id, user.Username);
    }

    public async Task<LoginResponse> LoginAsync(LoginDto dto)
    {
        // User tap
        var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Email və ya şifrə yanlışdır");
        }

        // Token generate et
        var token = JwtHelper.GenerateToken(user.Id, user.Email, _jwtSecret);

        return new LoginResponse(token, user.Id, user.Username);
    }

    public async Task<User?> GetUserByIdAsync(int userId)
    {
        return await _unitOfWork.Users.GetByIdAsync(userId);
    }
}