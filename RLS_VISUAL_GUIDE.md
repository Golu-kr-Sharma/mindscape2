# 📋 RLS Setup - Visual Step-by-Step Guide

## 🎯 Goal
Set up Row Level Security (RLS) so users can only access their own data.

---

## 📍 STEP 1: Open Supabase Dashboard

```
1. Go to: https://supabase.com/dashboard
2. Select your MindScape project
3. Look for the left sidebar
```

**Screenshot reference:**
```
┌─────────────────────────────────────┐
│ Supabase Dashboard                  │
├─────────────────────────────────────┤
│ Projects                            │
│ ├─ MindScape                        │
│ │  ├─ SQL Editor        ◄ CLICK    │
│ │  ├─ Database          HERE       │
│ │  ├─ Authentication               │
│ │  └─ ...                          │
│                                     │
└─────────────────────────────────────┘
```

---

## 📍 STEP 2: Open SQL Editor

```
Click "SQL Editor" in the left sidebar
```

**What you'll see:**
```
┌─────────────────────────────────────┐
│ SQL Editor                          │
├─────────────────────────────────────┤
│ [New Query]  [Templates]            │
├─────────────────────────────────────┤
│                                     │
│ SELECT * FROM users;                │
│                                     │
│ [Run]  [Format]  [Share]            │
│                                     │
└─────────────────────────────────────┘
```

---

## 📍 STEP 3: Create a New Query

```
Click the [New Query] button
A blank SQL editor will open
```

---

## 📍 STEP 4: Copy the RLS Script

**File location:** `supabase/migrations/enable_rls_policies.sql`

**What to do:**
```
1. Open that file in your code editor
2. Select ALL the code (Ctrl+A)
3. Copy it (Ctrl+C)
```

---

## 📍 STEP 5: Paste into Supabase

```
1. Click in the SQL Editor box
2. Paste the code (Ctrl+V)
3. You should see ~200 lines of SQL
```

**Preview:**
```sql
-- Enable Row Level Security (RLS) on all tables
-- This ensures users can only access their own data

-- ============================================
-- 1. USERS TABLE - User Profiles
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
...
(many more lines)
```

---

## 📍 STEP 6: Run the Script

```
Option 1: Click the [Run] button
Option 2: Press Ctrl+Enter
Option 3: Press Cmd+Enter (Mac)
```

**You'll see:**
```
Running query...
⏳ Processing...
✅ Query executed successfully
```

---

## 📍 STEP 7: Verify Success

At the bottom of the script, there are verification queries.

**Look for results showing:**

```
TABLE: pg_tables
┌──────────┬───────────────┬─────────────┐
│ schema   │ table         │ rowsecurity │
├──────────┼───────────────┼─────────────┤
│ public   │ users         │ t           │
│ public   │ chat_sessions │ t           │
│ public   │ messages      │ t           │
└──────────┴───────────────┴─────────────┘

Where: t = true (RLS enabled)
```

---

## 🔍 What Got Created

After running the script:

```
USERS TABLE:
├─ Policy: users_select_own
├─ Policy: users_insert_own
├─ Policy: users_update_own
└─ Policy: users_delete_own

CHAT_SESSIONS TABLE:
├─ Policy: chat_sessions_select_own
├─ Policy: chat_sessions_insert_own
├─ Policy: chat_sessions_update_own
└─ Policy: chat_sessions_delete_own

MESSAGES TABLE:
├─ Policy: messages_select_own
├─ Policy: messages_insert_own
└─ Policy: messages_delete_own
```

---

## ✅ Testing RLS Works

### Test 1: Sign Up
```
1. Go to your app: http://localhost:9003
2. Click "Sign Up"
3. Fill in: Email, Password, Name
4. Click "Sign Up"
5. Should succeed ✅
```

### Test 2: Create Chat
```
1. After signup, should go to Dashboard
2. Go to Chat page
3. Send a message
4. Should work ✅
5. Open DevTools (F12)
6. Look at Network tab
7. Should see requests with 200 status ✅
```

### Test 3: Check Isolation
```
1. Sign out
2. Sign up with a DIFFERENT email
3. Go to Chat page
4. Should NOT see the first user's chats ✅
5. This proves RLS is working! 🎉
```

---

## 🚨 Troubleshooting

### ❌ Error: "Permission Denied"
**Cause:** User not logged in properly

**Fix:**
1. Sign out completely
2. Clear browser cookies (DevTools → Application → Cookies)
3. Sign up again with fresh credentials
4. Try again

### ❌ Error: "Relation does not exist"
**Cause:** Table doesn't exist

**Fix:**
1. Run `supabase/migrations/create_schema.sql` first
2. Then run the RLS script

### ❌ Still getting 401 errors?
**Cause:** RLS is blocking legitimate requests

**Quick Fix (temporary):**
```sql
-- Disable RLS temporarily to test
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
```

Then re-enable after testing:
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
```

---

## 🎓 Understanding RLS

### Before RLS ❌
```
User A's data:
├─ Chat Session 1
├─ Chat Session 2
└─ Messages (private!)

User B can see everything ⚠️ SECURITY RISK
```

### After RLS ✅
```
User A's data:
├─ Chat Session 1 (User A only)
├─ Chat Session 2 (User A only)
└─ Messages (User A only)

User B can ONLY see:
├─ Chat Session 1 (User B only)
├─ Chat Session 2 (User B only)
└─ Messages (User B only)

User A cannot see User B's data 🔒 SECURE
```

---

## 📊 RLS in Action

### Policy Example: Users Table

```sql
CREATE POLICY "users_select_own"
ON public.users
FOR SELECT
USING (auth.uid() = id);
```

**What this means:**
```
Query: SELECT * FROM users;

Without RLS:
  Returns ALL users ❌ INSECURE

With RLS policy:
  WHERE auth.uid() = id
  
  If User A (id=123) is logged in:
    WHERE 123 = id
    Returns only User A ✅ SECURE
```

---

## ✨ Final Checklist

- [ ] Opened Supabase Dashboard
- [ ] Clicked SQL Editor
- [ ] Created New Query
- [ ] Copied RLS script
- [ ] Pasted into SQL Editor
- [ ] Clicked Run
- [ ] Saw ✅ "Query executed successfully"
- [ ] Verified RLS is enabled (t = true)
- [ ] Tested Sign Up ✅
- [ ] Tested Chat Creation ✅
- [ ] Verified isolation (User A ≠ User B data)
- [ ] No more 401 errors ✅

---

## 🎉 Success!

Your app is now **secure with RLS policies enabled!**

Users can only access their own:
- ✅ Profile
- ✅ Chat Sessions
- ✅ Messages

---

**Need help?** Check the troubleshooting section above.

**Want to learn more?** See `RLS_SETUP_GUIDE.md` for detailed explanations.
