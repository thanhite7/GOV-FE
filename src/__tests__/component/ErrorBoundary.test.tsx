import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../../component/ErrorBoundary';
import React from 'react';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

const ThrowApiError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    const error = new Error('{"success":false,"message":"Validation failed","errors":["Name is required"]}');
    throw error;
  }
  return <div>No error</div>;
};

jest.mock('../../utils/toast', () => ({
  toastError: jest.fn(),
}));

describe('ErrorBoundary', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  test('renders error UI when child component throws error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred. Please try again later.')).toBeInTheDocument();
  });

  test('displays custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  test('handles API validation errors correctly', () => {
    render(
      <ErrorBoundary>
        <ThrowApiError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Validation Error')).toBeInTheDocument();
    expect(screen.getByText('Validation failed')).toBeInTheDocument();
    expect(screen.getByText('• Name is required')).toBeInTheDocument();
  });

  test('try again button resets error state', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  test('reload page button is present', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText('Reload Page');
    expect(reloadButton).toBeInTheDocument();
  });

  test('handles non-JSON error messages', () => {
    const NonJsonError = () => {
      throw new Error('Regular error message');
    };

    render(
      <ErrorBoundary>
        <NonJsonError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred. Please try again later.')).toBeInTheDocument();
  });
});
