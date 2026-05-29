import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProductForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const description = formData.get('description') as string;

    // Supabase logic here
    const { data, error } = await supabase
      .from('products')
      .insert([{ name, price, description, slug: name.toLowerCase().replace(/ /g, '-') }])
      .select();

    if (error) console.error(error);
    else console.log('Product created:', data);
    
    setLoading(false);
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
