import express from 'express';
import cors from 'cors';
import { z } from 'zod';

const asyncHandler = (handler) => async (req, res, next) => {
  try { await handler(req, res, next); } catch (error) { next(error); }
};

const productSchema = z.object({
  name: z.string().min(1),
  price: z.union([z.string().min(1), z.number()]),
  description: z.string().min(1),
  slug: z.string().min(1).optional(),
});

const orderSchema = z.object({
  product_id: z.union([z.string().min(1), z.number()]),
  customer_name: z.string().min(1),
  phone: z.string().min(1),
  quantity: z.coerce.number().int().positive().default(1),
});

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const createApp = ({ supabase = null, corsOrigin = '*' } = {}) => {
  const app = express();

  app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((s) => s.trim()) }));
  app.use(express.json());

  const requireSupabase = (res) => {
    if (!supabase) {
      res.status(503).json({ error: 'Supabase is not configured' });
      return false;
    }
    return true;
  };

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'launchcart-backend' });
  });

  app.post('/api/products', asyncHandler(async (req, res) => {
    if (!requireSupabase(res)) return;
    const input = productSchema.parse(req.body);
    const slug = input.slug || slugify(input.name);
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...input, slug }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ data });
  }));

  app.get('/api/products/:slug', asyncHandler(async (req, res) => {
    if (!requireSupabase(res)) return;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', req.params.slug)
      .single();

    if (error) return res.status(404).json({ error: error.message });
    res.json({ data });
  }));

  app.post('/api/orders', asyncHandler(async (req, res) => {
    if (!requireSupabase(res)) return;
    const input = orderSchema.parse(req.body);
    const { data, error } = await supabase
      .from('orders')
      .insert([input])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ success: true, data });
  }));

  app.use((error, _req, res, _next) => {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request body', details: error.flatten() });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};
