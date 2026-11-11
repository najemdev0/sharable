ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS brand_converted_at timestamptz;

UPDATE public.profiles
SET account_type = 'personal'
WHERE account_type IS NULL OR account_type NOT IN ('personal', 'brand');

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_account_type_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_account_type_check
  CHECK (account_type IN ('personal', 'brand'));
