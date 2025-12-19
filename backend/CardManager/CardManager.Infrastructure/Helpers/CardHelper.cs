namespace CardManager.Infrastructure.Helpers;

public static class CardHelper
{
    public static bool ValidateCardNumber(string cardNumber)
    {
        cardNumber = cardNumber.Replace(" ", "").Replace("-", "");

        if (cardNumber.Length < 13 || cardNumber.Length > 19)
            return false;

        if (!cardNumber.All(char.IsDigit))
            return false;

        int sum = 0;
        bool alternate = false;

        for (int i = cardNumber.Length - 1; i >= 0; i--)
        {
            int digit = cardNumber[i] - '0';

            if (alternate)
            {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }

            sum += digit;
            alternate = !alternate;
        }

        return sum % 10 == 0;
    }

    public static string GetCardType(string cardNumber)
    {
        cardNumber = cardNumber.Replace(" ", "").Replace("-", "");

        if (cardNumber.StartsWith("4")) return "Visa";
        if (cardNumber.StartsWith("5")) return "Mastercard";
        if (cardNumber.StartsWith("9") && cardNumber.Length == 16) return "Humo";
        if (cardNumber.StartsWith("6")) return "Maestro";

        return "Unknown";
    }

    public static string FormatCardNumber(string cardNumber)
    {
        cardNumber = cardNumber.Replace(" ", "").Replace("-", "");

        if (cardNumber.Length < 4)
            return cardNumber;

        if (cardNumber.Length == 16)
        {
            return $"{cardNumber.Substring(0, 4)} {cardNumber.Substring(4, 4)} {cardNumber.Substring(8, 4)} {cardNumber.Substring(12, 4)}";
        }

        var formatted = string.Empty;
        for (int i = 0; i < cardNumber.Length; i++)
        {
            if (i > 0 && i % 4 == 0)
                formatted += " ";
            formatted += cardNumber[i];
        }

        return formatted;
    }

    public static string EncryptCard(string cardNumber)
    {
        // Boşluqları sil
        cardNumber = cardNumber.Replace(" ", "").Replace("-", "");
        return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(cardNumber));
    }

    public static string DecryptCard(string encryptedCard)
    {
        return System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(encryptedCard));
    }

    public static string CleanCardNumber(string cardNumber)
    {
        return cardNumber.Replace(" ", "").Replace("-", "");
    }
}