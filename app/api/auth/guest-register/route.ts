// app/api/auth/guest-register/route.ts
import { NextRequest } from 'next/server';
import { getCustomerByEmail, createCustomer, updateCustomerToken } from '@/lib/db';
import { generateToken, successResponse, errorResponse } from '@/lib/auth-helpers';
import { handleCorsOptions } from '@/lib/cors';

// ── OPTIONS (CORS preflight) ──────────────
export async function OPTIONS() {
  return handleCorsOptions();
}

// ── POST /api/auth/guest-register ─────────
export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Parse body
    const body = await request.json();
    const { email, name } = body;

    // 2️⃣ Validate email
    if (!email || typeof email !== 'string') {
      return errorResponse('Email is required', 400);
    }

    const cleanEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return errorResponse('Invalid email format', 400);
    }

    // 3️⃣ Check existing customer
    let customer = await getCustomerByEmail(cleanEmail);
    let isNewCustomer = false;

    if (!customer) {
      isNewCustomer = true;

      // 4️⃣ Create in our DB only (Option C — no Shopify)
      customer = await createCustomer({
        email: cleanEmail,
        name: name?.trim() || undefined,
        isGuest: true,
      });
    }

    // 5️⃣ Generate JWT
    const token = await generateToken({
      customerId: customer.id,
      email: customer.email,
      isGuest: customer.is_guest,
      shopifyCustomerId: customer.shopify_customer_id || undefined,
    });

    // 6️⃣ Save token in DB
    await updateCustomerToken(customer.id, token);

    // 7️⃣ Return success
    return successResponse({
      customerId: customer.id,
      email: customer.email,
      token,
      isGuest: customer.is_guest,
      isNewCustomer,
      message: isNewCustomer ? 'Account created!' : 'Welcome back!',
    });

  } catch (error) {
    console.error('❌ Guest register error:', error);
    return errorResponse('Registration failed', 500);
  }
}