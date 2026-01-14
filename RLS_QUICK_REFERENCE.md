# ⚡ RLS Quick Reference

## 🚀 TL;DR (Too Long; Didn't Read)

### Quick Setup (2 minutes)

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard

2. **Click SQL Editor** (left sidebar)

3. **Copy this entire script** and paste it:

```sql
-- USERS TABLE
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_delete_own" ON public.users;

CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users_delete_own" ON public.users FOR DELETE USING (auth.uid() = id);

-- CHAT_SESSIONS TABLE
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat_sessions_select_own" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_insert_own" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_update_own" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_delete_own" ON public.chat_sessions;

CREATE POLICY "chat_sessions_select_own" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chat_sessions_insert_own" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chat_sessions_update_own" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chat_sessions_delete_own" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- MESSAGES TABLE
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;

CREATE POLICY "messages_select_own" ON public.messages FOR SELECT USING (user_id = auth.uid() OR session_id IN (SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()));
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT WITH CHECK (user_id = auth.uid() AND session_id IN (SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()));
CREATE POLICY "messages_delete_own" ON public.messages FOR DELETE USING (user_id = auth.uid());
```

4. **Click Run** (Ctrl+Enter)

5. **Done!** ✅

---

## 🧪 Quick Test

```bash
# In your terminal
npm run dev

# In browser
http://localhost:9003

# Test:
1. Sign up with email
2. Create a chat
3. Send a message
4. F12 → Network → Should be 200 OK
5. Sign out & sign up with different email
6. Should NOT see first user's chats
```

---

## 🔍 Quick Verification

Run this in Supabase SQL Editor to check if RLS is enabled:

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'chat_sessions', 'messages');
```

**Expected result:**
```
public | users         | t
public | chat_sessions | t
public | messages      | t
```

Where `t` = RLS enabled ✅

---

## 🆘 Disable RLS (If Needed)

If you need to temporarily disable RLS for debugging:

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
```

Then re-enable:

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
```

---

## 📚 What's in the Script?

| Part | Does What |
|------|-----------|
| `ALTER TABLE ... ENABLE RLS` | Turns on RLS |
| `DROP POLICY IF EXISTS` | Removes old policies |
| `CREATE POLICY ... SELECT` | User can READ own data |
| `CREATE POLICY ... INSERT` | User can CREATE own data |
| `CREATE POLICY ... UPDATE` | User can MODIFY own data |
| `CREATE POLICY ... DELETE` | User can DELETE own data |

---

## 🎯 Policy Rules Explained

### auth.uid() = id
```
"Only allow if the user's ID matches the row's user ID"

Example:
- Logged in user ID: 12345
- Looking at row with user_id: 12345
- Result: ✅ ALLOWED
```

### auth.uid() = user_id
```
"Only allow if the user's ID matches the row's user_id column"

Example:
- Logged in user ID: 12345
- Looking at row with user_id: 67890
- Result: ❌ BLOCKED
```

### user_id = auth.uid() OR session_id IN (SELECT ...)
```
"Allow if: (user owns this message) OR (message is in user's chat session)"

Example:
- User A can see:
  - Messages they wrote
  - Messages in their chat sessions
```

---

## ✅ How to Verify It Works

### Test 1: Can you sign up?
```
✅ YES → RLS working
❌ NO → Check error message
```

### Test 2: Can you create chat?
```
✅ YES → RLS working
❌ NO → Check RLS policies exist
```

### Test 3: Can you see other users' data?
```
✅ NO (blocked) → RLS working correctly!
❌ YES (visible) → RLS not working
```

### Test 4: DevTools Network
```
✅ Status 200 → RLS working
❌ Status 401 → RLS blocking (needs fix)
❌ Status 403 → RLS blocking (needs fix)
```

---

## 🚨 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | RLS blocking read | Check policy conditions |
| 403 Forbidden | RLS blocking write | Check `WITH CHECK` clause |
| Permission denied | User not authenticated | Make sure user is logged in |
| Policy already exists | Ran script twice | Script has DROP IF EXISTS |
| Table doesn't exist | Table not created | Run `create_schema.sql` first |

---

## 🔐 Security Summary

**Before RLS:**
```
Anyone can access anyone's data ❌
```

**After RLS:**
```
User A → Can only see User A's data ✅
User B → Can only see User B's data ✅
Hacker → Can only see their own data ✅
```

---

## 📞 Still Having Issues?

See full guides:
- `RLS_SETUP_GUIDE.md` - Detailed setup
- `RLS_VISUAL_GUIDE.md` - Step-by-step with screenshots

---

**Status: Production Ready** 🎉
