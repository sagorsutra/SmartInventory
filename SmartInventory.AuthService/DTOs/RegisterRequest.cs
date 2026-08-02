namespace SmartInventory.AuthService.DTOs
{
    public record RegisterRequest
    (
        string Username,
        string Email,
        string Password, 
        string Role
    );
}
