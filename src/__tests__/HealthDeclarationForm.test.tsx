import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HealthDeclarationForm from '../pages/HealthDeclarationForm';
import { ToastContainer } from 'react-toastify';
import '@testing-library/jest-dom';
jest.mock('../api/axios');

describe(HealthDeclarationForm, () => {
  it('renders all fields and submits with valid data', async () => {
    render(
      <>
        <HealthDeclarationForm />
        <ToastContainer />
      </>
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/temperature/i), { target: { value: '36.6' } });
    fireEvent.click(screen.getByLabelText(/Cough/i));
    fireEvent.click(screen.getByLabelText(/Fever/i));
    fireEvent.click(screen.getByLabelText(/^Yes$/i));
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('');
    });
  });

  it('shows validation errors if required fields are missing', async () => {
    render(<HealthDeclarationForm />);
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Temperature is required/i)).toBeInTheDocument();
    });
  });
  it('shows validation errors if required fields are missing', async () => {
    render(
      <>
        <HealthDeclarationForm />
        <ToastContainer />
      </>
    );

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      const nameError = screen.getByText((content, node) => {
        return node?.tagName.toLowerCase() === 'p' && /name is required/i.test(content);
      });
      const tempError = screen.getByText((content, node) => {
        return node?.tagName.toLowerCase() === 'p' && /temperature is required/i.test(content);
      });
      expect(nameError).toBeInTheDocument();
      expect(tempError).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
