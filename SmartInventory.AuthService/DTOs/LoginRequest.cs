namespace SmartInventory.AuthService.DTOs
{
    public record LoginRequest
    (
        string Username,
        string Password
     );
}
