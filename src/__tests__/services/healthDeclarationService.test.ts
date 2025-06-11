import { HealthDeclarationService } from '../../services/healthDeclarationService';
import api from '../../api/axios';
import { handleApiError } from '../../utils/errorHandler';
import type HealthDeclarationInput from '../../interface/health-declaration.interface';

jest.mock('../../api/axios');
const mockedApi = api as jest.Mocked<typeof api>;

jest.mock('../../utils/errorHandler');
const mockedHandleApiError = handleApiError as jest.MockedFunction<typeof handleApiError>;

describe('HealthDeclarationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHealthDeclarations', () => {
    test('successfully fetches health declarations', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Health declarations retrieved successfully',
          data: [
            {
              _id: '1',
              name: 'John Doe',
              temperature: 36.5,
              symptoms: ['Cough'],
              contactWithInfected: false,
              createdAt: new Date('2023-01-01'),
              updatedAt: new Date('2023-01-01'),
            }
          ]
        }
      };

      mockedApi.get.mockResolvedValueOnce(mockResponse);

      const result = await HealthDeclarationService.getHealthDeclarations();

      expect(mockedApi.get).toHaveBeenCalledWith('/health-declaration');
      expect(result).toEqual(mockResponse.data);
    });

    test('handles API error and rethrows', async () => {
      const mockError = new Error('Network Error');
      mockedApi.get.mockRejectedValueOnce(mockError);

      await expect(HealthDeclarationService.getHealthDeclarations())
        .rejects.toThrow('Network Error');

      expect(mockedHandleApiError).toHaveBeenCalledWith(
        mockError,
        'Failed to fetch health declarations'
      );
    });
  });

  describe('createHealthDeclaration', () => {
    const mockInput: HealthDeclarationInput = {
      name: 'Jane Smith',
      temperature: 37.2,
      symptoms: ['Fever', 'Headaches'],
      contactWithInfected: true,
    };

    test('successfully creates health declaration', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Health declaration created successfully',
          data: {
            _id: '2',
            ...mockInput,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01'),
          }
        }
      };

      mockedApi.post.mockResolvedValueOnce(mockResponse);

      const result = await HealthDeclarationService.createHealthDeclaration(mockInput);

      expect(mockedApi.post).toHaveBeenCalledWith('/health-declaration', mockInput);
      expect(result).toEqual(mockResponse.data);
    });

    test('handles validation error and rethrows', async () => {
      const mockError = {
        response: {
          data: {
            success: false,
            message: 'Validation failed',
            errors: ['Name is required']
          }
        }
      };

      mockedApi.post.mockRejectedValueOnce(mockError);

      await expect(HealthDeclarationService.createHealthDeclaration(mockInput))
        .rejects.toEqual(mockError);

      expect(mockedHandleApiError).toHaveBeenCalledWith(
        mockError,
        'Failed to create health declaration'
      );
    });

    test('handles network error and rethrows', async () => {
      const mockError = new Error('Network Error');
      mockedApi.post.mockRejectedValueOnce(mockError);

      await expect(HealthDeclarationService.createHealthDeclaration(mockInput))
        .rejects.toThrow('Network Error');

      expect(mockedHandleApiError).toHaveBeenCalledWith(
        mockError,
        'Failed to create health declaration'
      );
    });

    test('validates input data structure', async () => {
      const invalidInput = {
        name: '',
        temperature: 'invalid',
        symptoms: 'not-an-array',
        contactWithInfected: 'not-boolean',
      } as unknown as HealthDeclarationInput;

      const mockResponse = {
        data: {
          success: true,
          message: 'Health declaration created successfully',
          data: invalidInput
        }
      };

      mockedApi.post.mockResolvedValueOnce(mockResponse);

      await HealthDeclarationService.createHealthDeclaration(invalidInput);

      expect(mockedApi.post).toHaveBeenCalledWith('/health-declaration', invalidInput);
    });
  });

  describe('integration scenarios', () => {
    test('handles empty symptoms array', async () => {
      const inputWithEmptySymptoms: HealthDeclarationInput = {
        name: 'Healthy User',
        temperature: 36.1,
        symptoms: [],
        contactWithInfected: false,
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'Health declaration created successfully',
          data: {
            _id: '3',
            ...inputWithEmptySymptoms,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        }
      };

      mockedApi.post.mockResolvedValueOnce(mockResponse);

      const result = await HealthDeclarationService.createHealthDeclaration(inputWithEmptySymptoms);

      expect(result.data.symptoms).toEqual([]);
      expect(mockedApi.post).toHaveBeenCalledWith('/health-declaration', inputWithEmptySymptoms);
    });

    test('handles multiple symptoms', async () => {
      const inputWithMultipleSymptoms: HealthDeclarationInput = {
        name: 'Sick User',
        temperature: 38.5,
        symptoms: ['Fever', 'Cough', 'Headaches', 'Fatigue', 'Body aches'],
        contactWithInfected: true,
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'Health declaration created successfully',
          data: {
            _id: '4',
            ...inputWithMultipleSymptoms,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        }
      };

      mockedApi.post.mockResolvedValueOnce(mockResponse);

      const result = await HealthDeclarationService.createHealthDeclaration(inputWithMultipleSymptoms);

      expect(result.data.symptoms).toHaveLength(5);
      expect(result.data.symptoms).toContain('Fever');
      expect(result.data.symptoms).toContain('Body aches');
    });

    test('handles concurrent API calls', async () => {
      const mockGetResponse = {
        data: {
          success: true,
          message: 'Success',
          data: []
        }
      };

      const mockPostResponse = {
        data: {
          success: true,
          message: 'Created',
          data: {
            _id: '5',
            name: 'Test User',
            temperature: 36.5,
            symptoms: [],
            contactWithInfected: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        }
      };

      mockedApi.get.mockResolvedValueOnce(mockGetResponse);
      mockedApi.post.mockResolvedValueOnce(mockPostResponse);

      const [getResult, postResult] = await Promise.all([
        HealthDeclarationService.getHealthDeclarations(),
        HealthDeclarationService.createHealthDeclaration({
          name: 'Test User',
          temperature: 36.5,
          symptoms: [],
          contactWithInfected: false,
        })
      ]);

      expect(getResult).toEqual(mockGetResponse.data);
      expect(postResult).toEqual(mockPostResponse.data);
      expect(mockedApi.get).toHaveBeenCalledTimes(1);
      expect(mockedApi.post).toHaveBeenCalledTimes(1);
    });
  });
});
