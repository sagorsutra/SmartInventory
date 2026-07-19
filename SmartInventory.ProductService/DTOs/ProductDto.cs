namespace SmartInventory.ProductService.DTOs
{
    public record ProductDto(
        int ProductId,
        string Name,
        string Description,
        decimal Price,
        string Category
        );
}
