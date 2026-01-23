# Real Data Integration - Quick Start Guide

## 📋 Overview

Your course detail page currently shows **dummy data** because the database tables haven't been created yet. The **code integration is already complete** - you just need to run the database migration!

## ✅ What's Already Working

- ✅ Course generation with YouTube API
- ✅ Data saving to Supabase (courses, modules, lessons, chapters)
- ✅ Course detail page rendering
- ✅ Progress tracking
- ✅ Lesson completion

## 🚀 Quick Fix (3 Steps)

### Step 1: Create Database Tables

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of:
   ```
   supabase/complete_schema.sql
   ```
6. Paste into the SQL editor
7. Click **Run** (or press Ctrl/Cmd + Enter)

✅ You should see: "Success. No rows returned"

### Step 2: Test Course Creation

1. Navigate to `/home/create` in your app
2. Fill in the form:
   - **Topic**: "Web Development"
   - **Goal**: "Build modern websites"
   - **Duration**: "2-4 weeks"  
   - **Level**: "Beginner"
3. Click **Generate Custom Course**
4. Wait 10-30 seconds for AI to generate
5. You'll auto-redirect to the course detail page

### Step 3: Verify Real Data

On the course detail page, check:
- ✅ Course title matches generated topic
- ✅ Modules show (e.g., "HTML & CSS", "JavaScript")
- ✅ Lessons show with real YouTube video titles
- ✅ Chapters appear (if YouTube video has timestamps)
- ✅ Progress bar works when marking lessons complete

## 📊 Data Flow Diagram

View the visual diagram at: `course_data_flow.png`

```
User Form → API → createCustomCourse() → Database → Course Page
```

## 🔍 Debugging

If something doesn't work, use these queries in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- View all courses
SELECT * FROM courses ORDER BY created_at DESC;

-- View course with modules and lessons
SELECT 
    c.title as course,
    m.title as module,
    l.title as lesson
FROM courses c
LEFT JOIN modules m ON c.id = m.course_id
LEFT JOIN lessons l ON m.id = l.module_id
ORDER BY c.created_at DESC, m.order_index, l.order_index;
```

More debug queries available in: `supabase/debug_queries.sql`

## 📁 Important Files

| File | Purpose |
|------|---------|
| `supabase/complete_schema.sql` | **Run this first** - Creates all tables |
| `supabase/debug_queries.sql` | SQL queries to verify data |
| `modules/createCustomCourse.js` | Course generation logic (lines 526-625) |
| `app/api/courses/[id]/route.ts` | API to fetch course data |
| `app/home/course/[id]/page.tsx` | Course detail page component |
| `REAL_DATA_INTEGRATION.md` | Full documentation |

## 🐛 Common Issues

### "Course not found" error
**Cause**: Database tables don't exist  
**Fix**: Run `supabase/complete_schema.sql`

### Page shows dummy data
**Cause**: Using wrong course ID or tables empty  
**Fix**: Create a new course via `/home/create`

### Modules/Lessons don't show
**Cause**: Missing tables or RLS policies blocking access  
**Fix**: Check Supabase logs, verify schema was applied

### Chapters not appearing
**Cause**: YouTube video doesn't have chapter timestamps  
**Fix**: This is expected - only videos with timestamps in description will have chapters

## 📚 Database Schema

```
courses (main course info)
  ├── modules (course sections)
  │     └── lessons (individual lessons/videos)
  │           └── chapters (video timestamps)
  └── enrollments (user progress)

lesson_completions (tracks completed lessons)
```

## 🎯 Next Steps

1. **Apply Schema**: Run `complete_schema.sql` ✨
2. **Create Course**: Test via `/home/create`
3. **View Course**: Check the detail page shows real data
4. **Test Features**: Mark lessons complete, verify progress

## 💡 Pro Tips

- The `createCustomCourse` function already extracts video chapters from YouTube descriptions
- Courses are auto-enrolled for the creator
- Progress is calculated automatically
- All data is real-time from your Supabase database
- Use debug queries to inspect data anytime

---

**Need help?** Check `REAL_DATA_INTEGRATION.md` for detailed documentation.

**Ready to test?** Just run the SQL schema and create your first course! 🚀
