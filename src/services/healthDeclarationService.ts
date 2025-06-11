import api from '../api/axios';
import type HealthDeclarationInput from '../interface/health-declaration.interface';
import { handleApiError } from '../utils/errorHandler';

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: string[] | { field: string; message: string }[];
}

export interface HealthDeclarationResponse {
  success: boolean;
  message: string;
  data: HealthDeclarationInput[];
}

export interface CreateHealthDeclarationResponse {
  success: boolean;
  message: string;
  data: HealthDeclarationInput;
}

export class HealthDeclarationService {
  static async getHealthDeclarations(): Promise<HealthDeclarationResponse> {
    try {
      const response = await api.get<HealthDeclarationResponse>('/health-declaration');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch health declarations');
      throw error;
    }
  }

  static async createHealthDeclaration(data: HealthDeclarationInput): Promise<CreateHealthDeclarationResponse> {
    try {
      const formattedData = {
        ...data,
        temperature: parseFloat(data.temperature.toString())
      };
      const response = await api.post<CreateHealthDeclarationResponse>('/health-declaration', formattedData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create health declaration');
      throw error;
    }
  }
}

export default HealthDeclarationService;
