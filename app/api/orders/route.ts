import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { OrderInput } from '@/lib/db.types';

export async function POST(request: NextRequest) {
  try {
    const body: OrderInput = await request.json();
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        product_id: body.product_id,
        product_name: body.product_name,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        quantity: body.quantity,
        price: body.price,
        currency: body.currency,
        total: body.total,
        note: body.note || '',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data }, { status: 201 });
  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured.' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (err) {
    console.error('Order fetch error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
