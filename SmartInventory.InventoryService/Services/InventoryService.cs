 
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using SmartInventory.InventoryService.Data;
using SmartInventory.InventoryService.DTOs;
using SmartInventory.InventoryService.Models;

namespace SmartInventory.InventoryService.Services
{
    public class InventoryService : IInventoryService {

        //Before the implementation of the methods, you might want to inject dependencies like a database context or a repository
        //to interact with the inventory data. For example, if you're using MongoDB, you would typically have a MongoDB context or collection injected into this service.

        private readonly IMongoCollection<Inventory> _inventories;
        private readonly ProductServiceClient _productServiceClient;


        public InventoryService(IMongoClient mongoClient, IOptions<MongoDbSettings> mongoDbSettings, ProductServiceClient productServiceClient)
        {
            var database = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
            _inventories = database.GetCollection<Inventory>("Inventories");
            _productServiceClient = productServiceClient;
        }



        // --- Methods required by IInventoryService ---
        public async Task<bool> CheckStockAvailabilityAsync(string productId, int quantity)
            {
                var inventory = await _inventories.Find(i => i.ProductId == productId).FirstOrDefaultAsync();

                if(inventory == null || inventory.StockQuantity < quantity)
            {
                return false;
            }
                return true;
        }

            public async Task<bool> ReserveStockAsync(string productId, int quantity)
            {
                    var inventory = await _inventories.Find(i => i.ProductId == productId).FirstOrDefaultAsync();

                    if(inventory == null || inventory.StockQuantity < quantity)
                    {
                        return false; // Not enough stock available
                    }
                    
                    var update = Builders<Inventory>.Update.Set(i=> i.StockQuantity,inventory.StockQuantity-quantity);
                    
                    var result = await _inventories.UpdateOneAsync(i=> i.ProductId == productId, update);

                    return result.ModifiedCount > 0;

        }
        public async Task<InventoryDto> CreateInventoryAsync(CreateInventoryRequest request)
        {
            var inventory = new Inventory
            {
                ProductId = request.ProductId,
                StockQuantity = request.StockQuantity,
                ReorderThreshold = request.ReorderThreshold
            };

            await _inventories.InsertOneAsync(inventory);

            return new InventoryDto(inventory.ProductId, inventory.StockQuantity, inventory.ReorderThreshold);
        }

        public async Task<bool> ReleaseStockAsync(string productId, int quantity)
            {
            var inventory = await _inventories.Find(i => i.ProductId == productId).FirstOrDefaultAsync();

            if (inventory == null){
                    return false;
                }

            var update = Builders<Inventory>.Update.Set(i => i.StockQuantity, inventory.StockQuantity + quantity);

            var result = await _inventories.UpdateOneAsync(i => i.ProductId == productId, update);

            return result.ModifiedCount > 0;
            }
   
        public async Task<bool> UpdateStockAsync(string productId, int quantityChange)
            {
            var inventory = await _inventories.Find(i => i.ProductId == productId).FirstOrDefaultAsync();

            if (inventory == null)
            {
                return false;
            }

            var update = Builders<Inventory>.Update.Set(i => i.StockQuantity, inventory.StockQuantity + quantityChange);

            var result = await _inventories.UpdateOneAsync(i => i.ProductId == productId, update);

            return result.ModifiedCount > 0;
        }

            public async Task<int> GetCurrentStockLevelAsync(string productId)
            {
            var inventory = await _inventories.Find(p => p.ProductId == productId).FirstOrDefaultAsync();
            return inventory?.StockQuantity ?? 0;
        }

        public async Task<IEnumerable<StockAlertDto>> GetLowStockAlertsAsync()
        {
            var lowStockInventories = await _inventories.Find(i => i.StockQuantity <= i.ReorderThreshold).ToListAsync();

            var alerts = new List<StockAlertDto>();

            foreach (var inventory in lowStockInventories)
            {
                try
                {
                    var product = await _productServiceClient.GetProductByIdAsync(inventory.ProductId);
                    alerts.Add(new StockAlertDto(
                        inventory.ProductId,
                        product.Name,
                        inventory.StockQuantity,
                        inventory.ReorderThreshold
                    ));
                }
                catch (Exception)
                {
                    continue;
                }
            }

            return alerts;
        }
    }
    }

