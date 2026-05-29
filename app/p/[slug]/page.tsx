import { generateSalesKit } from '@/lib/generator';

export default function ProductPage({ params }: { params: { slug: string } }) {
  // Demo fetch product based on slug
  const product = { name: "LaunchCart MVP", description: "Công cụ bán hàng", price: "99000", id: "1" };
  const html = generateSalesKit(product);

  return (
    <div className="p-8" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
