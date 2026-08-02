using MongoDB.Driver;
using Microsoft.Extensions.Options;
using SmartInventory.AuthService.Data;
using SmartInventory.AuthService.DTOs;
using SmartInventory.AuthService.Models;


namespace SmartInventory.AuthService.Services
{
    public class AuthService : IAuthService
    {
        private readonly IMongoCollection<User> _users;
        private readonly JwtSettings _jwtSettings;

        public AuthService(IMongoClient mongoClient, IOptions<MongoDbSettings> mongoDbSettings, IOptions<JwtSettings> jwtSettings)
        {
            var database = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
            _users = database.GetCollection<User>("Users");
            _jwtSettings = jwtSettings.Value;
        }

        public async Task<UserDto> RegisterAsync(RegisterRequest request)
        {
            var existingUser = await _users.Find(u => u.Username == request.Username).FirstOrDefaultAsync();

            if (existingUser != null)
            {
                throw new Exception("Username already exists.");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var newUser = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = request.Role
            };

            await _users.InsertOneAsync(newUser);

            return new UserDto(newUser.Id!, newUser.Username, newUser.Email, newUser.Role);
        }

        public async Task<AuthResult> LoginAsync(LoginRequest request)
        {
            var user = await _users.Find(u => u.Username == request.Username).FirstOrDefaultAsync();

            if (user == null)
            {
                return new AuthResult(false, "", "", "");
            }

            bool passwordMatches = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            if (!passwordMatches)
            {
                return new AuthResult(false, "", "", "");
            }

            var token = JwtTokenGenerator.GenerateToken(user, _jwtSettings);

            return new AuthResult(true, token, user.Id!, user.Role);
        }

        public Task<bool> LogoutAsync(string userId)
        {
            return Task.FromResult(true);
        }

        public async Task<bool> IsInRoleAsync(string userId, string role)
        {
            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            return user != null && user.Role == role;
        }

        public async Task<bool> AssignRoleAsync(string userId, string role)
        {
            var update = Builders<User>.Update.Set(u => u.Role, role);
            var result = await _users.UpdateOneAsync(u => u.Id == userId, update);
            return result.ModifiedCount > 0;
        }
    }
}