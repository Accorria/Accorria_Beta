const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://plazoria-backend-691352445702.us-central1.run.app';

export const api = {
  async get(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    return response.json();
  },

  async post(endpoint: string, data?: any, options?: RequestInit) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return response.json();
  },

  async postFormData(endpoint: string, formData: FormData, options?: RequestInit) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...options?.headers,
      },
      body: formData,
      ...options,
    });
    return response.json();
  },

  async put(endpoint: string, data?: any, options?: RequestInit) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return response.json();
  },

  async delete(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    return response.json();
  },
}; 