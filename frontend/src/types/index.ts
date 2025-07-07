// User types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Listing types
export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  platform: 'facebook' | 'craigslist' | 'offerup';
  status: 'draft' | 'active' | 'sold' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  price: number;
  images: File[];
  platform: 'facebook' | 'craigslist' | 'offerup';
}

export interface UpdateListingRequest {
  title?: string;
  description?: string;
  price?: number;
  images?: File[];
  status?: 'draft' | 'active' | 'sold' | 'expired';
}

// Message types
export interface Message {
  id: string;
  listing_id: string;
  buyer_name: string;
  content: string;
  message_type: 'question' | 'offer' | 'appointment' | 'general';
  platform: 'facebook' | 'craigslist' | 'offerup';
  is_read: boolean;
  created_at: string;
}

export interface MessageClassification {
  type: 'question' | 'offer' | 'appointment' | 'general';
  confidence: number;
  suggested_reply?: string;
  urgency: 'low' | 'medium' | 'high';
}

// Reply types
export interface Reply {
  id: string;
  message_id: string;
  content: string;
  status: 'draft' | 'approved' | 'sent';
  ai_generated: boolean;
  delay_minutes: number;
  created_at: string;
  sent_at?: string;
}

export interface GenerateReplyRequest {
  message_id: string;
  use_ai: boolean;
  custom_prompt?: string;
}

// Appointment types
export interface Appointment {
  id: string;
  listing_id: string;
  buyer_name: string;
  buyer_phone?: string;
  proposed_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  created_at: string;
  confirmed_at?: string;
}

export interface CreateAppointmentRequest {
  listing_id: string;
  buyer_name: string;
  buyer_phone?: string;
  proposed_time: string;
  notes?: string;
}

// Sale types
export interface Sale {
  id: string;
  listing_id: string;
  buyer_name: string;
  final_price: number;
  sale_date: string;
  notes?: string;
  created_at: string;
}

export interface CreateSaleRequest {
  listing_id: string;
  buyer_name: string;
  final_price: number;
  sale_date: string;
  notes?: string;
}

// Analytics types
export interface SalesAnalytics {
  total_sales: number;
  total_revenue: number;
  average_price: number;
  conversion_rate: number;
  sales_by_month: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
}

export interface MessageAnalytics {
  total_messages: number;
  response_rate: number;
  average_response_time: number;
  messages_by_type: Array<{
    type: string;
    count: number;
  }>;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'appointment' | 'sale' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Platform configuration types
export interface PlatformConfig {
  platform: 'facebook' | 'craigslist' | 'offerup';
  is_connected: boolean;
  username?: string;
  last_sync?: string;
  session_valid: boolean;
}

// Settings types
export interface UserSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  ai_replies: {
    enabled: boolean;
    min_delay: number;
    max_delay: number;
    auto_approve: boolean;
  };
  message_monitoring: {
    enabled: boolean;
    poll_interval: number;
  };
} 