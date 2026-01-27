/**
 * RegisterRequestDTO
 */
class RegisterRequestDTO {
    constructor(data) {
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role;
    }

    static fromRequest(body) {
        return new RegisterRequestDTO({
            name: body.name,
            email: body.email,
            password: body.password,
            role: body.role
        });
    }
}

module.exports = RegisterRequestDTO;
