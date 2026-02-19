import { useState } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import { useStorePath } from '../hooks/useStorePath';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';
import './Auth.css';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const CustomerLoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const storePath = useStorePath();
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

        const result = await authService.loginCustomer(data.email, data.password);

        if (result.success) {
            setAuth(result.data.user, result.data.token);

            // Redirect to intended page or home
            const from = location.state?.from?.pathname || `${storePath}/` || '/';
            // Important: Don't go back to register if that's where we came from
            const isAuthRoute = from.includes('/register') || from.includes('/login');
            const safePath = isAuthRoute ? (storePath || '/') : from;
            navigate(safePath, { replace: true });
        } else {
            setError(result.error);
        }

        setIsLoading(false);
    };

    return (
        <div className="auth-container">
            <Card className="auth-card">
                <div className="auth-header">
                    <h1>Customer Login</h1>
                    <p className="text-muted">Sign in to your account to shop and track orders</p>
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

                    <Button type="submit" fullWidth loading={isLoading}>
                        Sign In
                    </Button>

                    <p className="auth-footer">
                        New here?{' '}
                        <Link to={`${storePath}/register`} className="link">
                            Create a shopper account
                        </Link>
                    </p>
                </form>
            </Card>
        </div>
    );
};

export default CustomerLoginPage;
