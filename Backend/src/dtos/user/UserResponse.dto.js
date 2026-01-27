/**
 * UserResponseDTO
 */
class UserResponseDTO {
    constructor(user) {
        this.id = user.id;
        this.email = user.email;
        this.name = user.name;
        this.role = user.role;
        this.isVerified = user.is_verified;
        this.createdAt = user.created_at;
    }

    static fromArray(users) {
        return users.map(user => new UserResponseDTO(user));
    }
}

module.exports = UserResponseDTO;
