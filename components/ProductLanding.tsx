'use client';

import { FormEvent, useState } from 'react';
import { formatPrice, LaunchCartProduct } from '@/lib/product';

type Order = {
  name: string;
  phone: string;
  quantity: number;
  note: string;
};

export default function ProductLanding({ product }: { product: LaunchCartProduct }) {
  const [order, setOrder] = useState<Order>({ name: '', phone: '', quantity: 1, note: '' });
  const [success, setSuccess] = useState(false);

  const total = product.price * order.quantity;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const savedOrder = {
      ...order,
      productId: product.id,
      productName: product.name,
      total,
      createdAt: new Date().toISOString(),
    };

    const previous = JSON.parse(window.localStorage.getItem('launchcart_orders') || '[]');
    window.localStorage.setItem('launchcart_orders', JSON.stringify([savedOrder, ...previous].slice(0, 20)));
    setSuccess(true);
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
              <p>Đơn demo đã được lưu trên trình duyệt. Người bán có thể nối Supabase/CRM ở bước production.</p>
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
              <button className="button primary full" type="submit">Gửi đơn</button>
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
