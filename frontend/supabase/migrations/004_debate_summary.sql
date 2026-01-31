alter table public.debate_sessions
  add column if not exists summary text,
  add column if not exists summary_created_at timestamptz,
  add column if not exists summary_model text;
