using System.ComponentModel.DataAnnotations.Schema;

namespace SmartInventory.ProductService.Models
{
    public class Product
    {
        public int ProductId { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }
        public required string Category { get; set; }
    }
}
