import { redirect } from 'next/navigation';
import { demoProduct, encodeProduct } from '@/lib/product';

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  await params;
  redirect(`/p/demo?data=${encodeProduct(demoProduct)}#order-form`);
}
