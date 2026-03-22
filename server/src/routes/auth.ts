import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { supabaseAdmin } from '../lib/supabase';
import { env } from '../config/env';

export const authRouter = Router();

function generateBootstrapCredentials() {
  const username = `admin_${randomBytes(3).toString('hex')}`;
  const password = randomBytes(9)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 12);
  return { username, password };
}

function extractBearerToken(header: string | undefined) {
  if (!header) return '';
  const value = header.trim();
  if (!value.toLowerCase().startsWith('bearer ')) return '';
  return value.slice(7).trim();
}

authRouter.post('/bootstrap', async (_req, res) => {
  const { data: existingUsers, error: checkError } = await supabaseAdmin
    .from('admin_users')
    .select('id')
    .limit(1);

  if (checkError) {
    return res.status(500).json({ error: checkError.message });
  }

  if (existingUsers && existingUsers.length > 0) {
    return res.status(409).json({ error: 'Admin account already exists. Use login.' });
  }

  const credentials = generateBootstrapCredentials();
  const password_hash = await bcrypt.hash(credentials.password, 10);

  const { error } = await supabaseAdmin.from('admin_users').insert({
    username: credentials.username,
    password_hash,
    is_active: true
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({
    message: 'Initial admin credentials generated. Save these securely.',
    credentials
  });
});

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const { data: user, error } = await supabaseAdmin
    .from('admin_users')
    .select('id, username, password_hash, is_active')
    .eq('username', username)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: 'Admin account is inactive' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + env.adminSessionDays * 24 * 60 * 60 * 1000).toISOString();

  const { error: sessionError } = await supabaseAdmin.from('admin_sessions').insert({
    admin_user_id: user.id,
    token,
    expires_at: expiresAt
  });

  if (sessionError) {
    return res.status(500).json({ error: sessionError.message });
  }

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username
    },
    expires_at: expiresAt
  });
});

authRouter.get('/me', async (req, res) => {
  const token = extractBearerToken(req.header('authorization'));
  if (!token) {
    return res.status(401).json({ error: 'Missing session token' });
  }

  const { data: session, error: sessionError } = await supabaseAdmin
    .from('admin_sessions')
    .select('id, expires_at, admin_user_id')
    .eq('token', token)
    .single();

  if (sessionError || !session) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    await supabaseAdmin.from('admin_sessions').delete().eq('id', session.id);
    return res.status(401).json({ error: 'Session expired' });
  }

  const { data: user } = await supabaseAdmin
    .from('admin_users')
    .select('id, username, is_active')
    .eq('id', session.admin_user_id)
    .single();

  if (!user || !user.is_active) {
    return res.status(401).json({ error: 'Admin user not available' });
  }

  return res.json({ user, expires_at: session.expires_at });
});

authRouter.post('/logout', async (req, res) => {
  const token = extractBearerToken(req.header('authorization'));
  if (!token) {
    return res.status(400).json({ error: 'Missing session token' });
  }

  const { error } = await supabaseAdmin.from('admin_sessions').delete().eq('token', token);
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ message: 'Logged out successfully' });
});
