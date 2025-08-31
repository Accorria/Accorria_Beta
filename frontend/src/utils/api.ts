import { supabase } from './supabase';

/**
 * Make an authenticated API call with Supabase JWT token
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };
    
    // Add authorization header if user is authenticated
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    
    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    return response;
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
}

/**
 * Make an authenticated API call and return JSON
 */
export async function authenticatedFetchJson<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await authenticatedFetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call failed: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

/**
 * Post form data with authentication
 */
export async function postFormData(
  url: string, 
  formData: FormData
): Promise<any> {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Prepare headers
    const headers: Record<string, string> = {};
    
    // Add authorization header if user is authenticated
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    
    // Make the request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Post form data error:', error);
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Get current user info
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Export api object for backward compatibility
export const api = {
  authenticatedFetch,
  authenticatedFetchJson,
  postFormData,
  isAuthenticated,
  getCurrentUser,
  supabase,
  // HTTP method shortcuts
  get: (url: string) => authenticatedFetchJson(url, { method: 'GET' }),
  post: (url: string, data?: any) => authenticatedFetchJson(url, { 
    method: 'POST', 
    body: data ? JSON.stringify(data) : undefined 
  }),
  put: (url: string, data?: any) => authenticatedFetchJson(url, { 
    method: 'PUT', 
    body: data ? JSON.stringify(data) : undefined 
  }),
  delete: (url: string) => authenticatedFetchJson(url, { method: 'DELETE' })
}; 