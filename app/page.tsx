import ProductBuilder from '@/components/ProductBuilder';
import { demoProduct, encodeProduct } from '@/lib/product';

export default function Home() {
  const demoUrl = `/p/demo?data=${encodeProduct(demoProduct)}`;

  return <ProductBuilder demoUrl={demoUrl} />;
}
