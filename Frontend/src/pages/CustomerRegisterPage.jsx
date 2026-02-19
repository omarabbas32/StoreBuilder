import { useState } from 'react';
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom';
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

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

const CustomerRegisterPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const storePath = useStorePath();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');

        const result = await authService.registerCustomer({
            name: data.name,
            email: data.email,
            password: data.password,
        });

        if (result.success) {
            setAuth(result.data.user, result.data.token);
            // Redirect immediately since they are now logged in
            const from = location.state?.from?.pathname || `${storePath}/` || '/';
            const isAuthRoute = from.includes('/register') || from.includes('/login');
            const safePath = isAuthRoute ? (storePath || '/') : from;
            navigate(safePath, { replace: true });
        } else {
            setError(result.error);
        }

        setIsLoading(false);
    };

    if (success) {
        return (
            <div className="auth-container">
                <Card className="auth-card">
                    <div className="auth-header">
                        <h1>Account Created!</h1>
                        <p className="text-muted">
                            Your shopper account has been created successfully.
                            Redirecting you to login...
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <Card className="auth-card">
                <div className="auth-header">
                    <h1>Create Shopper Account</h1>
                    <p className="text-muted">One account for all your favorite stores</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                    {error && (
                        <div className="alert alert-error" role="alert">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Full Name"
                        {...register('name')}
                        error={errors.name?.message}
                        fullWidth
                        required
                    />

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
                        helperText="Minimum 8 characters"
                        fullWidth
                        required
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        {...register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                        fullWidth
                        required
                    />

                    <Button type="submit" fullWidth loading={isLoading}>
                        Sign Up
                    </Button>

                    <p className="auth-footer">
                        Already have an account?{' '}
                        <Link to={`${storePath}/login`} className="link">
                            Sign in
                        </Link>
                    </p>
                </form>
            </Card>
        </div>
    );
};

export default CustomerRegisterPage;
