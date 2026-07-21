namespace SmartInventory.ProductService.DTOs
{
    public record ProductDto(
        string ProductId,
        string Name,
        string Description,
        decimal Price,
        string Category
        );
}
