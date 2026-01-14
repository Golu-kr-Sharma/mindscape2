# 🔒 Complete RLS Policy Setup Guide

## What is RLS (Row Level Security)?

RLS ensures that each user can **only see and modify their own data**. Without it, anyone could access anyone else's chat history!

---

## Step-by-Step Guide

### STEP 1: Open Supabase SQL Editor

1. Go to **https://supabase.com/dashboard**
2. Select your **MindScape project**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### STEP 2: Copy the SQL Script

Open the file: `supabase/migrations/enable_rls_policies.sql`

Copy **ALL** the SQL code from that file.

### STEP 3: Paste into Supabase

1. Paste the entire SQL script into Supabase SQL Editor
2. Click the **Run** button (or press Ctrl+Enter)
3. Wait for it to complete ✅

### STEP 4: Verify RLS is Enabled

The script ends with verification queries. You should see:

```
schemaname | tablename     | rowsecurity
public     | users         | t (true = RLS enabled)
public     | chat_sessions | t
public     | messages      | t
```

---

## What Each Policy Does

### USERS TABLE
```
✅ SELECT: Users can read their own profile
✅ INSERT: Users can create their own profile
✅ UPDATE: Users can update their own profile
✅ DELETE: Users can delete their own profile
```

### CHAT_SESSIONS TABLE
```
✅ SELECT: Users can see only their own chat sessions
✅ INSERT: Users can create chat sessions
✅ UPDATE: Users can update their own chat sessions
✅ DELETE: Users can delete their own chat sessions
```

### MESSAGES TABLE
```
✅ SELECT: Users can see messages from their own chat sessions
✅ INSERT: Users can add messages to their own chat sessions
✅ DELETE: Users can delete their own messages
```

---

## How RLS Works

When a user is logged in, Supabase automatically adds `auth.uid()` which is the user's ID.

**Example:**
- User ID: `12345`
- RLS Policy: `user_id = auth.uid()`
- Result: User can only access rows where `user_id = 12345`

---

## Testing RLS

After running the SQL script:

1. **Try to sign up** with a new account
2. **Create a chat** and send a message
3. **Open DevTools** (F12)
4. **Check Network tab** - should **NOT see 401 errors** anymore
5. All requests should be **200 OK** ✅

---

## If You Get Errors

### Error: "Permission Denied"
- Make sure you're logged in to your Supabase project with the correct account
- Check that your user ID exists in the `users` table

### Error: "Relation does not exist"
- The `users`, `chat_sessions`, or `messages` table doesn't exist
- Run the migration from `supabase/migrations/create_schema.sql` first

### Error: "Policy already exists"
- The policies were already created
- The SQL script has `DROP POLICY IF EXISTS` to prevent this
- Just run the script again - it will recreate them

---

## Security Checklist

After running the RLS policies:

- ✅ Can I sign up? **YES**
- ✅ Can I create a chat session? **YES**
- ✅ Can I send messages? **YES**
- ✅ Can I see other users' data? **NO** (blocked by RLS)
- ✅ Do I get 401 errors? **NO** (RLS handles it properly)

---

## What's Protected

| Table | Protected From |
|-------|---|
| **users** | Seeing other users' profiles |
| **chat_sessions** | Seeing other users' chats |
| **messages** | Seeing other users' messages |

---

## Production Safety

This setup is **production-ready** because:

1. ✅ Each user can ONLY access their own data
2. ✅ No one can read other users' private conversations
3. ✅ No one can modify data they don't own
4. ✅ The database enforces security (not just the app)

---

## SQL Explanation (Optional)

If you want to understand what each line does:

### Policy Structure
```sql
CREATE POLICY "policy_name"
ON table_name
FOR SELECT              -- Operation (SELECT, INSERT, UPDATE, DELETE)
USING (condition)       -- Who can access
WITH CHECK (condition)  -- What data they can modify
```

### Key Functions
- `auth.uid()` - Current logged-in user's ID
- `=` - Equals (user_id must match auth.uid())
- `OR` - Multiple conditions (read own OR read session)
- `IN` - Check if value is in a list

---

## Next Steps

1. ✅ Run the RLS script
2. ✅ Test signing up and creating chats
3. ✅ Verify no 401 errors in DevTools
4. ✅ You're done! 🎉

---

## Need Help?

If RLS policies still cause issues:

1. **Temporarily disable** to test:
   ```sql
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.chat_sessions DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
   ```

2. **Test without RLS** to confirm app works

3. **Enable RLS again** once confirmed

---

**Created**: January 14, 2026
**Status**: Production Ready
**Security Level**: 🟢 High
