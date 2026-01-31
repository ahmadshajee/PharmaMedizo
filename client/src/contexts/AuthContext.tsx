import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, Pharmacist, LoginCredentials, RegisterData } from '../types/auth';
import * as api from '../services/api';

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { pharmacist: Pharmacist; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_PHARMACIST'; payload: Pharmacist };

// Initial state
const initialState: AuthState = {
  pharmacist: null,
  token: localStorage.getItem('pharma_token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        pharmacist: action.payload.pharmacist,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        pharmacist: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        pharmacist: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_PHARMACIST':
      return { ...state, pharmacist: action.payload };
    default:
      return state;
  }
};

// Context
interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updatePharmacist: (pharmacist: Pharmacist) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('pharma_token');
      const storedPharmacist = localStorage.getItem('pharma_user');

      if (token && storedPharmacist) {
        try {
          const pharmacist = await api.getCurrentPharmacist();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { pharmacist, token },
          });
        } catch (error) {
          localStorage.removeItem('pharma_token');
          localStorage.removeItem('pharma_user');
          dispatch({ type: 'LOGIN_FAILURE', payload: 'Session expired' });
        }
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: '' });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { pharmacist, token } = await api.login(credentials);
      localStorage.setItem('pharma_token', token);
      localStorage.setItem('pharma_user', JSON.stringify(pharmacist));
      dispatch({ type: 'LOGIN_SUCCESS', payload: { pharmacist, token } });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      throw error;
    }
  };

  const googleLogin = async (credential: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { pharmacist, token } = await api.googleAuth(credential);
      localStorage.setItem('pharma_token', token);
      localStorage.setItem('pharma_user', JSON.stringify(pharmacist));
      dispatch({ type: 'LOGIN_SUCCESS', payload: { pharmacist, token } });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Google login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { pharmacist, token } = await api.register(data);
      localStorage.setItem('pharma_token', token);
      localStorage.setItem('pharma_user', JSON.stringify(pharmacist));
      dispatch({ type: 'LOGIN_SUCCESS', payload: { pharmacist, token } });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('pharma_token');
    localStorage.removeItem('pharma_user');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updatePharmacist = (pharmacist: Pharmacist) => {
    localStorage.setItem('pharma_user', JSON.stringify(pharmacist));
    dispatch({ type: 'UPDATE_PHARMACIST', payload: pharmacist });
  };

  return (
    <AuthContext.Provider value={{ authState, login, googleLogin, register, logout, clearError, updatePharmacist }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
