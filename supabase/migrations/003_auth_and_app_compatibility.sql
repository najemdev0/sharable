-- Application compatibility schema for the custom auth and messaging APIs.
-- Safe to run more than once.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_hash text,
  ADD COLUMN IF NOT EXISTS last_seen timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'offline';

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user1_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversations_distinct_users CHECK (user1_id <> user2_id),
  CONSTRAINT conversations_user_pair_unique UNIQUE (user1_id, user2_id)
);

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS read boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON public.messages(conversation_id);

CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT follows_distinct_users CHECK (follower_id <> following_id),
  CONSTRAINT follows_unique_pair UNIQUE (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS public.reposts (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reposts_unique_pair UNIQUE (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  subscription text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversations_user1_id_idx ON public.conversations(user1_id);
CREATE INDEX IF NOT EXISTS conversations_user2_id_idx ON public.conversations(user2_id);
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS reposts_user_id_idx ON public.reposts(user_id);
CREATE INDEX IF NOT EXISTS reposts_post_id_idx ON public.reposts(post_id);
CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions(user_id);
