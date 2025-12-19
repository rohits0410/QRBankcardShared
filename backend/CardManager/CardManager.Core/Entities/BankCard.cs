namespace CardManager.Core.Entities;

public class BankCard
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string CardName { get; set; } = string.Empty;
    public string CardNumber { get; set; } = string.Empty; // Encrypted
    public string CardType { get; set; } = string.Empty;
    public string ExpiryDate { get; set; } = string.Empty;
    public string CardColor { get; set; } = "#1e3a8a";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public User User { get; set; } = null!;
}