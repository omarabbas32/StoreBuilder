import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import GoogleAuthButton from '../components/common/GoogleAuthButton';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';
import './Auth.css';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');

        const result = await authService.login(data.email, data.password);

        if (result.success) {
            setAuth(result.data.user, result.data.token);

            // Redirect based on role
            if (result.data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.error);
        }

        setIsLoading(false);
    };

    return (
        <div className="auth-container">
            <Card className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p className="text-muted">Sign in to your Storely account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                    {error && (
                        <div className="alert alert-error" role="alert">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Email"
                        type="email"
                        {...register('email')}
                        error={errors.email?.message}
                        fullWidth
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        {...register('password')}
                        error={errors.password?.message}
                        fullWidth
                        required
                    />

                    <div className="auth-links">
                        <Link to="/forgot-password" className="link">
                            Forgot password?
                        </Link>
                    </div>

                    <Button type="submit" fullWidth loading={isLoading}>
                        Sign In
                    </Button>

                    <div className="demo-login-divider">
                        <span>OR</span>
                    </div>

                    <GoogleAuthButton role="customer" className="mb-3" />

                    <div className="demo-login-section">
                        <Button
                            type="button"
                            variant="outline"
                            fullWidth
                            onClick={() => {
                                // You might want to adjust these credentials or use a specific demo account
                                onSubmit({ email: 'customer@example.com', password: 'password123' });
                            }}
                            disabled={isLoading}
                        >
                            Log in as Demo Customer
                        </Button>
                        <p className="demo-tip">Perfect for reviewers to see the storefront immediately.</p>
                    </div>

                    <p className="auth-footer">
                        Don't have an account?{' '}
                        <Link to="/register" className="link">
                            Sign up
                        </Link>
                    </p>
                </form>
            </Card>
        </div>
    );
};

export default LoginPage;
