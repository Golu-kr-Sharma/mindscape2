# Setup Instructions - MindScape with Supabase

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Your `.env.local` file already contains:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_KEY`
- ✅ `GEMINI_API_KEY`

**These are REAL credentials for the Supabase project.**

### 3. Initialize Database (First Time Only)

Go to your Supabase dashboard and run the SQL migration:

1. Navigate to: https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Create a new query
5. Copy and paste the contents of: `supabase/migrations/create_schema.sql`
6. Click Execute

This will set up:
- `users` table
- `chat_sessions` table
- `messages` table
- `mood_entries` table
- Row Level Security (RLS) policies

### 4. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:9003

### 5. Test the Application

**Sign Up:**
1. Click "Sign up" on home page
2. Enter name, email, password
3. Click "Sign Up" button
4. Should redirect to dashboard

**Login:**
1. Go back to login page
2. Enter your email and password
3. Click "Login" button
4. Should redirect to dashboard

**Chat:**
1. Go to Chat page
2. Send a message to AI
3. AI should respond using Gemini API
4. Messages are processed in real-time

---

## Project Structure

```
MindScape/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── chat/            # Chat pages and API routes
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page
│   │   ├── dashboard/       # Dashboard page
│   │   └── layout.tsx       # Root layout with AuthProvider
│   ├── components/
│   │   ├── auth/            # Auth components (login, signup, provider)
│   │   ├── chat/            # Chat UI components
│   │   └── ui/              # Reusable UI components
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client setup
│   │   └── supabase-server.ts # Server-side Supabase client
│   ├── ai/                  # AI/Gemini integration
│   └── middleware.ts        # Session refresh middleware
├── supabase/
│   └── migrations/
│       └── create_schema.sql # Database schema
├── .env.local              # Environment variables
├── next.config.ts          # Next.js config
└── package.json            # Dependencies
```

---

## Key Features Implemented

### ✅ Authentication
- Sign up with email/password
- Login with email/password
- Persistent sessions (cookie-based)
- Protected routes (redirect to login if not authenticated)
- Logout functionality

### ✅ Database
- PostgreSQL via Supabase
- Row Level Security (RLS) for data isolation
- User profiles linked to auth system
- Chat sessions per user
- Message history persistence

### ✅ AI Integration
- Gemini API for chat responses
- Emergency detection (detects crisis keywords)
- Emergency helplines display
- Server-side API calls (no API key exposed)

### ✅ Security
- No Firebase code
- No secret keys in client code
- Session validation via middleware
- RLS policies prevent cross-user data access

---

## Environment Variables Explanation

### `NEXT_PUBLIC_SUPABASE_URL`
- **Type**: Public
- **Safe for**: Client code (prefixed with NEXT_PUBLIC_)
- **Source**: Supabase Project Settings → API
- **Example**: `https://bcduqntolfugktxfocqz.supabase.co`

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Type**: Public (anonymous key)
- **Safe for**: Client code (read-only operations mostly)
- **Source**: Supabase Project Settings → API → Service role key
- **Note**: Only provides access that RLS policies allow

### `SUPABASE_SERVICE_KEY`
- **Type**: Private (SECRET)
- **Safe for**: Server-side only (API routes, middleware)
- **Source**: Supabase Project Settings → API → Service role key
- **WARNING**: Never expose this to clients
- **Used for**: Admin operations that bypass RLS

### `GEMINI_API_KEY`
- **Type**: Private (SECRET)
- **Safe for**: Server-side only (API routes)
- **Source**: Google AI Studio (https://aistudio.google.com)
- **WARNING**: Never expose this to clients
- **Used for**: AI chat responses

---

## Troubleshooting

### Error: "Your project's URL and Key are required"
- Check that `.env.local` file exists
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Restart dev server after changing `.env.local`

### Error: "Users can read their own profile" policy failing
- Ensure database migration has been run
- Check RLS policies are enabled in Supabase dashboard
- Verify user is logged in (authenticated)

### Chat not responding
- Verify `GEMINI_API_KEY` is set in `.env.local`
- Check Gemini API quota/billing in Google Cloud Console
- Look at server logs for errors

### Can't sign up (email already exists)
- This means the user already exists in Supabase
- Use the login page instead
- Or use a different email address

---

## Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Click Import

3. **Set Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add the same variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_KEY`
     - `GEMINI_API_KEY`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is now live! 🚀

---

## Database Queries (Advanced)

### View all users
```sql
SELECT id, email, name, created_at FROM public.users;
```

### View chat sessions for a user
```sql
SELECT * FROM public.chat_sessions WHERE user_id = 'user_id_here';
```

### View messages in a session
```sql
SELECT * FROM public.messages WHERE session_id = 'session_id_here' ORDER BY created_at;
```

---

## Useful Links

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Gemini API Console**: https://aistudio.google.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs

---

**Last Updated**: January 2026
**Status**: Production Ready ✅
