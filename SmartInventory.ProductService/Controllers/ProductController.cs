using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SmartInventory.ProductService.DTOs;
using SmartInventory.ProductService.Services;

namespace SmartInventory.ProductService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _productService.GetAllAsync();
            return Ok(products);
        }

        [HttpGet("{id}")]

        public async Task<IActionResult> GetById(string id)
        {
            var product = await _productService.GetByIdAsync(id);

            if(product == null)
            {
                return NotFound();
            }

            return Ok(product);
        }

        [HttpPost]

        public async Task<IActionResult> Create(CreateProductRequest request) {

            var newProduct = await _productService.CreateAsync(request);

            return StatusCode(201, newProduct);

        }

            [HttpPut("{id}")]
            public async Task<IActionResult> Update(string id, UpdateProductRequest request)
            {
                var success = await _productService.UpdateAsync(id, request);

            if (!success)
            {
                return NotFound();
            }

            return NoContent();

        }

        [HttpDelete("{id}")]

        public async Task<IActionResult> Delete(string id)
        {
            var delete = await _productService.DeleteAsync(id);

            if (!delete)
            {
                return NotFound();
            }

            return NoContent();
        }

    }
}
