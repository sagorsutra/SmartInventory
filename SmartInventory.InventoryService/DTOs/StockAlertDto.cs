namespace SmartInventory.InventoryService.DTOs
{
    public record StockAlertDto
    (
        string ProductId,
        string ProductName,
        int CurrentStock,
        int ReorderThreshold
    );
}
