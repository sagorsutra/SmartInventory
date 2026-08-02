using SmartInventory.OrderService.DTOs;

namespace SmartInventory.OrderService.Services
{
    public class ProductServiceClient
    {
        private readonly HttpClient _httpClient;

        public ProductServiceClient(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient("ProductService");
        }

        public async Task<ProductInfo> GetProductByIdAsync(string productId)
        {
            var response = await _httpClient.GetAsync($"api/product/{productId}");
            if (response.IsSuccessStatusCode)
            {
                var product = await response.Content.ReadFromJsonAsync<ProductInfo>(
                    new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );
                return product!;
            }
            else
            {
                throw new Exception($"Failed to fetch product with ID {productId}. Status code: {response.StatusCode}");
            }
        }
    }
}