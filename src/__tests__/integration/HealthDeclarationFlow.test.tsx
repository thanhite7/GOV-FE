import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';
import api from '../../api/axios';
import type HealthDeclarationInput from '../../interface/health-declaration.interface';

jest.mock('../../api/axios');
const mockedApi = api as jest.Mocked<typeof api>;

jest.mock('../../utils/toast', () => ({
  toastSuccess: jest.fn(),
  toastError: jest.fn(),
  toastInfo: jest.fn(),
  toastWarning: jest.fn(),
}));

jest.mock('../../utils/errorHandler', () => ({
  handleApiError: jest.fn(),
}));

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('Health Declaration Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedApi.get.mockResolvedValue({
      data: {
        success: true,
        message: 'Success',
        data: []
      }
    });
    mockedApi.post.mockResolvedValue({
      data: {
        success: true,
        message: 'Created successfully',
        data: {
          _id: '123',
          name: 'Test User',
          temperature: 36.5,
          symptoms: [],
          contactWithInfected: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }
    });
  });

  test('complete user flow: navigate, submit form, view table', async () => {
    const user = userEvent.setup();
    renderApp();

    if (!screen.queryByText('Form')) {
      const formLink = screen.getByText('Form');
      await user.click(formLink);
    }

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/temperature/i), '36.5');
    await user.click(screen.getByLabelText('Cough'));
    await user.click(screen.getByLabelText('No'));

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/health-declaration', {
        name: 'John Doe',
        temperature: 36.5,
        symptoms: ['Cough'],
        contactWithInfected: false,
      });
    });

    const tableLink = screen.getByText('Table');
    await user.click(tableLink);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/health-declaration');
    });
  });

  test('handles form validation errors properly', async () => {
    const user = userEvent.setup();
    renderApp();

    const formLink = screen.getByText('Form');
    await user.click(formLink);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    
    mockedApi.post.mockRejectedValueOnce(new Error('Server Error'));
    
    renderApp();

    const formLink = screen.getByText('Form');
    await user.click(formLink);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/temperature/i), '36.5');
    await user.click(screen.getByLabelText('No'));
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalled();
    });
  });

  test('navigation between pages works correctly', async () => {
    const user = userEvent.setup();
    renderApp();

    const formLink = screen.getByText('Form');
    await user.click(formLink);
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();

    const tableLink = screen.getByText('Table');
    await user.click(tableLink);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Temperature')).toBeInTheDocument();
  });

  test('form resets after successful submission', async () => {
    const user = userEvent.setup();
    renderApp();

    const formLink = screen.getByText('Form');
    await user.click(formLink);

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    const temperatureInput = screen.getByLabelText(/temperature/i) as HTMLInputElement;

    await user.type(nameInput, 'John Doe');
    await user.type(temperatureInput, '36.5');
    await user.click(screen.getByLabelText('No'));

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(temperatureInput.value).toBe('');
    });
  });

  test('table displays data correctly after API call', async () => {
    const mockData = [
      {
        _id: '1',
        name: 'John Doe',
        temperature: 36.5,
        symptoms: ['Cough'],
        contactWithInfected: false,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      }
    ];

    mockedApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Success',
        data: mockData
      }
    });

    renderApp();

    const tableLink = screen.getByText('Table');
    await user.click(tableLink);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('36.5°C')).toBeInTheDocument();
      expect(screen.getByText('Cough')).toBeInTheDocument();
    });
  });

  test('handles multiple symptoms selection correctly', async () => {
    const user = userEvent.setup();
    renderApp();

    const formLink = screen.getByText('Form');
    await user.click(formLink);

    await user.type(screen.getByLabelText(/full name/i), 'Jane Smith');
    await user.type(screen.getByLabelText(/temperature/i), '37.2');

    await user.click(screen.getByLabelText('Cough'));
    await user.click(screen.getByLabelText('Fever'));
    await user.click(screen.getByLabelText('Headaches'));
    await user.click(screen.getByLabelText('Yes'));

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/health-declaration', {
        name: 'Jane Smith',
        temperature: 37.2,
        symptoms: ['Cough', 'Fever', 'Headaches'],
        contactWithInfected: true,
      });
    });
  });
});
