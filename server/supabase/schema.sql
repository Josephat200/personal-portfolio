create extension if not exists pgcrypto;

create table if not exists site_sections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  body text,
  cta_text text,
  cta_link text,
  is_active boolean default true,
  updated_at timestamptz default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  price_note text,
  is_active boolean default true,
  display_order int default 0,
  created_at timestamptz default now()
);

create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  summary text,
  image_url text,
  project_url text,
  is_active boolean default true,
  display_order int default 0,
  created_at timestamptz default now()
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  company text,
  quote text not null,
  rating int default 5,
  is_active boolean default true,
  display_order int default 0,
  created_at timestamptz default now()
);

create table if not exists terms_policies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  is_active boolean default true,
  display_order int default 0,
  created_at timestamptz default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  is_resolved boolean default false,
  created_at timestamptz default now()
);

create table if not exists site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references admin_users(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

alter table site_sections add column if not exists is_active boolean default true;
alter table services add column if not exists is_active boolean default true;
alter table portfolio_items add column if not exists is_active boolean default true;
alter table testimonials add column if not exists is_active boolean default true;
alter table terms_policies add column if not exists is_active boolean default true;
alter table contact_messages add column if not exists is_resolved boolean default false;
alter table admin_users add column if not exists is_active boolean default true;
alter table admin_users add column if not exists updated_at timestamptz default now();

alter table site_sections enable row level security;
alter table services enable row level security;
alter table portfolio_items enable row level security;
alter table testimonials enable row level security;
alter table terms_policies enable row level security;
alter table contact_messages enable row level security;
alter table site_settings enable row level security;
alter table admin_users enable row level security;
alter table admin_sessions enable row level security;

drop policy if exists "public read site_sections" on site_sections;
create policy "public read site_sections" on site_sections for select using (true);

drop policy if exists "public read services" on services;
create policy "public read services" on services for select using (true);

drop policy if exists "public read portfolio" on portfolio_items;
create policy "public read portfolio" on portfolio_items for select using (true);

drop policy if exists "public read testimonials" on testimonials;
create policy "public read testimonials" on testimonials for select using (true);

drop policy if exists "public read terms" on terms_policies;
create policy "public read terms" on terms_policies for select using (true);

drop policy if exists "public read settings" on site_settings;
create policy "public read settings" on site_settings for select using (true);

drop policy if exists "public insert contacts" on contact_messages;
create policy "public insert contacts" on contact_messages for insert with check (true);

insert into site_sections (slug, title, subtitle, body, cta_text, cta_link)
values
  ('home', 'Josphat Omondi', 'Software Engineer', 'I build reliable web systems, business platforms, automation tools, and custom software products from Kutus-Kirinyaga.', 'Start a Project', '#contact'),
  ('about', 'About Me', 'Who I am', 'I am a professional software engineer offering complete software engineering services for startups, SMEs, and organizations.', 'See Services', '#services')
on conflict (slug) do update set title=excluded.title, subtitle=excluded.subtitle, body=excluded.body, cta_text=excluded.cta_text, cta_link=excluded.cta_link;

insert into services (name, description, icon, price_note, display_order)
values
  ('Web Application Development', 'Modern responsive web apps with secure APIs and scalable architecture.', 'code', 'Custom quote', 1),
  ('Backend API Engineering', 'RESTful and real-time APIs with database design and integrations.', 'server', 'Custom quote', 2),
  ('Mobile-Friendly Systems', 'Progressive web app experiences that work smoothly on mobile devices.', 'smartphone', 'Custom quote', 3),
  ('Database Design and Optimization', 'Data modeling, Supabase/PostgreSQL setup, performance tuning, and migration support.', 'database', 'Custom quote', 4)
on conflict do nothing;

insert into site_settings (key, value)
values
  ('contact_email', 'omondijosephat24@gmail.com'),
  ('contact_phone', '+254797670230'),
  ('contact_whatsapp', '+254797670230'),
  ('office_location', 'Kutus, Kirinyaga County, Kenya'),
  ('footer_tagline', 'Professional software engineering services with practical delivery and long-term support.')
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into portfolio_items (title, category, summary, image_url, project_url, display_order)
values
  ('Business Management Platform', 'Enterprise', 'A complete management platform for operations and reporting.', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80', '#', 1),
  ('Service Booking Portal', 'Web Platform', 'A customer booking and payment workflow with admin operations.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80', '#', 2)
on conflict do nothing;

insert into testimonials (client_name, company, quote, rating, display_order)
values
  ('Jane Mwangi', 'Kirinyaga Ventures', 'Josphat delivered exactly what we needed, on time and with quality support.', 5, 1),
  ('David Kariuki', 'TechBridge KE', 'Professional, reliable, and very strong in backend architecture.', 5, 2)
on conflict do nothing;

insert into terms_policies (title, body, display_order)
values
  ('Service Delivery Policy', 'Project timelines are agreed in writing and updates are shared throughout the development process.', 1),
  ('Payment Terms', 'A project deposit is required before start, with milestone-based payment options available.', 2)
on conflict do nothing;
