const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://quickflip-ai-backend-w6jnqqf33q-uc.a.run.app';

// Debug logging
console.log('API_BASE_URL:', API_BASE_URL);

export const api = {
  async get(endpoint: string, options?: RequestInit) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  async post(endpoint: string, data?: any, options?: RequestInit) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  async postFormData(endpoint: string, formData: FormData, options?: RequestInit) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...options?.headers,
        },
        body: formData,
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API POST FormData Error:', error);
      throw error;
    }
  },

  async put(endpoint: string, data?: any, options?: RequestInit) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  async delete(endpoint: string, options?: RequestInit) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },
}; 