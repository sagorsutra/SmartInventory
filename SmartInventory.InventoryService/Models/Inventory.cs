
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace SmartInventory.InventoryService.Models
{
    public class Inventory
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public  required string  ProductId { get; set; }
        public int StockQuantity { get; set; } = 0;
        public int ReorderThreshold { get; set; } = 10;

    }
}
