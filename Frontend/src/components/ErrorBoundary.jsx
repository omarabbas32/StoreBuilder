import React from 'react';
import Button from './ui/Button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: '#fff5f5',
                    borderRadius: '8px',
                    border: '1px solid #feb2b2',
                    margin: '1rem'
                }}>
                    <h2 style={{ color: '#e53e3e', marginBottom: '1rem' }}>
                        Oops! Something went wrong
                    </h2>
                    <p style={{ color: '#c53030', marginBottom: '1.5rem' }}>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <Button onClick={this.resetError} variant="primary">
                        Try Again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
