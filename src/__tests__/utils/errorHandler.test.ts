import { handleApiError } from '../../utils/errorHandler';
import { toastError } from '../../utils/toast';

// Mock toast functions
jest.mock('../../utils/toast', () => ({
  toastError: jest.fn(),
}));

const mockedToastError = toastError as jest.MockedFunction<typeof toastError>;

describe('Error Handler Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles API response with error message', () => {
    const mockError = {
      response: {
        data: {
          success: false,
          message: 'Validation failed',
          errors: ['Name is required', 'Temperature must be a number']
        }
      }
    };

    handleApiError(mockError, 'Default error message');

    expect(mockedToastError).toHaveBeenCalledWith('Validation failed');
  });

  test('handles API response with field-specific errors', () => {
    const mockError = {
      response: {
        data: {
          success: false,
          message: 'Validation failed',
          errors: [
            { field: 'name', message: 'Name is required' },
            { field: 'temperature', message: 'Temperature must be valid' }
          ]
        }
      }
    };

    handleApiError(mockError, 'Default error message');

    expect(mockedToastError).toHaveBeenCalledWith('Validation failed');
  });

  test('handles API response with only success false', () => {
    const mockError = {
      response: {
        data: {
          success: false
        }
      }
    };

    handleApiError(mockError, 'Default error message');

    expect(mockedToastError).toHaveBeenCalledWith('Default error message');
  });

  test('handles network error without response', () => {
    const mockError = new Error('Network Error');

    handleApiError(mockError, 'Default error message');

    expect(mockedToastError).toHaveBeenCalledWith('Default error message');
  });

  test('handles error with response but no data', () => {
    const mockError = {
      response: {}
    };

    handleApiError(mockError, 'Default error message');

    expect(mockedToastError).toHaveBeenCalledWith('Default error message');
  });

  test('handles axios timeout error', () => {
    const mockError = {
      code: 'ECONNABORTED',
      message: 'timeout of 10000ms exceeded'
    };

    handleApiError(mockError, 'Default error message');

    expect(mockedToastError).toHaveBeenCalledWith('Default error message');
  });

  test('handles 404 error', () => {
    const mockError = {
      response: {
        status: 404,
        data: {
          success: false,
          message: 'Not found'
        }
      }
    };

    handleApiError(mockError, 'Default error message');

    expect(mockedToastError).toHaveBeenCalledWith('Not found');
  });

  test('handles 500 server error', () => {
    const mockError = {
      response: {
        status: 500,
        data: {
          success: false,
          message: 'Internal server error'
        }
      }
    };

    handleApiError(mockError, 'Default error message');

    expect(mockedToastError).toHaveBeenCalledWith('Internal server error');
  });

  test('handles empty error object', () => {
    handleApiError({}, 'Default error message');

    expect(mockedToastError).toHaveBeenCalledWith('Default error message');
  });

  test('handles null error', () => {
    handleApiError(null, 'Default error message');

    expect(mockedToastError).toHaveBeenCalledWith('Default error message');
  });

  test('handles undefined error', () => {
    handleApiError(undefined, 'Default error message');

    expect(mockedToastError).toHaveBeenCalledWith('Default error message');
  });
});
