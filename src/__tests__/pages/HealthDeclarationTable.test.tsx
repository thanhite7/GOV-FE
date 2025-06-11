import { render, screen, waitFor } from '@testing-library/react';
import HealthDeclarationTable from '../../pages/HealthDeclarationTable';
import api from '../../api/axios';
import type HealthDeclaration from '../../interface/health-declaration.interface';

jest.mock('../../api/axios');
const mockedApi = api as jest.Mocked<typeof api>;

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('HealthDeclarationTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockHealthDeclarations: HealthDeclaration[] = [
    {
      _id: '1',
      name: 'John Doe',
      temperature: 36.5,
      symptoms: ['Cough', 'Fever'],
      contactWithInfected: false,
      createdAt: new Date('2023-01-01T10:00:00Z'),
      updatedAt: new Date('2023-01-01T10:00:00Z'),
    },
    {
      _id: '2',
      name: 'Jane Smith',
      temperature: 37.2,
      symptoms: ['Headaches'],
      contactWithInfected: true,
      createdAt: new Date('2023-01-02T11:30:00Z'),
      updatedAt: new Date('2023-01-02T11:30:00Z'),
    },
    {
      _id: '3',
      name: 'Bob Johnson',
      temperature: 36.8,
      symptoms: [],
      contactWithInfected: false,
      createdAt: new Date('2023-01-03T09:15:00Z'),
      updatedAt: new Date('2023-01-03T09:15:00Z'),
    },
  ];

  test('renders table headers correctly', () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { data: [] }
    });

    render(<HealthDeclarationTable />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('Symptoms')).toBeInTheDocument();
    expect(screen.getByText('Contact with F0')).toBeInTheDocument();
    expect(screen.getByText('Created At')).toBeInTheDocument();
  });

  test('displays health declaration data correctly', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { data: mockHealthDeclarations }
    });

    render(<HealthDeclarationTable />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('36.5°C')).toBeInTheDocument();
      expect(screen.getByText('Cough, Fever')).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('37.2°C')).toBeInTheDocument();
      expect(screen.getByText('Headaches')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByText('36.8°C')).toBeInTheDocument();
      expect(screen.getByText('None')).toBeInTheDocument();
    });
  });

  test('handles empty symptoms array', async () => {
    const dataWithEmptySymptoms = [
      {
        _id: '1',
        name: 'Test User',
        temperature: 36.5,
        symptoms: [],
        contactWithInfected: false,
        createdAt: new Date('2023-01-01T10:00:00Z'),
        updatedAt: new Date('2023-01-01T10:00:00Z'),
      }
    ];

    mockedApi.get.mockResolvedValueOnce({
      data: { data: dataWithEmptySymptoms }
    });

    render(<HealthDeclarationTable />);

    await waitFor(() => {
      expect(screen.getByText('None')).toBeInTheDocument();
    });
  });

  test('formats date correctly', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { data: mockHealthDeclarations }
    });

    render(<HealthDeclarationTable />);

    await waitFor(() => {
      // Check if date is formatted (the exact format may vary based on locale)
      expect(screen.getByText(/2023/)).toBeInTheDocument();
    });
  });

  test('displays contact with infected status correctly', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { data: mockHealthDeclarations }
    });

    render(<HealthDeclarationTable />);

    await waitFor(() => {
      const yesElements = screen.getAllByText('Yes');
      const noElements = screen.getAllByText('No');
      
      expect(yesElements).toHaveLength(1); // Jane Smith
      expect(noElements).toHaveLength(2); // John Doe and Bob Johnson
    });
  });

  test('handles API error gracefully', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('Network Error'));

    render(<HealthDeclarationTable />);

    // The component should render without crashing
    expect(screen.getByText('Name')).toBeInTheDocument();
    
    // Wait a bit to ensure the error is handled
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  test('makes API call on component mount', () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { data: [] }
    });

    render(<HealthDeclarationTable />);

    expect(mockedApi.get).toHaveBeenCalledWith('/health-declaration');
    expect(mockedApi.get).toHaveBeenCalledTimes(1);
  });

  test('renders empty table when no data is available', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { data: [] }
    });

    render(<HealthDeclarationTable />);

    await waitFor(() => {
      // Headers should be present
      expect(screen.getByText('Name')).toBeInTheDocument();
      
      // But no data rows
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  test('displays multiple symptoms correctly', async () => {
    const dataWithMultipleSymptoms = [
      {
        _id: '1',
        name: 'Test User',
        temperature: 37.5,
        symptoms: ['Cough', 'Fever', 'Headaches', 'Fatigue'],
        contactWithInfected: true,
        createdAt: new Date('2023-01-01T10:00:00Z'),
        updatedAt: new Date('2023-01-01T10:00:00Z'),
      }
    ];

    mockedApi.get.mockResolvedValueOnce({
      data: { data: dataWithMultipleSymptoms }
    });

    render(<HealthDeclarationTable />);

    await waitFor(() => {
      expect(screen.getByText('Cough, Fever, Headaches, Fatigue')).toBeInTheDocument();
    });
  });
});
