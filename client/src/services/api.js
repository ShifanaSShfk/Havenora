// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Handle request body
    if (options.body) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json'
      };
    }

    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // =============================================================================
  // AUTHENTICATION METHODS
  // =============================================================================

  // Register a new user
  async register(userData) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      // Store token and user data
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      // Store token and user data
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        await this.request('/auth/logout', {
          method: 'POST'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        return null;
      }

      const response = await this.request('/auth/me');
      return response.user;
    } catch (error) {
      console.error('Get current user error:', error);
      // Clear invalid token
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Get stored user data
  getStoredUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  // =============================================================================
  // VALIDATION METHODS
  // =============================================================================

  // Password validation
  static validatePassword(password) {
    const minLength = 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    
    if (!hasNumber) {
      return 'Password must contain at least one number';
    }
    
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    
    return null; // Password is valid
  }

  // Email validation
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // =============================================================================
  // USER METHODS
  // =============================================================================

  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(userData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // =============================================================================
  // PROPERTY METHODS
  // =============================================================================

  async getProperties(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/properties${queryParams ? `?${queryParams}` : ''}`);
  }

  async getProperty(id) {
    return this.request(`/properties/${id}`);
  }

  async createProperty(propertyData) {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData)
    });
  }

  async updateProperty(id, propertyData) {
    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData)
    });
  }

  async deleteProperty(id) {
    return this.request(`/properties/${id}`, {
      method: 'DELETE'
    });
  }

  // =============================================================================
  // CONTACT/INQUIRY METHODS
  // =============================================================================

  async submitContactInquiry(inquiryData) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(inquiryData)
    });
  }

  async getUserInquiries(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/contact/my-inquiries${queryParams ? `?${queryParams}` : ''}`);
  }

  async getAgentInquiries(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/contact/agent-inquiries${queryParams ? `?${queryParams}` : ''}`);
  }

  async updateInquiryStatus(id, status, response = '') {
    return this.request(`/contact/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, response })
    });
  }

  async getInquiryDetails(id) {
    return this.request(`/contact/${id}`);
  }

  async deleteInquiry(id) {
    return this.request(`/contact/${id}`, {
      method: 'DELETE'
    });
  }

  // =============================================================================
  // FAVORITES METHODS
  // =============================================================================

  async getFavorites() {
    return this.request('/favorites');
  }

  async addToFavorites(propertyId) {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ propertyId })
    });
  }

  async removeFromFavorites(propertyId) {
    return this.request(`/favorites/${propertyId}`, {
      method: 'DELETE'
    });
  }

  // =============================================================================
  // FILE UPLOAD METHOD
  // =============================================================================

  async uploadImages(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const token = localStorage.getItem('authToken');
    
    return fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    }).then(response => {
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return response.json();
    });
  }
}

export default new ApiService();