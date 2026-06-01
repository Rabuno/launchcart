import { createClient } from '@supabase/supabase-js';
import { createApp } from './app.js';

const port = Number(process.env.PORT || 4000);
const corsOrigin = process.env.CORS_ORIGIN || '*';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. API will return 503 for database routes.');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const app = createApp({ supabase, corsOrigin });

app.listen(port, '0.0.0.0', () => {
  console.log(`LaunchCart backend listening on port ${port}`);
});
