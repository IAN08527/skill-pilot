-- ============================================================================
-- VERIFICATION AND DEBUG QUERIES
-- Run these queries to check if your data is being saved correctly
-- ============================================================================

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('courses', 'modules', 'lessons', 'chapters', 'enrollments', 'lesson_completions')
ORDER BY table_name;

-- 2. Count records in each table
SELECT 'courses' as table_name, COUNT(*) as record_count FROM courses
UNION ALL
SELECT 'modules', COUNT(*) FROM modules
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'chapters', COUNT(*) FROM chapters
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'lesson_completions', COUNT(*) FROM lesson_completions;

-- 3. View all courses with their module and lesson counts
SELECT 
    c.id,
    c.title,
    c.created_at,
    c.is_ai_generated,
    COUNT(DISTINCT m.id) as module_count,
    COUNT(DISTINCT l.id) as lesson_count
FROM courses c
LEFT JOIN modules m ON c.id = m.course_id
LEFT JOIN lessons l ON c.id = l.course_id
GROUP BY c.id, c.title, c.created_at, c.is_ai_generated
ORDER BY c.created_at DESC;

-- 4. View a specific course with all its data (replace 'YOUR_COURSE_ID' with actual ID)
-- SELECT 
--     c.id as course_id,
--     c.title as course_title,
--     m.id as module_id,
--     m.title as module_title,
--     m.order_index as module_order,
--     l.id as lesson_id,
--     l.title as lesson_title,
--     l.duration,
--     l.video_url,
--     COUNT(ch.id) as chapter_count
-- FROM courses c
-- LEFT JOIN modules m ON c.id = m.course_id
-- LEFT JOIN lessons l ON m.id = l.module_id
-- LEFT JOIN chapters ch ON l.id = ch.lesson_id
-- WHERE c.id = 'YOUR_COURSE_ID'
-- GROUP BY c.id, c.title, m.id, m.title, m.order_index, l.id, l.title, l.duration, l.video_url
-- ORDER BY m.order_index, l.order_index;

-- 5. View user enrollments with progress
SELECT 
    e.user_id,
    c.title as course_title,
    e.progress,
    e.completed_lessons,
    e.total_lessons,
    e.last_accessed_at
FROM enrollments e
JOIN courses c ON e.course_id = c.id
ORDER BY e.last_accessed_at DESC;

-- 6. View all chapters for courses
SELECT 
    c.title as course_title,
    l.title as lesson_title,
    ch.title as chapter_title,
    ch.timestamp_seconds,
    CONCAT(
        FLOOR(ch.timestamp_seconds / 60), 
        ':', 
        LPAD((ch.timestamp_seconds % 60)::text, 2, '0')
    ) as timestamp_formatted
FROM chapters ch
JOIN lessons l ON ch.lesson_id = l.id
JOIN courses c ON ch.course_id = c.id
ORDER BY c.created_at DESC, l.order_index, ch.timestamp_seconds;

-- 7. Delete all AI-generated courses (USE WITH CAUTION!)
-- Uncomment to use - this will delete ALL AI-generated courses and related data
-- DELETE FROM courses WHERE is_ai_generated = true;

-- 8. View the most recent course with full details
SELECT 
    c.*,
    (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as module_count,
    (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lesson_count,
    (SELECT COUNT(*) FROM chapters WHERE course_id = c.id) as chapter_count
FROM courses c
ORDER BY c.created_at DESC
LIMIT 1;
