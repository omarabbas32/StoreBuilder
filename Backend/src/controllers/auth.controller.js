const { asyncHandler } = require('../middleware/errorHandler');
const RegisterRequestDTO = require('../dtos/user/RegisterRequest.dto');
const LoginRequestDTO = require('../dtos/user/LoginRequest.dto');
const UserResponseDTO = require('../dtos/user/UserResponse.dto');

class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    register = asyncHandler(async (req, res) => {
        const dto = RegisterRequestDTO.fromRequest(req.validatedData);
        const { user, token } = await this.authService.register(dto);
        res.status(201).json({
            success: true,
            data: { user: new UserResponseDTO(user), token }
        });
    });

    login = asyncHandler(async (req, res) => {
        const dto = LoginRequestDTO.fromRequest(req.validatedData);
        const { user, token } = await this.authService.login(dto.email, dto.password);
        res.status(200).json({
            success: true,
            data: { user: new UserResponseDTO(user), token }
        });
    });

    verifyEmail = asyncHandler(async (req, res) => {
        await this.authService.verifyEmail(req.query.token);
        res.status(200).json({ success: true, message: 'Email verified successfully' });
    });

    forgotPassword = asyncHandler(async (req, res) => {
        await this.authService.forgotPassword(req.body.email);
        res.status(200).json({ success: true, message: 'If an account exists, a reset email has been sent' });
    });

    resetPassword = asyncHandler(async (req, res) => {
        await this.authService.resetPassword(req.validatedData.token, req.validatedData.newPassword);
        res.status(200).json({ success: true, message: 'Password reset successfully' });
    });
}

module.exports = AuthController;
