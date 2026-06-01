'use client';

import { useMemo, useState } from 'react';
import { encodeProduct, formatPrice, LaunchCartProduct, normalizeProduct, slugify } from '@/lib/product';

type Props = {
  demoUrl: string;
};

export default function ProductBuilder({ demoUrl }: Props) {
  const [product, setProduct] = useState<LaunchCartProduct>(() =>
    normalizeProduct({
      name: 'Khóa học AI Automation cho Freelancer',
      tagline: 'Biến quy trình làm việc lặp lại thành hệ thống tự động trong 7 ngày.',
      description:
        'Bộ template, checklist và video hướng dẫn giúp freelancer dùng AI để tìm khách, viết proposal và quản lý delivery hiệu quả hơn.',
      price: 499000,
      sellerName: 'Rabuno Studio',
      guarantee: 'Bảo hành cập nhật nội dung 30 ngày sau khi mua.',
      highlights: [
        '12 workflow AI thực chiến',
        'Template proposal và delivery tracker',
        'Checklist setup agent tự động',
        'Phù hợp freelancer mới bắt đầu',
      ],
    }),
  );

  const salesUrl = useMemo(() => {
    const encoded = encodeProduct({ ...product, slug: slugify(product.name) });
    return `/p/${slugify(product.name)}?data=${encoded}`;
  }, [product]);

  const update = (field: keyof LaunchCartProduct, value: string | number | string[]) => {
    setProduct((current) => normalizeProduct({ ...current, [field]: value }));
  };

  return (
    <main className="app-shell">
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">LaunchCart MVP</p>
          <h1>Tạo link bán hàng đẹp, nhanh, đủ để test thị trường.</h1>
          <p className="hero-text">
            LaunchCart giúp Boss dựng một trang sản phẩm có CTA và form đặt hàng mà không cần backend phức tạp ở giai đoạn MVP.
          </p>
          <div className="hero-actions">
            <a className="button primary" href={salesUrl}>Xem trang vừa tạo</a>
            <a className="button secondary" href={demoUrl}>Xem demo</a>
          </div>
        </div>

        <div className="card builder-card">
          <h2>Nhập thông tin sản phẩm</h2>
          <label>
            Tên sản phẩm
            <input value={product.name} onChange={(event) => update('name', event.target.value)} />
          </label>
          <label>
            Tagline
            <input value={product.tagline} onChange={(event) => update('tagline', event.target.value)} />
          </label>
          <label>
            Mô tả
            <textarea value={product.description} onChange={(event) => update('description', event.target.value)} rows={4} />
          </label>
          <div className="form-row">
            <label>
              Giá
              <input type="number" value={product.price} onChange={(event) => update('price', Number(event.target.value))} />
            </label>
            <label>
              Người bán
              <input value={product.sellerName} onChange={(event) => update('sellerName', event.target.value)} />
            </label>
          </div>
          <label>
            Lợi ích chính, mỗi dòng một ý
            <textarea
              value={product.highlights.join('\n')}
              onChange={(event) => update('highlights', event.target.value.split('\n'))}
              rows={4}
            />
          </label>
          <label>
            Cam kết
            <input value={product.guarantee} onChange={(event) => update('guarantee', event.target.value)} />
          </label>
        </div>
      </section>

      <section className="preview-section">
        <div>
          <p className="eyebrow">Preview</p>
          <h2>{product.name}</h2>
          <p>{product.tagline}</p>
        </div>
        <div className="price-pill">{formatPrice(product.price, product.currency)}</div>
        <ul className="feature-list">
          {product.highlights.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <div className="share-box">
          <span>Link bán hàng:</span>
          <code>{salesUrl}</code>
        </div>
      </section>
    </main>
  );
}
