using CardManager.Core.DTOs;
using CardManager.Core.Entities;
using CardManager.Core.Interfaces;
using CardManager.Infrastructure.Helpers;

namespace CardManager.Services.Services;

public interface ICardService
{
    Task<IEnumerable<CardResponse>> GetUserCardsAsync(int userId);
    Task<CardResponse?> GetCardByIdAsync(int cardId, int userId);
    Task<CardResponse> AddCardAsync(int userId, AddCardDto dto);
    Task<CardResponse> UpdateCardAsync(int cardId, int userId, UpdateCardDto dto);
    Task DeleteCardAsync(int cardId, int userId);
    Task<IEnumerable<ShareCardResponse>> GetSharedCardsAsync(string shareToken);
}

public class CardService : ICardService
{
    private readonly IUnitOfWork _unitOfWork;

    public CardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<CardResponse>> GetUserCardsAsync(int userId)
    {
        var cards = await _unitOfWork.BankCards.FindAsync(c => c.UserId == userId);

        return cards.OrderByDescending(c => c.CreatedAt).Select(c => new CardResponse(
            c.Id,
            c.CardName,
            CardHelper.FormatCardNumber(CardHelper.DecryptCard(c.CardNumber)), // TAM nömrə
            c.CardType,
            c.ExpiryDate,
            c.CardColor,
            c.CreatedAt
        ));
    }

    public async Task<CardResponse?> GetCardByIdAsync(int cardId, int userId)
    {
        var card = await _unitOfWork.BankCards.FirstOrDefaultAsync(
            c => c.Id == cardId && c.UserId == userId
        );

        if (card == null) return null;

        return new CardResponse(
            card.Id,
            card.CardName,
            CardHelper.FormatCardNumber(CardHelper.DecryptCard(card.CardNumber)), // TAM nömrə
            card.CardType,
            card.ExpiryDate,
            card.CardColor,
            card.CreatedAt
        );
    }

    public async Task<CardResponse> AddCardAsync(int userId, AddCardDto dto)
    {
        var cleanNumber = CardHelper.CleanCardNumber(dto.CardNumber);
        if (!CardHelper.ValidateCardNumber(cleanNumber))
        {
            throw new InvalidOperationException("Kart nömrəsi düzgün deyil (Luhn yoxlaması uğursuz)");
        }

        var card = new BankCard
        {
            UserId = userId,
            CardName = dto.CardName,
            CardNumber = CardHelper.EncryptCard(cleanNumber),
            CardType = CardHelper.GetCardType(cleanNumber),
            ExpiryDate = dto.ExpiryDate,
            CardColor = dto.CardColor,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.BankCards.AddAsync(card);
        await _unitOfWork.CompleteAsync();

        return new CardResponse(
            card.Id,
            card.CardName,
            CardHelper.FormatCardNumber(cleanNumber),
            card.CardType,
            card.ExpiryDate,
            card.CardColor,
            card.CreatedAt
        );
    }

    public async Task<CardResponse> UpdateCardAsync(int cardId, int userId, UpdateCardDto dto)
    {
        var card = await _unitOfWork.BankCards.FirstOrDefaultAsync(
            c => c.Id == cardId && c.UserId == userId
        );

        if (card == null)
        {
            throw new KeyNotFoundException("Kart tapılmadı");
        }

        card.CardName = dto.CardName;
        card.ExpiryDate = dto.ExpiryDate;
        card.CardColor = dto.CardColor;
        card.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.BankCards.Update(card);
        await _unitOfWork.CompleteAsync();

        return new CardResponse(
            card.Id,
            card.CardName,
            CardHelper.FormatCardNumber(CardHelper.DecryptCard(card.CardNumber)), // TAM nömrə
            card.CardType,
            card.ExpiryDate,
            card.CardColor,
            card.CreatedAt
        );
    }

    public async Task DeleteCardAsync(int cardId, int userId)
    {
        var card = await _unitOfWork.BankCards.FirstOrDefaultAsync(
            c => c.Id == cardId && c.UserId == userId
        );

        if (card == null)
        {
            throw new KeyNotFoundException("Kart tapılmadı");
        }

        _unitOfWork.BankCards.Remove(card);
        await _unitOfWork.CompleteAsync();
    }

    public async Task<IEnumerable<ShareCardResponse>> GetSharedCardsAsync(string shareToken)
    {
        var decoded = QRHelper.DecodeShareToken(shareToken);

        if (decoded == null)
        {
            throw new InvalidOperationException("Token düzgün deyil");
        }

        var cards = await _unitOfWork.BankCards.FindAsync(c => c.UserId == decoded.UserId);

        return cards.OrderByDescending(c => c.CreatedAt).Select(c => new ShareCardResponse(
            c.Id,
            c.CardName,
            CardHelper.FormatCardNumber(CardHelper.DecryptCard(c.CardNumber)),
            c.CardType,
            c.ExpiryDate 
        ));
    }
}