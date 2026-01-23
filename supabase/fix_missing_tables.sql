
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  full_name TEXT,
  interests TEXT[],
  skill_level TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Create user_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  courses_enrolled INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  hours_learned DECIMAL DEFAULT 0, -- Changed to DECIMAL to match schema.sql
  skills_gained INTEGER DEFAULT 0,
  achievements INTEGER DEFAULT 0,
  progress_rate INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_stats
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats."
  ON public.user_stats FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can update own stats."
  ON public.user_stats FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own stats."
  ON public.user_stats FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- Function to handle new user signup automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_stats (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
