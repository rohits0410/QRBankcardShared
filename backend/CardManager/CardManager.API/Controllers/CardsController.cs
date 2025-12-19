using CardManager.Core.DTOs;
using CardManager.Infrastructure.Helpers;
using CardManager.Services.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CardManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CardsController : ControllerBase
{
    private readonly ICardService _cardService;
    private readonly ILogger<CardsController> _logger;

    public CardsController(ICardService cardService, ILogger<CardsController> logger)
    {
        _cardService = cardService;
        _logger = logger;
    }

    private int GetUserId()
    {
        var userId = JwtHelper.GetUserIdFromToken(User);
        if (userId == null)
        {
            throw new UnauthorizedAccessException("User ID tapılmadı");
        }
        return userId.Value;
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<CardResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCards()
    {
        try
        {
            var userId = GetUserId();
            var cards = await _cardService.GetUserCardsAsync(userId);
            return Ok(cards);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(CardResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCard(int id)
    {
        try
        {
            var userId = GetUserId();
            var card = await _cardService.GetCardByIdAsync(id, userId);

            if (card == null)
            {
                return NotFound("Kart tapılmadı");
            }

            return Ok(card);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(CardResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddCard([FromBody] AddCardDto dto)
    {
        try
        {
            var userId = GetUserId();
            var card = await _cardService.AddCardAsync(userId, dto);

            _logger.LogInformation("Card added: {CardId} by User: {UserId}", card.Id, userId);

            return CreatedAtAction(nameof(GetCard), new { id = card.Id }, card);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(CardResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCard(int id, [FromBody] UpdateCardDto dto)
    {
        try
        {
            var userId = GetUserId();
            var card = await _cardService.UpdateCardAsync(id, userId, dto);

            _logger.LogInformation("Card updated: {CardId} by User: {UserId}", id, userId);

            return Ok(card);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCard(int id)
    {
        try
        {
            var userId = GetUserId();
            await _cardService.DeleteCardAsync(id, userId);

            _logger.LogInformation("Card deleted: {CardId} by User: {UserId}", id, userId);

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("shared")]
    [ProducesResponseType(typeof(IEnumerable<ShareCardResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetSharedCards([FromQuery] string token)
    {
        try
        {
            var cards = await _cardService.GetSharedCardsAsync(token);
            return Ok(cards);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Invalid share token: {Message}", ex.Message);
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Expired share token: {Message}", ex.Message);
            return Unauthorized(ex.Message);
        }
    }

    [HttpGet("generate-share-token")]
    [Authorize]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    public IActionResult GenerateShareToken()
    {
        try
        {
            var userId = GetUserId();
            var shareToken = QRHelper.GenerateShareToken(userId);

            return Ok(new { token = shareToken });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }
}