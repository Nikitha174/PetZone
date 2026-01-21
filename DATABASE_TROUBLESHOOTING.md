# Database Troubleshooting Guide

## Issue: Health Record Insert Error

The error you're seeing (`Health record insert error: {}`) indicates that the database insert is failing, but the error object is empty or doesn't contain the expected properties.

## Most Likely Causes

### 1. **Missing `health_records` Table** ⚠️
The `health_records` table might not exist in your Supabase database.

**Solution:**
1. Go to your Supabase dashboard
2. Click on **SQL Editor**
3. Run the SQL from `COMPLETE_DATABASE_SCHEMA.sql`
4. This will create all required tables with proper RLS policies

### 2. **Row Level Security (RLS) Blocking Insert**
Even if the table exists, RLS policies might be preventing inserts.

**Solution:**
Check your RLS policies in Supabase:
1. Go to **Database** > **Tables** > `health_records`
2. Click on **RLS Policies**
3. Ensure you have an INSERT policy like:
   ```sql
   create policy "Users can insert their own health records" on health_records
     for insert with check (auth.uid() = user_id);
   ```

### 3. **Missing Columns**
The table might exist but be missing required columns.

**Required columns:**
- `id` (bigint, primary key)
- `user_id` (uuid, references auth.users)
- `pet_id` (bigint, references pets)
- `type` (text)
- `title` (text, nullable)
- `date` (date)
- `next_due` (date, nullable)
- `notes` (text, nullable)
- `weight` (numeric, nullable)
- `created_at` (timestamp)

### 4. **Authentication Issue**
The user might not be properly authenticated.

**Check:**
- Open browser console
- Look for the debug log: "Attempting to insert health record"
- Verify the `user_id` is a valid UUID

## Debugging Steps

### Step 1: Check Console Logs
With the latest code update, you should see these logs:

```
Attempting to insert health record: { user_id: "...", pet_id: "...", ... }
```

If you see an error, it will now show:
- Full error object
- Stringified error (JSON format)
- All error properties

### Step 2: Verify Database Tables
Run this query in Supabase SQL Editor:

```sql
-- Check if health_records table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'health_records' 
ORDER BY ordinal_position;
```

### Step 3: Test Manual Insert
Try manually inserting a record in Supabase SQL Editor:

```sql
-- Replace with your actual user_id and pet_id
INSERT INTO health_records (user_id, pet_id, type, title, date, notes)
VALUES (
  'your-user-id-here',
  1,
  'Vaccination',
  'Test Record',
  '2026-01-21',
  'Manual test'
);
```

If this fails, it will show you the exact error.

### Step 4: Check RLS Policies
Run this query to see all policies:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'health_records';
```

## Quick Fix: Run the Complete Schema

1. Open Supabase dashboard
2. Go to **SQL Editor**
3. Copy the entire contents of `COMPLETE_DATABASE_SCHEMA.sql`
4. Paste and run it
5. Restart your Next.js dev server
6. Try adding a health record again

## What the New Debug Logs Will Show

After the latest code update, when you try to add a health record, you'll see:

**On Success:**
```
Attempting to insert health record: { ... }
Health record saved successfully: { id: 1, ... }
```

**On Error:**
```
Attempting to insert health record: { ... }
Health record insert error - Full object: [Error object]
Health record insert error - Stringified: { "message": "...", ... }
Health record insert error - Properties: { message: "...", details: "...", ... }
```

This will give us the actual error message to work with!

## Next Steps

1. **Try adding a health record** - Check the browser console
2. **Share the console output** - Specifically look for:
   - "Attempting to insert health record"
   - "Health record insert error - Stringified"
3. **Verify database setup** - Run the schema SQL if needed

---

**Need Help?**
If you're still seeing errors after running the SQL schema, share the full console output and we can diagnose further!
