import { Router } from 'express';
import { supabasePublic } from '../lib/supabase';

export const siteRouter = Router();

siteRouter.get('/content', async (_req, res) => {
  const [sections, services, portfolio, testimonials, terms, settings] = await Promise.all([
    supabasePublic
      .from('site_sections')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false }),
    supabasePublic
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabasePublic
      .from('portfolio_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabasePublic
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabasePublic
      .from('terms_policies')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabasePublic.from('site_settings').select('*')
  ]);

  const errors = [sections.error, services.error, portfolio.error, testimonials.error, terms.error, settings.error].filter(Boolean);
  if (errors.length > 0) {
    return res.status(500).json({ error: errors.map((e) => e?.message).join('; ') });
  }

  const settingsMap = Object.fromEntries((settings.data ?? []).map((row) => [row.key, row.value]));

  return res.json({
    sections: sections.data ?? [],
    services: services.data ?? [],
    portfolio: portfolio.data ?? [],
    testimonials: testimonials.data ?? [],
    terms: terms.data ?? [],
    settings: settingsMap
  });
});

siteRouter.post('/contact', async (req, res) => {
  const { name, email, phone, message } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const { error } = await supabasePublic.from('contact_messages').insert({
    name,
    email,
    phone: phone || null,
    message
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ message: 'Message sent successfully.' });
});
