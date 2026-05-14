-- ══════════════════════════════════════════
-- FLIGHT – PPL Training Platform
-- Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════

-- 1. Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  xp          INTEGER NOT NULL DEFAULT 0,
  streak      INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_active DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. User progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id     TEXT NOT NULL,
  sublesson_id  TEXT NOT NULL,
  completed     BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at  TIMESTAMPTZ,
  UNIQUE (user_id, lesson_id, sublesson_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own progress"
  ON public.user_progress FOR ALL USING (auth.uid() = user_id);


-- 3. Quiz attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id              SERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id         TEXT NOT NULL,
  score           INTEGER NOT NULL DEFAULT 0,
  correct         INTEGER NOT NULL DEFAULT 0,
  wrong           INTEGER NOT NULL DEFAULT 0,
  skipped         INTEGER NOT NULL DEFAULT 0,
  elapsed_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own attempts"
  ON public.quiz_attempts FOR ALL USING (auth.uid() = user_id);


-- 4. Friendships
CREATE TABLE IF NOT EXISTS public.friendships (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, friend_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own friendships"
  ON public.friendships FOR ALL USING (auth.uid() = user_id);


-- 5. XP increment function (called after quiz submit)
CREATE OR REPLACE FUNCTION public.increment_xp(user_id UUID, amount INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET xp = xp + amount
  WHERE id = user_id;
END;
$$;


-- 6. Leaderboard view (top 20 by XP)
CREATE OR REPLACE VIEW public.leaderboard AS
  SELECT id, name, xp, streak
  FROM public.profiles
  ORDER BY xp DESC
  LIMIT 20;


-- 7. Indexes for performance at 1000+ concurrent users
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_date ON public.quiz_attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(xp DESC);
