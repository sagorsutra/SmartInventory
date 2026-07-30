using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SmartInventory.OrderService.DTOs;
using SmartInventory.OrderService.Models;
using SmartInventory.OrderService.Services;

namespace SmartInventory.OrderService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateOrderRequest request)
        {
            var order = await _orderService.CreateOrderAsync(request);
            return StatusCode(201, order);
        }

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrderByIdAsync(string orderId)
        {
            var order = await _orderService.GetOrderByIdAsync(orderId);
            if (order == null)
            {
                return NotFound();
            }
            return Ok(order);
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetOrdersByCustomerIdAsync(string customerId)
        {
            var orders = await _orderService.GetOrdersByCustomerIdAsync(customerId);
            return Ok(orders);
        }

        [HttpPut("{orderId}/status")]
        public async Task<IActionResult> UpdateOrderAsync(string orderId, OrderStatus status)
        {
            var success = await _orderService.UpdateOrderStatusAsync(orderId, status);

            if (!success)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("{orderId}")]
        public async Task<IActionResult> DeleteOrderAsync(string orderId)
        {
            var success = await _orderService.DeleteOrderAsync(orderId);

            if (!success)
            {
                return NotFound();
            }

            return NoContent();
        }   
    }
}
