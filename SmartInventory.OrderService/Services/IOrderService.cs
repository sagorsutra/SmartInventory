
using SmartInventory.OrderService.DTOs;
using SmartInventory.OrderService.Models;
namespace SmartInventory.OrderService.Services
{
    public interface IOrderService
    {
        public Task<OrderDto> CreateOrderAsync(CreateOrderRequest request);
        public Task<OrderDto> GetOrderByIdAsync(string orderId);
        Task<IEnumerable<OrderDto>> GetAllOrdersAsync();

        public Task<IEnumerable<OrderDto>> GetOrdersByCustomerIdAsync(string customerId);

        public Task<bool> DeleteOrderAsync(string orderId);

        public Task<bool> UpdateOrderStatusAsync(string orderId, OrderStatus status);

    }
}
