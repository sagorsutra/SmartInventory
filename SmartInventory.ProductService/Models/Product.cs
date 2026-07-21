using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;    
//using System.ComponentModel.DataAnnotations.Schema;

namespace SmartInventory.ProductService.Models
{
    public class Product
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? ProductId { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }

        //[Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }
        public required string Category { get; set; }
    }
}
