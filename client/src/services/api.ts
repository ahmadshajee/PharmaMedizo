import axios from 'axios';
import { LoginCredentials, RegisterData, Pharmacist } from '../types/auth';
import { ValidationResponse, DispenseRequest, DispensingStats, Prescription } from '../types/prescription';

// Base API URL
const API_URL = window.location.hostname === 'localhost'
  ? '/api'  // Development - uses proxy
  : 'https://pharmamedizo-api.onrender.com/api';  // Production - update with actual URL

console.log('PharmaMedizo API Base URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pharma_token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth service functions
export const login = async (credentials: LoginCredentials): Promise<{ pharmacist: Pharmacist; token: string }> => {
  const response = await api.post<{ pharmacist: Pharmacist; token: string }>('/auth/login', credentials);
  return response.data;
};

export const googleAuth = async (credential: string): Promise<{ pharmacist: Pharmacist; token: string; isNewUser?: boolean; requiresProfileCompletion?: boolean }> => {
  const response = await api.post<{ pharmacist: Pharmacist; token: string; isNewUser?: boolean; requiresProfileCompletion?: boolean }>('/auth/google', { credential });
  return response.data;
};

export const register = async (data: RegisterData): Promise<{ pharmacist: Pharmacist; token: string }> => {
  const response = await api.post<{ pharmacist: Pharmacist; token: string }>('/auth/register', data);
  return response.data;
};

export const getCurrentPharmacist = async (): Promise<Pharmacist> => {
  const response = await api.get<{ pharmacist: Pharmacist }>('/auth/me');
  return response.data.pharmacist;
};

export const updateProfile = async (data: Partial<Pharmacist>): Promise<Pharmacist> => {
  const response = await api.put<{ pharmacist: Pharmacist }>('/auth/profile', data);
  return response.data.pharmacist;
};

// Prescription service functions
export const validatePrescription = async (prescriptionId: string): Promise<ValidationResponse> => {
  const response = await api.get<ValidationResponse>(`/prescriptions/validate/${prescriptionId}`);
  return response.data;
};

export const dispensePrescription = async (prescriptionId: string, data: DispenseRequest): Promise<{ message: string; prescription: Prescription }> => {
  const response = await api.post(`/prescriptions/dispense/${prescriptionId}`, data);
  return response.data;
};

export const getDispensingHistory = async (page: number = 1, limit: number = 20, status?: string): Promise<{ prescriptions: Prescription[]; pagination: any }> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.append('status', status);
  const response = await api.get(`/prescriptions/history?${params.toString()}`);
  return response.data;
};

export const getDispensingStats = async (): Promise<DispensingStats> => {
  const response = await api.get<DispensingStats>('/prescriptions/stats');
  return response.data;
};

export default api;
