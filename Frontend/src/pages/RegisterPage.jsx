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

const RegisterPage = () => {
    const navigate = useNavigate();
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

        const result = await authService.register({
            name: data.name,
            email: data.email,
            password: data.password,
        });

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
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
                        <h1>Check Your Email</h1>
                        <p className="text-muted">
                            We've sent a verification link to your email address.
                            Please verify your email to continue.
                        </p>
                    </div>
                    <Button onClick={() => navigate('/login')} fullWidth>
                        Go to Login
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <Card className="auth-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p className="text-muted">Start your journey with Storely</p>
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
                        Create Account
                    </Button>

                    <div style={{ textAlign: 'center', margin: '20px 0', position: 'relative' }}>
                        <span style={{ backgroundColor: 'white', padding: '0 10px' }}>OR</span>
                    </div>

                    <GoogleAuthButton role="customer" />

                    <p className="auth-footer">
                        Already have an account?{' '}
                        <Link to="/login" className="link">
                            Sign in
                        </Link>
                    </p>
                </form>
            </Card>
        </div>
    );
};

export default RegisterPage;
