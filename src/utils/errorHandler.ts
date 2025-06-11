import { toastError } from './toast';
import type { ApiErrorResponse } from '../services/healthDeclarationService';

export const handleApiError = (error: unknown, defaultMessage = 'An unexpected error occurred') => {
  console.error('API Error:', error);
  
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { 
      response: { 
        data: ApiErrorResponse;
        status?: number;
      } 
    };
    
    const errorData = axiosError.response?.data;
    
    if (errorData?.errors) {
      if (Array.isArray(errorData.errors)) {
        errorData.errors.forEach((err) => {
          if (typeof err === 'string') {
            toastError(err);
          } else if (typeof err === 'object' && err.field && err.message) {
            toastError(`${err.field}: ${err.message}`);
          }
        });
        return;
      }
    }
    
    if (errorData?.message) {
      toastError(errorData.message);
      return;
    }
    
    if (axiosError.response?.status) {
      switch (axiosError.response.status) {
        case 400:
          toastError('Invalid request. Please check your input.');
          return;
        case 401:
          toastError('Unauthorized. Please login again.');
          return;
        case 403:
          toastError('Access denied.');
          return;
        case 404:
          toastError('Resource not found.');
          return;
        case 500:
          toastError('Server error. Please try again later.');
          return;
        default:
          toastError(defaultMessage);
          return;
      }
    }
  }
  
  toastError(defaultMessage);
};

export default handleApiError;
