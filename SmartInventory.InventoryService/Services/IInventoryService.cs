using SmartInventory.InventoryService.Models;
using SmartInventory.InventoryService.DTOs;
namespace SmartInventory.InventoryService.Services
{
    public interface IInventoryService
    {
        Task<bool> CheckStockAvailabilityAsync(string productId, int quantity);
        Task<bool> ReserveStockAsync(string productId, int quantity);
        Task<bool> ReleaseStockAsync(string productId, int quantity);
        Task<bool> UpdateStockAsync(string productId, int quantityChange);
        Task<int> GetCurrentStockLevelAsync(string productId);
        Task<IEnumerable<StockAlertDto>> GetLowStockAlertsAsync();
        Task<InventoryDto> CreateInventoryAsync(CreateInventoryRequest request);
    }
}
