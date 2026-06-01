'use client';

import { FormEvent, useState } from 'react';
import { formatPrice, LaunchCartProduct } from '@/lib/product';
import { createOrder } from '@/lib/orders';

type Order = {
  name: string;
  phone: string;
  quantity: number;
  note: string;
};

export default function ProductLanding({ product }: { product: LaunchCartProduct }) {
  const [order, setOrder] = useState<Order>({ name: '', phone: '', quantity: 1, note: '' });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = product.price * order.quantity;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createOrder({
        productId: product.id,
        productName: product.name,
        customerName: order.name,
        customerPhone: order.phone,
        quantity: order.quantity,
        price: product.price,
        currency: product.currency,
        total,
        note: order.note,
      });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Đặt hàng thất bại, vui lòng thử lại.');
      }
    } catch {
      setError('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="sales-page">
      <section className="sales-hero">
        <div className="sales-copy">
          <p className="eyebrow">{product.sellerName}</p>
          <h1>{product.name}</h1>
          <p className="hero-text">{product.tagline}</p>
          <p className="description">{product.description}</p>
          <div className="price-line">
            <span>{formatPrice(product.price, product.currency)}</span>
            <small>Thanh toán sau khi người bán xác nhận</small>
          </div>
          <a className="button primary" href="#order-form">Đặt hàng ngay</a>
        </div>
        <div className="product-visual" aria-label="Product preview">
          <div className="mock-card">
            <span>LaunchCart</span>
            <strong>{product.name}</strong>
            <small>{product.tagline}</small>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="card">
          <h2>Vì sao nên mua?</h2>
          <ul className="feature-list large">
            {product.highlights.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>

        <div className="card order-card" id="order-form">
          <h2>Thông tin đặt hàng</h2>
          {success ? (
            <div className="success-box">
              <h3>Đặt hàng thành công</h3>
              <p>Đơn hàng đã được ghi nhận. Người bán sẽ liên hệ xác nhận.</p>
              <a className="button secondary" href="/">Tạo sản phẩm khác</a>
            </div>
          ) : (
            <form onSubmit={submit} className="order-form">
              <label>
                Họ tên
                <input required value={order.name} onChange={(event) => setOrder({ ...order, name: event.target.value })} />
              </label>
              <label>
                Số điện thoại
                <input required value={order.phone} onChange={(event) => setOrder({ ...order, phone: event.target.value })} />
              </label>
              <label>
                Số lượng
                <input
                  min={1}
                  type="number"
                  value={order.quantity}
                  onChange={(event) => setOrder({ ...order, quantity: Math.max(1, Number(event.target.value)) })}
                />
              </label>
              <label>
                Ghi chú
                <textarea value={order.note} onChange={(event) => setOrder({ ...order, note: event.target.value })} rows={3} />
              </label>
              <div className="total-row">
                <span>Tạm tính</span>
                <strong>{formatPrice(total, product.currency)}</strong>
              </div>
              {error && <p className="error-text">{error}</p>}
              <button className="button primary full" type="submit" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi đơn'}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="guarantee-band">
        <strong>Cam kết:</strong> {product.guarantee}
      </section>
    </main>
  );
}
