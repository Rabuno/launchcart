export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  quantity: number;
  price: number;
  currency: string;
  total: number;
  note: string;
  status: OrderStatus;
  created_at: string;
}

export interface OrderInput {
  product_id: string;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  quantity: number;
  price: number;
  currency: string;
  total: number;
  note?: string;
}

export const Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: '',
          product_id: '',
          product_name: '',
          customer_name: '',
          customer_phone: '',
          quantity: 0,
          price: 0,
          currency: 'VND',
          total: 0,
          note: '',
          status: 'pending' as OrderStatus,
          created_at: '',
        },
        Insert: {
          id: '',
          product_id: '',
          product_name: '',
          customer_name: '',
          customer_phone: '',
          quantity: 0,
          price: 0,
          currency: 'VND',
          total: 0,
          note: '',
          status: 'pending' as OrderStatus,
          created_at: '',
        },
      },
    },
  },
};
