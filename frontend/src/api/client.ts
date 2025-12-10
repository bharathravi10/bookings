import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
  CancelTokenSource,
} from 'axios';
import Cookies from 'js-cookie';

// Use proxy in development, or full URL in production
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.VITE_API_URL || 'http://localhost:3001/api'
    : '/api'; // Use proxy in development

class ApiClient {
  private client: AxiosInstance;
  private cancelTokenSources: Map<string, CancelTokenSource> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor: Add JWT token from cookies
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - clear cookies
          Cookies.remove('auth_token');
          Cookies.remove('auth_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create a cancel token for a request
   * Use this to cancel previous requests (e.g., on search input change)
   */
  createCancelToken(key: string): CancelTokenSource {
    // Cancel previous request with same key
    const previous = this.cancelTokenSources.get(key);
    if (previous) {
      previous.cancel('Request cancelled');
    }

    // Create new cancel token
    const source = axios.CancelToken.source();
    this.cancelTokenSources.set(key, source);
    return source;
  }

  /**
   * Cancel a specific request by key
   */
  cancelRequest(key: string): void {
    const source = this.cancelTokenSources.get(key);
    if (source) {
      source.cancel('Request cancelled');
      this.cancelTokenSources.delete(key);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.cancelTokenSources.forEach((source) => {
      source.cancel('All requests cancelled');
    });
    this.cancelTokenSources.clear();
  }

  get instance(): AxiosInstance {
    return this.client;
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ token: string; user: { id: string; email: string; name?: string } }> {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(email: string, password: string, name?: string): Promise<{ token: string; user: { id: string; email: string; name?: string } }> {
    const response = await this.client.post('/auth/register', { email, password, name });
    return response.data;
  }
}

export const apiClient = new ApiClient();
