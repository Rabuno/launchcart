'use client';

import { useState } from 'react';
import { apiUrl } from '@/lib/api';

export default function OrderForm({ productId }: { productId: string }) {
  const [formData, setFormData] = useState({ name: '', phone: '', quantity: 1 });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          customer_name: formData.name,
          phone: formData.phone,
          quantity: formData.quantity,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Create order failed');
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi đặt hàng!');
    } finally {
      setLoading(false);
    }
  };

  if (success) return <p className="text-green-600 font-bold">Đặt hàng thành công!</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Họ tên:</label>
        <input className="border p-2 w-full" type="text" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
      </div>
      <div>
        <label>SĐT:</label>
        <input className="border p-2 w-full" type="tel" required onChange={(e) => setFormData({...formData, phone: e.target.value})} />
      </div>
      <div>
        <label>Số lượng:</label>
        <input className="border p-2 w-full" type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})} />
      </div>
      <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 w-full rounded">
        {loading ? 'Đang xử lý...' : 'Đặt hàng'}
      </button>
    </form>
  );
}
