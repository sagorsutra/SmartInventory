
using SmartInventory.InventoryService.DTOs;
using SmartInventory.InventoryService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace SmartInventory.InventoryService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }


        [HttpGet("alerts")]
        public async Task<IActionResult> GetLowStockAlerts()
        {
            var alerts = await _inventoryService.GetLowStockAlertsAsync();
            return Ok(alerts);
        }

        [HttpGet("{productId}")]
        public async Task<IActionResult> GetCurrentStockLevel(string productId)
        {
            var stockLevel = await _inventoryService.GetCurrentStockLevelAsync(productId);
            return Ok(stockLevel);
        }

        [HttpGet("{productId}/available")]
        public async Task<IActionResult> CheckStockAvailability(string productId, [FromQuery] int quantity)
        {
            var isAvailable = await _inventoryService.CheckStockAvailabilityAsync(productId, quantity);
            return Ok(isAvailable);
        }

        [HttpPost("reserve")]
        public async Task<IActionResult> ReserveStock(StockQuantityRequest request)
        {
            var success = await _inventoryService.ReserveStockAsync(request.ProductId, request.Quantity);

            if (!success)
            {
                return BadRequest("Not enough stock available.");
            }

            return NoContent();
        }

        [HttpPost("release")]
        public async Task<IActionResult> ReleaseStock(StockQuantityRequest request)
        {
            var success = await _inventoryService.ReleaseStockAsync(request.ProductId, request.Quantity);

            if (!success)
            {
                return BadRequest("Failed to release stock.");
            }

            return NoContent();
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateStock(StockQuantityRequest request)
        {
            var success = await _inventoryService.UpdateStockAsync(request.ProductId, request.Quantity);

            if (!success)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost]
        public async Task<IActionResult> CreateInventory(CreateInventoryRequest request)
        {
            var inventory = await _inventoryService.CreateInventoryAsync(request);
            return StatusCode(201, inventory);
        }

    }
}
