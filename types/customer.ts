export interface Customer {
  id: number;
  email: string;
  name: string | null;
  shopify_customer_id: string | null;
  is_guest: boolean;
  token: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerInput {
  email: string;
  name?: string;
  shopifyCustomerId?: string;
  isGuest?: boolean;
  token?: string;
}

export interface GuestRegisterInput {
  email: string;
  name?: string;
}

export interface CustomerSession {
  customerId: number;
  email: string;
  isGuest: boolean;
  shopifyCustomerId?: string;
}

export interface AuthResponse {
  success: boolean;
  customerId: number;
  email: string;
  token: string;
  isGuest: boolean;
  isNewCustomer: boolean;
  message?: string;
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  verified_email: boolean;
  created_at: string;
  updated_at: string;
  orders_count: number;
  state: string;
  tags: string;
}

export interface ShopifyCustomerCreateInput {
  customer: {
    first_name?: string;
    last_name?: string;
    email: string;
    verified_email: boolean;
    send_email_welcome: boolean;
    tags?: string;
  };
}