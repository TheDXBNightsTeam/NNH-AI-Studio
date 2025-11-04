-- ========================================
-- قاعدة بيانات Supabase - استعلامات شاملة
-- Supabase Database - Comprehensive Queries
-- ========================================

-- 1️⃣ عرض جميع الجداول في قاعدة البيانات
-- List all tables in the database
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2️⃣ عرض جميع الأعمدة لكل جدول
-- Show all columns for each table
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3️⃣ عدد السجلات في كل جدول
-- Count records in each table
SELECT 
  'gmb_accounts' as table_name,
  COUNT(*) as record_count
FROM gmb_accounts
UNION ALL
SELECT 'gmb_locations', COUNT(*) FROM gmb_locations
UNION ALL
SELECT 'gmb_reviews', COUNT(*) FROM gmb_reviews
UNION ALL
SELECT 'gmb_posts', COUNT(*) FROM gmb_posts
UNION ALL
SELECT 'gmb_insights', COUNT(*) FROM gmb_insights
UNION ALL
SELECT 'gmb_questions', COUNT(*) FROM gmb_questions
UNION ALL
SELECT 'gmb_media', COUNT(*) FROM gmb_media
UNION ALL
SELECT 'gmb_attributes', COUNT(*) FROM gmb_attributes
UNION ALL
SELECT 'oauth_tokens', COUNT(*) FROM oauth_tokens
UNION ALL
SELECT 'oauth_states', COUNT(*) FROM oauth_states
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'youtube_drafts', COUNT(*) FROM youtube_drafts
UNION ALL
SELECT 'youtube_videos', COUNT(*) FROM youtube_videos
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
ORDER BY record_count DESC;

-- 4️⃣ عرض جميع العلاقات (Foreign Keys)
-- Show all foreign key relationships
SELECT
  tc.table_schema, 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 5️⃣ عرض جميع الـ Indexes
-- Show all indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 6️⃣ عرض سياسات RLS لكل جدول
-- Show RLS policies for each table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 7️⃣ حجم كل جدول في قاعدة البيانات
-- Show size of each table
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 8️⃣ عرض تفاصيل جدول gmb_accounts
-- GMB Accounts table details
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'gmb_accounts'
ORDER BY ordinal_position;

-- 9️⃣ عرض تفاصيل جدول gmb_locations
-- GMB Locations table details
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'gmb_locations'
ORDER BY ordinal_position;

-- 🔟 عرض تفاصيل جدول gmb_reviews
-- GMB Reviews table details
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'gmb_reviews'
ORDER BY ordinal_position;

-- 1️⃣1️⃣ التحقق من تفعيل RLS على جميع الجداول
-- Check if RLS is enabled on all tables
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 1️⃣2️⃣ عرض جميع الـ Triggers
-- Show all triggers
SELECT
  trigger_schema,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 1️⃣3️⃣ عرض جميع الـ Functions
-- Show all functions
SELECT
  routine_schema,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 1️⃣4️⃣ البحث عن جداول تحتوي على أعمدة معينة
-- Find tables containing specific columns
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('user_id', 'created_at', 'updated_at')
ORDER BY table_name, column_name;

-- 1️⃣5️⃣ إحصائيات عامة عن قاعدة البيانات
-- General database statistics
SELECT
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tables,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public') as total_columns,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies;

-- 1️⃣6️⃣ البيانات الأخيرة المضافة في كل جدول (إذا كان العمود موجود)
-- Latest data added to each table (if created_at exists)
SELECT 'gmb_accounts' as table_name, MAX(created_at) as latest_record FROM gmb_accounts
UNION ALL
SELECT 'gmb_locations', MAX(created_at) FROM gmb_locations
UNION ALL
SELECT 'gmb_reviews', MAX(created_at) FROM gmb_reviews
UNION ALL
SELECT 'gmb_questions', MAX(created_at) FROM gmb_questions
UNION ALL
SELECT 'gmb_media', MAX(created_at) FROM gmb_media
UNION ALL
SELECT 'oauth_tokens', MAX(created_at) FROM oauth_tokens
UNION ALL
SELECT 'oauth_states', MAX(created_at) FROM oauth_states
UNION ALL
SELECT 'profiles', MAX(created_at) FROM profiles
UNION ALL
SELECT 'youtube_videos', MAX(created_at) FROM youtube_videos
ORDER BY latest_record DESC NULLS LAST;

-- 1️⃣7️⃣ عرض الأعمدة NULL في جدول معين
-- Show NULL columns in a specific table
SELECT 
  column_name,
  COUNT(*) FILTER (WHERE gmb_accounts.* IS NULL) as null_count
FROM information_schema.columns
CROSS JOIN gmb_accounts
WHERE table_schema = 'public' 
  AND table_name = 'gmb_accounts'
GROUP BY column_name;

-- 1️⃣8️⃣ البحث عن الجداول المرتبطة بـ user_id
-- Find tables linked to user_id
SELECT DISTINCT
  table_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'user_id'
ORDER BY table_name;

-- 1️⃣9️⃣ عرض جميع الأعمدة من نوع JSONB
-- Show all JSONB columns
SELECT 
  table_name,
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND data_type = 'jsonb'
ORDER BY table_name, column_name;

-- 2️⃣0️⃣ عرض المستخدمين وعدد الحسابات والمواقع لكل منهم
-- Show users with their account and location counts
SELECT 
  p.id,
  p.email,
  p.full_name,
  COUNT(DISTINCT ga.id) as gmb_accounts_count,
  COUNT(DISTINCT gl.id) as locations_count,
  COUNT(DISTINCT gr.id) as reviews_count
FROM profiles p
LEFT JOIN gmb_accounts ga ON ga.user_id = p.id
LEFT JOIN gmb_locations gl ON gl.user_id = p.id
LEFT JOIN gmb_reviews gr ON gr.user_id = p.id
GROUP BY p.id, p.email, p.full_name
ORDER BY gmb_accounts_count DESC, locations_count DESC;

-- ========================================
-- نهاية الاستعلامات
-- End of Queries
-- ========================================
