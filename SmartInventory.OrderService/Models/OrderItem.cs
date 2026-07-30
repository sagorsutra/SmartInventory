namespace SmartInventory.OrderService.Models
{
    public class OrderItem
    {
        public required string ProductId { get; set; }
        public required string ProductName { get; set; }
        public required int Quantity { get; set; }

        public required decimal UnitPrice { get; set; }

        }
}
