using SmartInventory.ProductService.DTOs;

namespace SmartInventory.ProductService.Services
{
    public interface IProductService
    {
        Task<ProductDto> GetByIdAsync(string productId);   
        Task<IEnumerable<ProductDto>> GetAllAsync();
        Task<ProductDto> CreateAsync(CreateProductRequest request);
        Task<bool> UpdateAsync(string productId, UpdateProductRequest request);
        Task<bool> DeleteAsync(string productId);
    }
}
