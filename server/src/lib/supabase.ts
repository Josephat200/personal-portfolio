import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

export const supabasePublic = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY);

export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_PUBLISHABLE_KEY
);
