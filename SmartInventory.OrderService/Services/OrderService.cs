using Microsoft.Extensions.Options;
using MongoDB.Driver;
using SmartInventory.OrderService.Data;
using SmartInventory.OrderService.DTOs;
using SmartInventory.OrderService.Models;


namespace SmartInventory.OrderService.Services
{
    public class OrderService : IOrderService
    {

        private readonly IMongoCollection<Order> _orders;
        private readonly ProductServiceClient _productServiceClient;

        public OrderService(IMongoClient mongoClient, IOptions<MongoDbSettings> mongoDbSettings, ProductServiceClient productServiceClient)
        {
            var database = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
            _orders = database.GetCollection<Order>("Orders");
            _productServiceClient = productServiceClient;
        }



        public async Task<OrderDto> CreateOrderAsync(CreateOrderRequest request)
        {
            var orderItems = new List<OrderItem>();
            decimal totalAmount = 0;

            foreach (var itemRequest in request.Items)
            {
                var product = await _productServiceClient.GetProductByIdAsync(itemRequest.ProductId);

                if (product == null)
                {
                    continue;
                }

                var orderItem = new OrderItem
                {
                    ProductId = product.ProductId,
                    ProductName = product.Name,
                    Quantity = itemRequest.Quantity,
                    UnitPrice = product.Price
                };

                orderItems.Add(orderItem);
                totalAmount += orderItem.Quantity * orderItem.UnitPrice;
            }

            var order = new Order
            {
                CustomerId = request.CustomerId,
                ShippingAddress = request.ShippingAddress,
                OrderItems = orderItems,
                TotalAmount = totalAmount,
                Status = OrderStatus.Pending,
                OrderDate = DateTime.UtcNow
            };

            await _orders.InsertOneAsync(order);

            var itemDtos = order.OrderItems.Select(item =>
                new OrderItemDto(item.ProductId, item.ProductName, item.Quantity, item.UnitPrice)
            ).ToList();

            return new OrderDto(
                order.Id!,
                order.CustomerId,
                order.TotalAmount,
                order.OrderDate,
                order.Status.ToString(),
                itemDtos,
                order.ShippingAddress
            );
        }

        public async Task<bool> DeleteOrderAsync(string orderId)
        {
             var result = await _orders.DeleteOneAsync(o => o.Id == orderId);
            return result.DeletedCount > 0;
        }

        public async Task<OrderDto> GetOrderByIdAsync(string orderId)
        {
            var order = await _orders.Find(o => o.Id == orderId).FirstOrDefaultAsync();

            if (order == null)
            {
                return null;
            }

            var itemDtos = order.OrderItems.Select(item =>
                new OrderItemDto(item.ProductId, item.ProductName, item.Quantity, item.UnitPrice)
            ).ToList();

            return new OrderDto(
                order.Id!,
                order.CustomerId,
                order.TotalAmount,
                order.OrderDate,
                order.Status.ToString(),
                itemDtos,
                order.ShippingAddress
            );
        }

        public async Task<IEnumerable<OrderDto>> GetOrdersByCustomerIdAsync(string customerId)
        {
            var orders = await _orders.Find(o => o.CustomerId == customerId).ToListAsync();

            var orderDtos = new List<OrderDto>();

            foreach (var order in orders)
            {
                var itemDtos = order.OrderItems.Select(item =>
                    new OrderItemDto(item.ProductId, item.ProductName, item.Quantity, item.UnitPrice)
                ).ToList();

                var orderDto = new OrderDto(
                    order.Id!,
                    order.CustomerId,
                    order.TotalAmount,
                    order.OrderDate,
                    order.Status.ToString(),
                    itemDtos,
                    order.ShippingAddress
                );

                orderDtos.Add(orderDto);
            }

            return orderDtos;
        }

        public async Task<bool> UpdateOrderStatusAsync(string orderId, OrderStatus status)
        {
            var update = Builders<Order>.Update
                .Set(o => o.Status, status);

            var result = await _orders.UpdateOneAsync(o => o.Id == orderId, update);
            return result.ModifiedCount > 0;
        }
        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            var orders = await _orders.Find(_ => true).ToListAsync();

            var orderDtos = new List<OrderDto>();

            foreach (var order in orders)
            {
                var itemDtos = order.OrderItems.Select(item =>
                    new OrderItemDto(item.ProductId, item.ProductName, item.Quantity, item.UnitPrice)
                ).ToList();

                orderDtos.Add(new OrderDto(
                    order.Id!,
                    order.CustomerId,
                    order.TotalAmount,
                    order.OrderDate,
                    order.Status.ToString(),
                    itemDtos,
                    order.ShippingAddress
                ));
            }

            return orderDtos;
        }
    }
}
