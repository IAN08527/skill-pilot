-- Profiles table to store additional user info
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  full_name TEXT,
  interests TEXT[],
  skill_level TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  full_name TEXT,
  interests TEXT[],
  skill_level TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Stats
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  courses_enrolled INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  hours_learned DECIMAL DEFAULT 0,
  skills_gained INTEGER DEFAULT 0,
  achievements INTEGER DEFAULT 0,
  progress_rate INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  source_platform TEXT,
  external_url TEXT,
  rating DECIMAL DEFAULT 4.5,
  is_free BOOLEAN DEFAULT TRUE,
  category TEXT,
  embedding VECTOR(1536), -- For future AI search
  instructor TEXT,
  duration TEXT,
  skills TEXT[],
  total_lessons INTEGER DEFAULT 0,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Progress (Enrollments)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  course_id UUID REFERENCES courses ON DELETE CASCADE,
  status TEXT DEFAULT 'started',
  progress_percentage INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- 5. Playlists
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Playlist Courses
CREATE TABLE IF NOT EXISTS playlist_courses (
  playlist_id UUID REFERENCES playlists ON DELETE CASCADE,
  course_id UUID REFERENCES courses ON DELETE CASCADE,
  position INTEGER NOT NULL,
  PRIMARY KEY (playlist_id, course_id)
);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);

  INSERT INTO public.user_stats (user_id)
  VALUES (new.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
