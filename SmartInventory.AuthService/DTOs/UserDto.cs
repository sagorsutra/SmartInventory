namespace SmartInventory.AuthService.DTOs
{
    public record UserDto
    (
        string UserId,
        string Username,
        string Email,
        string Role
    );
}
