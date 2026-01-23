-- ============================================================================
-- CHAPTER VERIFICATION QUERIES
-- Run these to check if chapters are being saved to the database
-- ============================================================================

-- 1. Check if chapters table exists and has correct structure
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'chapters'
ORDER BY ordinal_position;

-- 2. Count total chapters in database
SELECT COUNT(*) as total_chapters FROM chapters;

-- 3. View all chapters with course and lesson info
SELECT 
    c.title as course_title,
    c.created_at as course_created,
    l.title as lesson_title,
    l.video_id,
    ch.title as chapter_title,
    ch.timestamp_seconds,
    CONCAT(
        FLOOR(ch.timestamp_seconds / 60), 
        ':', 
        LPAD((ch.timestamp_seconds % 60)::text, 2, '0')
    ) as timestamp_formatted,
    ch.created_at as chapter_created
FROM chapters ch
JOIN lessons l ON ch.lesson_id = l.id
JOIN courses c ON ch.course_id = c.id
ORDER BY c.created_at DESC, l.order_index, ch.timestamp_seconds;

-- 4. Count chapters per course
SELECT 
    c.id,
    c.title as course_title,
    c.created_at,
    COUNT(ch.id) as chapter_count
FROM courses c
LEFT JOIN chapters ch ON c.id = ch.course_id
GROUP BY c.id, c.title, c.created_at
ORDER BY c.created_at DESC;

-- 5. Count chapters per lesson
SELECT 
    c.title as course_title,
    l.title as lesson_title,
    l.video_id,
    COUNT(ch.id) as chapter_count
FROM lessons l
JOIN courses c ON l.course_id = c.id
LEFT JOIN chapters ch ON l.id = ch.lesson_id
WHERE c.is_ai_generated = true
GROUP BY c.title, l.title, l.video_id, l.order_index
ORDER BY c.created_at DESC, l.order_index;

-- 6. Find lessons WITHOUT chapters
SELECT 
    c.title as course_title,
    l.title as lesson_title,
    l.video_id,
    l.video_url
FROM lessons l
JOIN courses c ON l.course_id = c.id
LEFT JOIN chapters ch ON l.id = ch.lesson_id
WHERE ch.id IS NULL
  AND c.is_ai_generated = true
ORDER BY c.created_at DESC, l.order_index;

-- 7. Find lessons WITH chapters
SELECT 
    c.title as course_title,
    l.title as lesson_title,
    l.video_id,
    COUNT(ch.id) as chapter_count,
    MIN(ch.title) as first_chapter,
    MAX(ch.title) as last_chapter
FROM lessons l
JOIN courses c ON l.course_id = c.id
INNER JOIN chapters ch ON l.id = ch.lesson_id
WHERE c.is_ai_generated = true
GROUP BY c.title, l.title, l.video_id, l.order_index
ORDER BY c.created_at DESC, l.order_index;

-- 8. View most recent chapter insertions
SELECT 
    ch.*,
    l.title as lesson_title,
    c.title as course_title
FROM chapters ch
JOIN lessons l ON ch.lesson_id = l.id
JOIN courses c ON ch.course_id = c.id
ORDER BY ch.created_at DESC
LIMIT 20;

-- 9. Check for any chapter insertion errors (if you have error logging)
-- This assumes you might have an errors table
-- SELECT * FROM errors WHERE message LIKE '%chapter%' ORDER BY created_at DESC LIMIT 10;

-- 10. Summary statistics
SELECT 
    'Total Courses' as metric,
    COUNT(*) as value
FROM courses
UNION ALL
SELECT 
    'Courses with Chapters',
    COUNT(DISTINCT course_id)
FROM chapters
UNION ALL
SELECT 
    'Total Lessons',
    COUNT(*)
FROM lessons
UNION ALL
SELECT 
    'Lessons with Chapters',
    COUNT(DISTINCT lesson_id)
FROM chapters
UNION ALL
SELECT 
    'Total Chapters',
    COUNT(*)
FROM chapters;
