/**
 * LoginRequestDTO
 */
class LoginRequestDTO {
    constructor(data) {
        this.email = data.email;
        this.password = data.password;
    }

    static fromRequest(body) {
        return new LoginRequestDTO({
            email: body.email,
            password: body.password
        });
    }
}

module.exports = LoginRequestDTO;
