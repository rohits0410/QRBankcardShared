namespace CardManager.Core.DTOs;

public record AddCardDto(
    string CardName,
    string CardNumber,
    string ExpiryDate,
    string CardColor
);

public record UpdateCardDto(
    string CardName,
    string ExpiryDate,
    string CardColor
);
public record CardResponse(
    int Id,
    string CardName,
    string CardNumber,      
    string CardType,
    string ExpiryDate,
    string CardColor,
    DateTime CreatedAt
);

public record ShareCardResponse(
    int Id,
    string CardName,
    string CardNumber,     
    string CardType,
    string ExpiryDate    
);

public record QRSharePayload(int UserId, long Timestamp);

public record RegisterDto(string Username, string Email, string Password);

public record LoginDto(string Email, string Password);

public record LoginResponse(string Token, int UserId, string Username);