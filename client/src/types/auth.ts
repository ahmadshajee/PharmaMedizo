export interface Pharmacist {
  _id: string;
  name: string;
  email: string;
  pharmacyName: string;
  licenseNumber: string;
  phone?: string;
  address?: string;
  role: 'pharmacist';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  pharmacyName: string;
  licenseNumber: string;
  phone?: string;
  address?: string;
}

export interface AuthState {
  pharmacist: Pharmacist | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
