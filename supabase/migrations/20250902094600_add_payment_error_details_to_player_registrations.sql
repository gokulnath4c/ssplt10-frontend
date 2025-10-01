-- Add payment_error_details column to player_registrations table
ALTER TABLE public.player_registrations
ADD COLUMN IF NOT EXISTS payment_error_details JSONB;

-- Add comment for documentation
COMMENT ON COLUMN public.player_registrations.payment_error_details IS 'Stores detailed error information for failed payments';