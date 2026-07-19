namespace SmartInventory.ProductService.DTOs
{
    
        public record UpdateProductRequest(
            string Name, 
            string Description, 
            decimal Price,
            string Category
            );
    
}
