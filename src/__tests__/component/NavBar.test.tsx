import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavBar from '../../component/NavBar';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NavBar', () => {
  test('renders navigation links', () => {
    renderWithRouter(<NavBar />);
    
    expect(screen.getByText('Table')).toBeInTheDocument();
    expect(screen.getByText('Form')).toBeInTheDocument();
  });

  test('links have correct href attributes', () => {
    renderWithRouter(<NavBar />);
    
    const tableLink = screen.getByText('Table').closest('a');
    const formLink = screen.getByText('Form').closest('a');
    
    expect(tableLink).toHaveAttribute('href', '/health-declaration');
    expect(formLink).toHaveAttribute('href', '/health-declaration-form');
  });

  test('applies correct styling', () => {
    renderWithRouter(<NavBar />);
    
    const navContainer = screen.getByText('Table').closest('div');
    expect(navContainer).toHaveClass('flex', 'justify-center', 'bg-[#212529]');
  });

  test('navigation links are accessible', () => {
    renderWithRouter(<NavBar />);
    
    const tableLink = screen.getByRole('link', { name: 'Table' });
    const formLink = screen.getByRole('link', { name: 'Form' });
    
    expect(tableLink).toBeInTheDocument();
    expect(formLink).toBeInTheDocument();
  });
});
