-- Enable Row Level Security (RLS) on all tables
-- This ensures users can only access their own data

-- ============================================
-- 1. USERS TABLE - User Profiles
-- ============================================

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_delete_own" ON public.users;

-- Policy 1: Users can READ their own profile
CREATE POLICY "users_select_own"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can CREATE their own profile during signup
CREATE POLICY "users_insert_own"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can UPDATE their own profile
CREATE POLICY "users_update_own"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Users can DELETE their own profile
CREATE POLICY "users_delete_own"
ON public.users
FOR DELETE
USING (auth.uid() = id);

-- ============================================
-- 2. CHAT_SESSIONS TABLE - Chat History
-- ============================================

-- Enable RLS on chat_sessions table
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "chat_sessions_select_own" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_insert_own" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_update_own" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_delete_own" ON public.chat_sessions;

-- Policy 1: Users can READ their own chat sessions
CREATE POLICY "chat_sessions_select_own"
ON public.chat_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can CREATE their own chat sessions
CREATE POLICY "chat_sessions_insert_own"
ON public.chat_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can UPDATE their own chat sessions
CREATE POLICY "chat_sessions_update_own"
ON public.chat_sessions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can DELETE their own chat sessions
CREATE POLICY "chat_sessions_delete_own"
ON public.chat_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 3. MESSAGES TABLE - Chat Messages
-- ============================================

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;

-- Policy 1: Users can READ messages from their own chat sessions
CREATE POLICY "messages_select_own"
ON public.messages
FOR SELECT
USING (
  user_id = auth.uid() OR
  session_id IN (
    SELECT id FROM public.chat_sessions
    WHERE user_id = auth.uid()
  )
);

-- Policy 2: Users can CREATE messages in their own chat sessions
CREATE POLICY "messages_insert_own"
ON public.messages
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  session_id IN (
    SELECT id FROM public.chat_sessions
    WHERE user_id = auth.uid()
  )
);

-- Policy 3: Users can DELETE their own messages
CREATE POLICY "messages_delete_own"
ON public.messages
FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- 4. MOOD_ENTRIES TABLE (Optional)
-- ============================================

-- Enable RLS on mood_entries table (if table exists)
-- ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
-- DROP POLICY IF EXISTS "mood_entries_select_own" ON public.mood_entries;
-- DROP POLICY IF EXISTS "mood_entries_insert_own" ON public.mood_entries;
-- DROP POLICY IF EXISTS "mood_entries_update_own" ON public.mood_entries;
-- DROP POLICY IF EXISTS "mood_entries_delete_own" ON public.mood_entries;

-- Policy 1: Users can READ their own mood entries
-- CREATE POLICY "mood_entries_select_own"
-- ON public.mood_entries
-- FOR SELECT
-- USING (auth.uid() = user_id);

-- Policy 2: Users can CREATE their own mood entries
-- CREATE POLICY "mood_entries_insert_own"
-- ON public.mood_entries
-- FOR INSERT
-- WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can UPDATE their own mood entries
-- CREATE POLICY "mood_entries_update_own"
-- ON public.mood_entries
-- FOR UPDATE
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can DELETE their own mood entries
-- CREATE POLICY "mood_entries_delete_own"
-- ON public.mood_entries
-- FOR DELETE
-- USING (auth.uid() = user_id);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check that RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'chat_sessions', 'messages', 'mood_entries');

-- Check all active policies
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'chat_sessions', 'messages', 'mood_entries')
ORDER BY tablename, policyname;
