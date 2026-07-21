using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using SmartInventory.ProductService.Data;
using SmartInventory.ProductService.DTOs;
using SmartInventory.ProductService.Models;

namespace SmartInventory.ProductService.Services
{

    public class ProductService : IProductService
    {


        /*
         
        private readonly List<Product> _products = new()
        {
            new Product { ProductId = 1, Name = "Laptop", Description = "15-inch business laptop", Price = 55000, Category = "Electronics" },
            new Product { ProductId = 2, Name = "Wireless Mouse", Description = "Bluetooth mouse", Price = 800, Category = "Accessories" }
        };

        Now Using DB
        private readonly ProductDbContext _context;

        public ProductService(ProductDbContext context)
        {
            _context = context;
        }

         public async Task<ProductDto> CreateAsync(CreateProductRequest request)
        {
            //var newId = _context.Any() ? _context.Max(p => p.ProductId) + 1 : 1;

            var newProduct = new Product
            {
                 
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                Category = request.Category
            };

            _context.Add(newProduct);
            await _context.SaveChangesAsync();

            return new ProductDto(newProduct.ProductId, newProduct.Name, newProduct.Description, newProduct.Price, newProduct.Category);


        }

        public async Task<bool> DeleteAsync(int productId)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductId == productId);

            if (product == null)
            {
                return false;
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<ProductDto>> GetAllAsync()
        {
            var products = await _context.Products.ToListAsync();

            var result = new List<ProductDto>();

            foreach (var product in products)
            {
                result.Add(new ProductDto(
                    product.ProductId,
                    product.Name,
                    product.Description,
                    product.Price,
                    product.Category));
            }

            return result;
        }



        public async Task<ProductDto> GetByIdAsync(int productId)
        {
            //don't have to convert to dto because we are returning the product object directly from the list

            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductId == productId);

            if (product == null)
            {
                return null;
            }

            return new ProductDto(
                product.ProductId,
                product.Name,
                product.Description,
                product.Price,
                product.Category);
        }

        public async Task<bool> UpdateAsync(int productId, UpdateProductRequest request)
        {
            //first find the product in the list
            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductId == productId);

            if (product == null)
            {
                return false;

            }
            else
            {
                product.Name = request.Name;
                product.Description = request.Description;
                product.Price = request.Price;
                product.Category = request.Category;

                await _context.SaveChangesAsync();

                return (true);
            }
        }



         */



        private readonly IMongoCollection<Product> _products;
        public ProductService(IMongoClient mongoClient, IOptions<MongoDbSettings> mongoDbSettings)
        {
            var database = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
            _products = database.GetCollection<Product>("Products");
        }


        public async Task<ProductDto> CreateAsync(CreateProductRequest request)
        {
            //var newId = _context.Any() ? _context.Max(p => p.ProductId) + 1 : 1;

            var newProduct = new Product
            {

                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                Category = request.Category
            };

            await _products.InsertOneAsync(newProduct);


            return new ProductDto(newProduct.ProductId!, newProduct.Name, newProduct.Description, newProduct.Price, newProduct.Category);

        }

        public async Task<bool> DeleteAsync(string productId)
        {
            var result = await _products.DeleteOneAsync(p => p.ProductId == productId);
            return result.DeletedCount > 0;
        }






        public async Task<IEnumerable<ProductDto>> GetAllAsync()
        {
            var products = await _products.Find(_ => true).ToListAsync();

            var result = new List<ProductDto>();

            foreach (var product in products)
            {
                result.Add(new ProductDto(
                    product.ProductId!,
                    product.Name,
                    product.Description,
                    product.Price,
                    product.Category));
            }

            return result;
        }

        public async Task<ProductDto> GetByIdAsync(string productId)
        {
            var product = await _products.Find(p => p.ProductId == productId).FirstOrDefaultAsync();

            if (product == null)
            {
                return null;
            }

            return new ProductDto(
                product.ProductId!,
                product.Name,
                product.Description,
                product.Price,
                product.Category);
        }

        public async Task<bool> UpdateAsync(string productId, UpdateProductRequest request)
        {
            var update = Builders<Product>.Update
                .Set(p => p.Name, request.Name)
                .Set(p => p.Description, request.Description)
                .Set(p => p.Price, request.Price)
                .Set(p => p.Category, request.Category);

            var result = await _products.UpdateOneAsync(p => p.ProductId == productId, update);
            return result.ModifiedCount > 0;
        }

    }
}
