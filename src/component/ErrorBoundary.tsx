import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { toastError } from '../utils/toast';

interface ApiError {
  success: boolean;
  message: string;
  errors?: string[];
}

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  apiError?: ApiError;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    if (error.message && error.message.includes('"success":false')) {
      try {
        const apiError = JSON.parse(error.message) as ApiError;
        return { hasError: true, error, apiError };
      } catch {
        // If parsing fails, treat as regular error
        return { hasError: true, error };
      }
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Handle API validation errors differently
    if (this.state.apiError) {
      const { apiError } = this.state;
      
      // Show main error message
      toastError(apiError.message);
      
      // Show individual validation errors
      if (apiError.errors && apiError.errors.length > 0) {
        apiError.errors.forEach(errorMsg => {
          toastError(errorMsg);
        });
      }
    } else {
      // Show generic error toast for other errors
      toastError('An unexpected error occurred. Please try again.');
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, apiError: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // If it's an API validation error, show a more user-friendly message
      if (this.state.apiError) {
        return (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="50vh"
            p={3}
          >
            <Paper elevation={3} sx={{ p: 4, maxWidth: 600 }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {this.state.apiError.message}
                </Typography>
                {this.state.apiError.errors && this.state.apiError.errors.length > 0 && (
                  <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                    {this.state.apiError.errors.map((error, index) => (
                      <Typography component="li" key={index} variant="body2">
                        {error}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Alert>
              
              <Box mt={2}>
                <Button 
                  variant="contained" 
                  onClick={this.handleReset}
                  sx={{ mr: 2 }}
                >
                  Try Again
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </Box>
            </Paper>
          </Box>
        );
      }

      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="50vh"
          p={3}
        >
          <Paper elevation={3} sx={{ p: 4, maxWidth: 600 }}>
            <Typography variant="h4" color="error" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </Typography>
            
            {process.env.NODE_ENV === 'development' && (
              <Box mt={3} p={2} bgcolor="grey.100" borderRadius={1}>
                <Typography variant="h6" gutterBottom>
                  Error Details (Development Only):
                </Typography>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {this.state.error?.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Box>
            )}
            
            <Box mt={3}>
              <Button 
                variant="contained" 
                onClick={this.handleReset}
                sx={{ mr: 2 }}
              >
                Try Again
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
