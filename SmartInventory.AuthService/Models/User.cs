using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace SmartInventory.AuthService.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public required string Username { get; set; }
        public required string PasswordHash { get; set; }
        public string Role { get; set; } = "Customer";
        public required string Email { get; set; }
    }
}
