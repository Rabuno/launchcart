import { getSupabase, isSupabaseEnabled } from './supabase';
import { Order, OrderInput } from './db.types';

const STORAGE_KEY = 'launchcart_orders';

interface LocalOrder {
  name: string;
  phone: string;
  quantity: number;
  note: string;
  productId: string;
  productName: string;
  total: number;
  createdAt: string;
}

export async function createOrder(input: {
  productId: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  price: number;
  currency: string;
  total: number;
  note: string;
}): Promise<{ success: boolean; order?: Order; error?: string }> {
  const supabase = getSupabase();

  if (supabase && isSupabaseEnabled()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          product_id: input.productId,
          product_name: input.productName,
          customer_name: input.customerName,
          customer_phone: input.customerPhone,
          quantity: input.quantity,
          price: input.price,
          currency: input.currency,
          total: input.total,
          note: input.note || '',
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, order: data as Order };
    } catch (err) {
      console.error('Supabase order creation failed, falling back to localStorage:', err);
    }
  }

  // Fallback: localStorage
  const order: LocalOrder = {
    name: input.customerName,
    phone: input.customerPhone,
    quantity: input.quantity,
    note: input.note,
    productId: input.productId,
    productName: input.productName,
    total: input.total,
    createdAt: new Date().toISOString(),
  };

  try {
    const previous = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...previous].slice(0, 20)));
  } catch {
    // localStorage not available (SSR)
  }

  return { success: true };
}

export async function getOrders(productId?: string): Promise<Order[]> {
  const supabase = getSupabase();

  if (supabase && isSupabaseEnabled()) {
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Order[];
    } catch (err) {
      console.error('Supabase order fetch failed:', err);
    }
  }

  return [];
}

export function getLocalOrders(): LocalOrder[] {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export async function syncLocalOrdersToSupabase(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseEnabled()) return 0;

  const localOrders = getLocalOrders();
  if (localOrders.length === 0) return 0;

  let synced = 0;
  for (const order of localOrders) {
    try {
      const { error } = await supabase.from('orders').insert({
        product_id: order.productId,
        product_name: order.productName,
        customer_name: order.name,
        customer_phone: order.phone,
        quantity: order.quantity,
        price: Math.round(order.total / order.quantity),
        currency: 'VND',
        total: order.total,
        note: order.note || '',
        status: 'pending',
        created_at: order.createdAt,
      });
      if (!error) synced++;
    } catch {
      // skip failed orders
    }
  }

  if (synced > 0) {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return synced;
}
