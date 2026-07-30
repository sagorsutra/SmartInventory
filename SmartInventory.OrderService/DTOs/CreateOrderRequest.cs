namespace SmartInventory.OrderService.DTOs
{
    public record CreateOrderRequest
    (
        string CustomerId,
        List<OrderItemRequest> Items,
        string ShippingAddress
    );
}
