import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '../lib/auth';
import { supabaseAdmin } from '../lib/supabase';

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get('/dashboard', async (_req, res) => {
  const [sections, services, portfolio, testimonials, terms, messages, settings] = await Promise.all([
    supabaseAdmin.from('site_sections').select('*').order('updated_at', { ascending: false }),
    supabaseAdmin.from('services').select('*').order('display_order', { ascending: true }),
    supabaseAdmin.from('portfolio_items').select('*').order('display_order', { ascending: true }),
    supabaseAdmin.from('testimonials').select('*').order('display_order', { ascending: true }),
    supabaseAdmin.from('terms_policies').select('*').order('display_order', { ascending: true }),
    supabaseAdmin.from('contact_messages').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('site_settings').select('*').order('key', { ascending: true })
  ]);

  const errors = [
    sections.error,
    services.error,
    portfolio.error,
    testimonials.error,
    terms.error,
    messages.error,
    settings.error
  ].filter(Boolean);

  if (errors.length > 0) {
    return res.status(500).json({ error: errors.map((e) => e?.message).join('; ') });
  }

  return res.json({
    sections: sections.data ?? [],
    services: services.data ?? [],
    portfolio: portfolio.data ?? [],
    testimonials: testimonials.data ?? [],
    terms: terms.data ?? [],
    messages: messages.data ?? [],
    settings: settings.data ?? []
  });
});

adminRouter.post('/sections', async (req, res) => {
  const { slug, title, subtitle, body, cta_text, cta_link } = req.body;
  if (!slug || !title) return res.status(400).json({ error: 'slug and title are required' });

  const { data, error } = await supabaseAdmin
    .from('site_sections')
    .upsert({ slug, title, subtitle, body, cta_text, cta_link }, { onConflict: 'slug' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

adminRouter.put('/sections/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('site_sections')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

adminRouter.put('/sections/:id/status', async (req, res) => {
  const { is_active } = req.body;
  const { data, error } = await supabaseAdmin
    .from('site_sections')
    .update({ is_active: Boolean(is_active) })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

adminRouter.post('/services', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('services').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

adminRouter.put('/services/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('services')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

adminRouter.delete('/services/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('services').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

adminRouter.put('/services/:id/status', async (req, res) => {
  const { is_active } = req.body;
  const { data, error } = await supabaseAdmin
    .from('services')
    .update({ is_active: Boolean(is_active) })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

adminRouter.post('/portfolio', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('portfolio_items').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

adminRouter.put('/portfolio/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('portfolio_items')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

adminRouter.delete('/portfolio/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('portfolio_items').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

adminRouter.put('/portfolio/:id/status', async (req, res) => {
  const { is_active } = req.body;
  const { data, error } = await supabaseAdmin
    .from('portfolio_items')
    .update({ is_active: Boolean(is_active) })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

adminRouter.post('/testimonials', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('testimonials').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

adminRouter.put('/testimonials/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

adminRouter.delete('/testimonials/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('testimonials').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

adminRouter.put('/testimonials/:id/status', async (req, res) => {
  const { is_active } = req.body;
  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .update({ is_active: Boolean(is_active) })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

adminRouter.post('/terms', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('terms_policies').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

adminRouter.put('/terms/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('terms_policies')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

adminRouter.delete('/terms/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('terms_policies').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

adminRouter.put('/terms/:id/status', async (req, res) => {
  const { is_active } = req.body;
  const { data, error } = await supabaseAdmin
    .from('terms_policies')
    .update({ is_active: Boolean(is_active) })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

adminRouter.post('/settings', async (req, res) => {
  const { key, value } = req.body;
  if (!key || typeof value === 'undefined') {
    return res.status(400).json({ error: 'key and value are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .upsert({ key, value: String(value), updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

adminRouter.get('/admin-users', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('id, username, is_active, created_at, updated_at')
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data ?? []);
});

adminRouter.post('/admin-users', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .insert({ username, password_hash, is_active: true })
    .select('id, username, is_active, created_at, updated_at')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

adminRouter.put('/admin-users/:id/status', async (req, res) => {
  const { is_active } = req.body;
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .update({ is_active: Boolean(is_active), updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('id, username, is_active, created_at, updated_at')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

adminRouter.put('/account', async (req, res) => {
  const { username, current_password, new_password } = req.body as {
    username?: string;
    current_password?: string;
    new_password?: string;
  };

  const adminUserId = (req as any).adminUserId as string | undefined;
  if (!adminUserId || adminUserId === 'api-key-admin') {
    return res.status(400).json({ error: 'Login session required for account settings' });
  }

  const { data: currentUser, error: userError } = await supabaseAdmin
    .from('admin_users')
    .select('id, username, password_hash')
    .eq('id', adminUserId)
    .single();

  if (userError || !currentUser) {
    return res.status(404).json({ error: 'Admin account not found' });
  }

  const updates: { username?: string; password_hash?: string; updated_at: string } = {
    updated_at: new Date().toISOString()
  };

  if (username) {
    updates.username = username;
  }

  if (new_password) {
    if (!current_password) {
      return res.status(400).json({ error: 'current_password is required to set a new password' });
    }

    const valid = await bcrypt.compare(current_password, currentUser.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    updates.password_hash = await bcrypt.hash(new_password, 10);
  }

  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .update(updates)
    .eq('id', adminUserId)
    .select('id, username, is_active, created_at, updated_at')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

adminRouter.put('/messages/:id/status', async (req, res) => {
  const { is_resolved } = req.body;
  const { data, error } = await supabaseAdmin
    .from('contact_messages')
    .update({ is_resolved: Boolean(is_resolved) })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

adminRouter.delete('/messages/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('contact_messages').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});
