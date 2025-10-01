-- Set default registration fee to 10 and update existing config row safely

-- Ensure default is 10 on the column (safe if table exists)
ALTER TABLE IF EXISTS public.admin_settings
  ALTER COLUMN registration_fee SET DEFAULT 10;

-- Update existing row for payment configuration whether the schema uses id or config_key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'admin_settings'
      AND column_name = 'config_key'
  ) THEN
    -- Schema with config_key column
    UPDATE public.admin_settings
      SET registration_fee = 10,
          updated_at = NOW()
    WHERE config_key = 'payment_config';
  ELSE
    -- Fallback schema without config_key (uses id)
    UPDATE public.admin_settings
      SET registration_fee = 10,
          updated_at = NOW()
    WHERE id = 'payment_config';
  END IF;
END
$$;