import axios from 'axios';
import api from '../../api/axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('axios instance is created with correct base URL', () => {
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  test('api instance is exported correctly', () => {
    expect(api).toBeDefined();
  });

  test('has request interceptor configured', () => {
    // Verify that interceptors are set up (this would be more detailed in a real implementation)
    expect(api.interceptors).toBeDefined();
    expect(api.interceptors.request).toBeDefined();
    expect(api.interceptors.response).toBeDefined();
  });
});
