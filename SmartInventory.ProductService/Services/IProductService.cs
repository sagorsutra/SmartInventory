using SmartInventory.ProductService.DTOs;

namespace SmartInventory.ProductService.Services
{
    public interface IProductService
    {
        Task<ProductDto> GetByIdAsync(int productId);   
        Task<IEnumerable<ProductDto>> GetAllAsync();
        Task<ProductDto> CreateAsync(CreateProductRequest request);
        Task<bool> UpdateAsync(int productId, UpdateProductRequest request);
        Task<bool> DeleteAsync(int productId);
    }
}
