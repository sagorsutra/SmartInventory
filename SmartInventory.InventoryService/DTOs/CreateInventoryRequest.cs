namespace SmartInventory.InventoryService.DTOs
{
    public record CreateInventoryRequest(
        string ProductId, 
        int StockQuantity,
        int ReorderThreshold
        );
}