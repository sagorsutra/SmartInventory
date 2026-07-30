using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartInventory.OrderService.Models
    {
        public class Order
        {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
            public required string CustomerId { get; set; }
            public decimal TotalAmount { get; set; }
            public required DateTime OrderDate { get; set; }
            public required OrderStatus Status { get; set; }
            public List<OrderItem> OrderItems { get; set; } = new ();

            public required string ShippingAddress { get; set; }

        }
    }
