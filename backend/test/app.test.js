import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';

import { createApp } from '../src/app.js';

const createFakeSupabase = () => {
  const inserts = [];

  return {
    inserts,
    from(table) {
      const query = {
        insert(rows) {
          inserts.push({ table, rows });
          return query;
        },
        select() {
          return query;
        },
        single() {
          const inserted = inserts.at(-1)?.rows?.[0] ?? null;
          return Promise.resolve({ data: inserted ? { id: 123, ...inserted } : null, error: null });
        },
        eq() {
          return query;
        },
      };

      return query;
    },
  };
};

describe('LaunchCart backend app', () => {
  it('GET /health returns ok', async () => {
    const app = createApp({ supabase: null });

    const response = await request(app).get('/health').expect(200);

    assert.deepEqual(response.body, { ok: true, service: 'launchcart-backend' });
  });

  it('returns 503 on database routes when Supabase is missing', async () => {
    const app = createApp({ supabase: null });

    const response = await request(app)
      .post('/api/products')
      .send({ name: 'Test Product', price: '19.99', description: 'A product' })
      .expect(503);

    assert.deepEqual(response.body, { error: 'Supabase is not configured' });
  });

  it('POST /api/products validates required input with 400', async () => {
    const app = createApp({ supabase: createFakeSupabase() });

    const response = await request(app)
      .post('/api/products')
      .send({ name: '', price: '', description: '' })
      .expect(400);

    assert.equal(response.body.error, 'Invalid request body');
    assert.ok(response.body.details);
  });

  it('POST /api/products inserts a slugified product and returns 201', async () => {
    const supabase = createFakeSupabase();
    const app = createApp({ supabase });

    const response = await request(app)
      .post('/api/products')
      .send({ name: 'My Great Product!', price: '29.99', description: 'Works well' })
      .expect(201);

    assert.equal(supabase.inserts.length, 1);
    assert.deepEqual(supabase.inserts[0], {
      table: 'products',
      rows: [{ name: 'My Great Product!', price: '29.99', description: 'Works well', slug: 'my-great-product' }],
    });
    assert.deepEqual(response.body, {
      data: { id: 123, name: 'My Great Product!', price: '29.99', description: 'Works well', slug: 'my-great-product' },
    });
  });

  it('POST /api/orders coerces quantity and returns success', async () => {
    const supabase = createFakeSupabase();
    const app = createApp({ supabase });

    const response = await request(app)
      .post('/api/orders')
      .send({ product_id: 'product-1', customer_name: 'Jane Doe', phone: '+15551234567', quantity: '3' })
      .expect(201);

    assert.deepEqual(supabase.inserts[0], {
      table: 'orders',
      rows: [{ product_id: 'product-1', customer_name: 'Jane Doe', phone: '+15551234567', quantity: 3 }],
    });
    assert.equal(response.body.success, true);
    assert.deepEqual(response.body.data, {
      id: 123,
      product_id: 'product-1',
      customer_name: 'Jane Doe',
      phone: '+15551234567',
      quantity: 3,
    });
  });
});
