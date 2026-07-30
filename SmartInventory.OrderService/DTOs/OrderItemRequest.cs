    namespace SmartInventory.OrderService.DTOs
    {
        public record OrderItemRequest
        (
            string ProductId,
            int Quantity
        );
    }
