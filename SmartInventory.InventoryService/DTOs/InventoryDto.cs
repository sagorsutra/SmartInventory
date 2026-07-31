namespace SmartInventory.InventoryService.DTOs
{
    public record InventoryDto
    (
        string ProductId,
        int StockQuantity,
        int ReorderThreshold
    );
}
