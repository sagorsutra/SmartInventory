namespace SmartInventory.OrderService.DTOs
{
    public record OrderDto
    (
        string OrderId,
        string CustomerId,
        decimal TotalAmount,
        DateTime OrderDate,
        string Status,
        List<OrderItemDto> OrderItems,
        string ShippingAddress
    );
}
