import ProductLanding from '@/components/ProductLanding';
import { decodeProduct, demoProduct } from '@/lib/product';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ data?: string }>;
};

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const product = query?.data ? decodeProduct(query.data) : { ...demoProduct, slug };

  return <ProductLanding product={product} />;
}
