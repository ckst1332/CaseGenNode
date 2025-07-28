/**
 * Standardized API Client
 * Consolidates best practices from both React Router and Next.js implementations
 */

const API_BASE_URL = '/api';

/**
 * Enhanced request function with comprehensive error handling
 * @param {string} path - API endpoint path
 * @param {Object} options - Request options
 * @returns {Promise} - Response data
 */
async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error ${response.status}: ${text || response.statusText}`);
    }
    
    if (response.status === 204) return null;
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Standardized API client with all endpoints
 */
export const apiClient = {
  request,
  
  // LLM Integration
  integrations: {
    Core: {
      InvokeLLM: (payload) => request('/integrations/invoke-llm', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
      SendEmail: (payload) => request('/integrations/send-email', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
      UploadFile: (payload) => request('/integrations/upload-file', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
      GenerateImage: (payload) => request('/integrations/generate-image', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
      ExtractDataFromUploadedFile: (payload) => request('/integrations/extract-data', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    }
  },
  
  // Case Management
  entities: {
    Case: {
      list: (order) => request(`/cases?order=${encodeURIComponent(order || '')}`),
      create: (data) => request('/cases', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
      get: (id) => request(`/cases/${id}`),
      update: (id, data) => request(`/cases/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
      delete: (id) => request(`/cases/${id}`, {
        method: 'DELETE'
      })
    }
  },
  
  // User Management
  auth: {
    me: () => request('/users/me'),
    updateMyUserData: (data) => request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }
};

/**
 * Entity-specific exports for backward compatibility
 */
export const Case = apiClient.entities.Case;
export const User = apiClient.auth;
export const InvokeLLM = apiClient.integrations.Core.InvokeLLM;

/**
 * API error types for better error handling
 */
export class APIError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.response = response;
  }
}

/**
 * Retry wrapper for API calls
 * @param {Function} apiCall - API function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise} - API response
 */
export const withRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Don't retry for client errors (4xx)
      if (error.message.includes('400') || error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
}; 