import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { supabaseAdmin } from './supabase';

function extractBearerToken(req: Request) {
  const authorization = req.header('authorization') || '';
  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }
  return '';
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const key = req.header('x-admin-key');

  if (key && key === env.ADMIN_API_KEY) {
    (req as Request & { adminUserId?: string }).adminUserId = 'api-key-admin';
    return next();
  }

  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized admin request' });
  }

  const { data: session, error } = await supabaseAdmin
    .from('admin_sessions')
    .select('id, token, expires_at, admin_user_id')
    .eq('token', token)
    .single();

  if (error || !session) {
    return res.status(401).json({ error: 'Invalid admin session' });
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    await supabaseAdmin.from('admin_sessions').delete().eq('id', session.id);
    return res.status(401).json({ error: 'Admin session expired' });
  }

  const { data: adminUser } = await supabaseAdmin
    .from('admin_users')
    .select('id, is_active')
    .eq('id', session.admin_user_id)
    .single();

  if (!adminUser || !adminUser.is_active) {
    return res.status(401).json({ error: 'Admin account is inactive' });
  }

  (req as Request & { adminUserId?: string }).adminUserId = adminUser.id;

  return next();
}
