'use client';

import { useState } from 'react';
import { apiUrl } from '@/lib/api';

export default function ProductForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const description = formData.get('description') as string;

    try {
      const response = await fetch(apiUrl('/api/products'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price, description }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Create product failed');
      console.log('Product created:', result.data);
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi tạo sản phẩm!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 max-w-md mx-auto">
      <input name="name" placeholder="Product Name" className="p-2 border" required />
      <input name="price" placeholder="Price" type="number" className="p-2 border" required />
      <textarea name="description" placeholder="Description" className="p-2 border" required />
      <button disabled={loading} className="bg-blue-500 text-white p-2">
        {loading ? 'Creating...' : 'Create Sales Kit'}
      </button>
    </form>
  );
}
