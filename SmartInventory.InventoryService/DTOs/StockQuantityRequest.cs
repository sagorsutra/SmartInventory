namespace SmartInventory.InventoryService.DTOs
{
    public record StockQuantityRequest
    (
        string ProductId,
        int Quantity
    );
    
}
