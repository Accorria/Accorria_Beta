-- 🎯 Accorria Leads Table - Simple One-Pipe System
-- Foundation for lead tracking and conversion

-- Enable UUID extension
create extension if not exists pgcrypto;

-- Create leads table
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Contact Info
  name text,
  email text not null,
  phone text,
  
  -- Lead Source & Attribution
  source text not null, -- 'hero_form', 'demo_page', 'qr_flyer', 'pricing_page'
  utm_campaign text,
  utm_source text,
  utm_medium text,
  utm_content text,
  utm_term text,
  
  -- Lead Qualification
  score smallint default 50, -- 0-100 heuristic score
  status text default 'new', -- 'new', 'contacted', 'booked', 'no_show', 'qualified', 'won', 'lost'
  
  -- Additional Data
  notes text,
  demo_engagement jsonb, -- Store demo interaction data
  survey_responses jsonb, -- Store survey answers
  
  -- Meeting Info
  meeting_booked_at timestamptz,
  meeting_type text, -- 'discovery', 'demo', 'strategy'
  meeting_completed_at timestamptz,
  
  -- Conversion Tracking
  trial_started_at timestamptz,
  paid_conversion_at timestamptz,
  revenue decimal(10,2)
);

-- Indexes for performance
create index if not exists idx_leads_email on public.leads(email);
create index if not exists idx_leads_created_at on public.leads(created_at);
create index if not exists idx_leads_source on public.leads(source);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_score on public.leads(score);

-- RLS Policies
alter table public.leads enable row level security;

-- Service role can do everything (for API calls)
create policy "service can do all"
on public.leads
for all
to service_role
using (true)
with check (true);

-- Authenticated users can read their own leads (if needed)
create policy "users can read own leads"
on public.leads
for select
to authenticated
using (true);

-- Update trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_leads_updated_at
    before update on public.leads
    for each row
    execute function update_updated_at_column();

-- Sample data for testing (remove in production)
insert into public.leads (name, email, source, score, status) values
('Test User', 'test@example.com', 'demo_page', 75, 'new'),
('Demo Lead', 'demo@accorria.com', 'hero_form', 60, 'contacted');
