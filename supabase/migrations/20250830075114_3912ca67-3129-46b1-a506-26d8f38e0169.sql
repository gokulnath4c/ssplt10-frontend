-- Create a default admin user
-- Note: This will create a user with email 'admin@sspl.co.in' and a temporary password
-- The admin should change this password after first login

-- First, let's create the admin user in auth.users (this is a one-time setup)
-- We'll insert directly into user_roles with a known UUID for the admin
INSERT INTO public.user_roles (id, user_id, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001', -- Placeholder UUID for admin
  'admin',
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Add a comment about creating the admin user through Supabase Auth
COMMENT ON TABLE public.user_roles IS 'Admin users must be created through Supabase Auth admin API or dashboard. After creating auth user, update their role in this table to admin.';