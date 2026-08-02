using SmartInventory.AuthService.DTOs;

namespace SmartInventory.AuthService.Services
{
    public interface IAuthService
    {
        Task<UserDto> RegisterAsync(RegisterRequest request);
        Task<AuthResult> LoginAsync(LoginRequest request);
        Task<bool> LogoutAsync(string userId);
        Task<bool> IsInRoleAsync(string userId, string role);
        Task<bool> AssignRoleAsync(string userId, string role);


    }
}
