namespace SmartInventory.AuthService.DTOs
{
    public record AuthResult
    (
        bool Success, 
        string Token, 
        string UserId, 
        string Role
     );
}
