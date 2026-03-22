import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  PORT: z.string().default('4000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  ADMIN_API_KEY: z.string().min(8),
  ADMIN_SESSION_DAYS: z.string().default('7'),
  CORS_ORIGINS: z.string().default('http://localhost:4000')
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  port: Number(parsed.data.PORT),
  adminSessionDays: Number(parsed.data.ADMIN_SESSION_DAYS),
  corsOrigins: parsed.data.CORS_ORIGINS.split(',').map((item) => item.trim())
};
