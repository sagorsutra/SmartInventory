namespace SmartInventory.OrderService.DTOs
{
    public record OrderItemDto
    (
       string ProductId,
       string ProductName,
       int Quantity,
       decimal UnitPrice
    );
}
