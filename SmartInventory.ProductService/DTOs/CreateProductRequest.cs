namespace SmartInventory.ProductService.DTOs
{
    public record CreateProductRequest(
        string Name,
        string Description,
        decimal Price,
        string Category
        );
}
