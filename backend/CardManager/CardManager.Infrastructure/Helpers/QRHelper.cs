using System.Text.Json;
using CardManager.Core.DTOs;
using QRCoder;

namespace CardManager.Infrastructure.Helpers;

public static class QRHelper
{
    public static byte[] GenerateQRCode(string data)
    {
        using var qrGenerator = new QRCodeGenerator();
        var qrCodeData = qrGenerator.CreateQrCode(data, QRCodeGenerator.ECCLevel.Q);
        var qrCode = new PngByteQRCode(qrCodeData);
        return qrCode.GetGraphic(20);
    }

    public static string GenerateShareToken(int userId)
    {
        var payload = new QRSharePayload(
            userId,
            DateTimeOffset.UtcNow.ToUnixTimeSeconds()
        );

        return Convert.ToBase64String(
            System.Text.Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload))
        );
    }

    public static QRSharePayload? DecodeShareToken(string token)
    {
        try
        {
            var json = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(token));
            return JsonSerializer.Deserialize<QRSharePayload>(json);
        }
        catch
        {
            return null;
        }
    }
}