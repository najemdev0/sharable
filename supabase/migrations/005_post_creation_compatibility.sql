-- Compatibility fields required by the post creation and feed UI.
-- Safe to run more than once.

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS media_url text,
  ADD COLUMN IF NOT EXISTS media_type text,
  ADD COLUMN IF NOT EXISTS media_urls text[],
  ADD COLUMN IF NOT EXISTS media_types text[],
  ADD COLUMN IF NOT EXISTS location_name text,
  ADD COLUMN IF NOT EXISTS location_latitude double precision,
  ADD COLUMN IF NOT EXISTS location_longitude double precision,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS post_number integer;

UPDATE public.posts
SET user_id = author_id
WHERE user_id IS NULL;

CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS posts_user_slug_unique_idx
  ON public.posts(user_id, slug)
  WHERE slug IS NOT NULL;
