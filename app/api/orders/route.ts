import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { product_id, customer_name, phone, quantity } = await request.json();

    const { data, error } = await supabase
      .from('orders')
      .insert([{ 
        product_id, 
        customer_name, 
        phone, 
        quantity 
      }]);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
