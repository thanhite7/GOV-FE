import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HealthDeclarationForm from '../../pages/HealthDeclarationForm';
import api from '../../api/axios';

jest.mock('../../api/axios');
const mockedApi = api as jest.Mocked<typeof api>;

jest.mock('../../utils/toast', () => ({
  toastSuccess: jest.fn(),
  toastError: jest.fn(),
}));

jest.mock('../../utils/errorHandler', () => ({
  handleApiError: jest.fn(),
}));

describe('HealthDeclarationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form with all required fields', () => {
    render(<HealthDeclarationForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();
    expect(screen.getByText(/symptoms/i)).toBeInTheDocument();
    expect(screen.getByText(/have you been in contact/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('displays all symptom options', () => {
    render(<HealthDeclarationForm />);

    const symptomOptions = [
      'Cough',
      'Smell/taste impairment',
      'Fever',
      'Breathing difficulties',
      'Body aches',
      'Headaches',
      'Fatigue',
      'Sore throat',
      'Diarrhea',
      'Runny nose',
    ];

    symptomOptions.forEach(symptom => {
      expect(screen.getByText(symptom)).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockedApi.post.mockResolvedValueOnce({ data: { success: true } });

    render(<HealthDeclarationForm />);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/temperature/i), '36.5');
    
    await user.click(screen.getByLabelText('Cough'));
    await user.click(screen.getByLabelText('Fever'));
    
    await user.click(screen.getByLabelText('Yes'));

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/health-declaration', {
        name: 'John Doe',
        temperature: 36.5,
        symptoms: ['Cough', 'Fever'],
        contactWithInfected: true,
      });
    });
  });

  test('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    render(<HealthDeclarationForm />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/temperature is required/i)).toBeInTheDocument();
    });
  });

  test('validates temperature range', async () => {
    const user = userEvent.setup();
    render(<HealthDeclarationForm />);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/temperature/i), '50');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/temperature must be between/i)).toBeInTheDocument();
    });
  });

  test('handles API error during submission', async () => {
    const user = userEvent.setup();
    const mockError = new Error('API Error');
    mockedApi.post.mockRejectedValueOnce(mockError);

    render(<HealthDeclarationForm />);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/temperature/i), '36.5');
    await user.click(screen.getByLabelText('No'));

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalled();
    });
  });

  test('resets form after successful submission', async () => {
    const user = userEvent.setup();
    mockedApi.post.mockResolvedValueOnce({ data: { success: true } });

    render(<HealthDeclarationForm />);

    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
    const temperatureInput = screen.getByLabelText(/temperature/i) as HTMLInputElement;

    await user.type(nameInput, 'John Doe');
    await user.type(temperatureInput, '36.5');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(temperatureInput.value).toBe('');
    });
  });

  test('allows multiple symptom selection', async () => {
    const user = userEvent.setup();
    render(<HealthDeclarationForm />);

    await user.click(screen.getByLabelText('Cough'));
    await user.click(screen.getByLabelText('Fever'));
    await user.click(screen.getByLabelText('Headaches'));

    const coughCheckbox = screen.getByLabelText('Cough') as HTMLInputElement;
    const feverCheckbox = screen.getByLabelText('Fever') as HTMLInputElement;
    const headacheCheckbox = screen.getByLabelText('Headaches') as HTMLInputElement;

    expect(coughCheckbox.checked).toBe(true);
    expect(feverCheckbox.checked).toBe(true);
    expect(headacheCheckbox.checked).toBe(true);
  });

  test('contact with infected radio buttons work correctly', async () => {
    const user = userEvent.setup();
    render(<HealthDeclarationForm />);

    const yesRadio = screen.getByLabelText('Yes') as HTMLInputElement;
    const noRadio = screen.getByLabelText('No') as HTMLInputElement;

    expect(yesRadio.checked).toBe(false);
    expect(noRadio.checked).toBe(false);

    await user.click(yesRadio);
    expect(yesRadio.checked).toBe(true);
    expect(noRadio.checked).toBe(false);

    await user.click(noRadio);
    expect(yesRadio.checked).toBe(false);
    expect(noRadio.checked).toBe(true);
  });
});
