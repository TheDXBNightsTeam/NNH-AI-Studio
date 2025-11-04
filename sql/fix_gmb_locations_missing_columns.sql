-- ========================================
-- إصلاح الأعمدة المفقودة في جدول gmb_locations
-- Fix Missing Columns in gmb_locations Table
-- ========================================

-- هذا السكريبت يضيف الأعمدة التي يستخدمها الكود لكنها غير موجودة في الجدول
-- This script adds columns that are used in code but missing from the table

-- ========================================
-- 1. إضافة عمود review_count (عدد التقييمات)
-- ========================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'gmb_locations' 
    AND column_name = 'review_count'
  ) THEN
    ALTER TABLE gmb_locations ADD COLUMN review_count INT DEFAULT 0;
    COMMENT ON COLUMN gmb_locations.review_count IS 'عدد التقييمات - Number of reviews';
  END IF;
END $$;

-- ========================================
-- 2. إضافة عمود response_rate (معدل الرد)
-- ========================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'gmb_locations' 
    AND column_name = 'response_rate'
  ) THEN
    ALTER TABLE gmb_locations ADD COLUMN response_rate DECIMAL(5,2) DEFAULT 0;
    COMMENT ON COLUMN gmb_locations.response_rate IS 'معدل الرد على التقييمات (نسبة مئوية) - Review response rate (percentage)';
  END IF;
END $$;

-- ========================================
-- 3. إضافة عمود is_syncing (حالة المزامنة)
-- ========================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'gmb_locations' 
    AND column_name = 'is_syncing'
  ) THEN
    ALTER TABLE gmb_locations ADD COLUMN is_syncing BOOLEAN DEFAULT false;
    COMMENT ON COLUMN gmb_locations.is_syncing IS 'حالة المزامنة الحالية - Current syncing status';
  END IF;
END $$;

-- ========================================
-- 4. إضافة عمود ai_insights (رؤى الذكاء الاصطناعي)
-- ========================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'gmb_locations' 
    AND column_name = 'ai_insights'
  ) THEN
    ALTER TABLE gmb_locations ADD COLUMN ai_insights TEXT;
    COMMENT ON COLUMN gmb_locations.ai_insights IS 'رؤى وتوصيات الذكاء الاصطناعي - AI-generated insights and recommendations';
  END IF;
END $$;

-- ========================================
-- 5. تحديث البيانات الموجودة
-- ========================================

-- حساب review_count من جدول gmb_reviews
UPDATE gmb_locations l
SET review_count = (
  SELECT COUNT(*)
  FROM gmb_reviews r
  WHERE r.location_id = l.id
)
WHERE review_count = 0 OR review_count IS NULL;

-- حساب response_rate (نسبة الردود)
UPDATE gmb_locations l
SET response_rate = (
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND((COUNT(*) FILTER (WHERE has_reply = true)::DECIMAL / COUNT(*)) * 100, 2)
    END
  FROM gmb_reviews r
  WHERE r.location_id = l.id
)
WHERE response_rate = 0 OR response_rate IS NULL;

-- ========================================
-- 6. إنشاء Indexes للأداء
-- ========================================

CREATE INDEX IF NOT EXISTS idx_gmb_locations_review_count 
  ON gmb_locations(review_count DESC);

CREATE INDEX IF NOT EXISTS idx_gmb_locations_response_rate 
  ON gmb_locations(response_rate DESC);

CREATE INDEX IF NOT EXISTS idx_gmb_locations_is_syncing 
  ON gmb_locations(is_syncing) 
  WHERE is_syncing = true;

-- ========================================
-- 7. إنشاء Function لتحديث التقييمات تلقائياً
-- ========================================

CREATE OR REPLACE FUNCTION update_location_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- تحديث عدد التقييمات
  UPDATE gmb_locations
  SET review_count = (
    SELECT COUNT(*)
    FROM gmb_reviews
    WHERE location_id = COALESCE(NEW.location_id, OLD.location_id)
  ),
  response_rate = (
    SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(*) FILTER (WHERE has_reply = true)::DECIMAL / COUNT(*)) * 100, 2)
      END
    FROM gmb_reviews
    WHERE location_id = COALESCE(NEW.location_id, OLD.location_id)
  )
  WHERE id = COALESCE(NEW.location_id, OLD.location_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. إنشاء Triggers لتحديث الإحصائيات تلقائياً
-- ========================================

-- حذف Trigger القديم إذا كان موجود
DROP TRIGGER IF EXISTS trigger_update_location_review_stats_insert ON gmb_reviews;
DROP TRIGGER IF EXISTS trigger_update_location_review_stats_update ON gmb_reviews;
DROP TRIGGER IF EXISTS trigger_update_location_review_stats_delete ON gmb_reviews;

-- Trigger عند إضافة تقييم جديد
CREATE TRIGGER trigger_update_location_review_stats_insert
  AFTER INSERT ON gmb_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_location_review_stats();

-- Trigger عند تحديث تقييم (مثل إضافة رد)
CREATE TRIGGER trigger_update_location_review_stats_update
  AFTER UPDATE ON gmb_reviews
  FOR EACH ROW
  WHEN (OLD.has_reply IS DISTINCT FROM NEW.has_reply)
  EXECUTE FUNCTION update_location_review_stats();

-- Trigger عند حذف تقييم
CREATE TRIGGER trigger_update_location_review_stats_delete
  AFTER DELETE ON gmb_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_location_review_stats();

-- ========================================
-- 9. التحقق من النجاح
-- ========================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'gmb_locations'
  AND column_name IN ('review_count', 'response_rate', 'is_syncing', 'ai_insights')
ORDER BY column_name;

-- عرض الإحصائيات
SELECT 
  COUNT(*) as total_locations,
  SUM(review_count) as total_reviews,
  ROUND(AVG(response_rate), 2) as avg_response_rate,
  COUNT(*) FILTER (WHERE is_syncing = true) as syncing_locations,
  COUNT(*) FILTER (WHERE ai_insights IS NOT NULL) as locations_with_insights
FROM gmb_locations;

-- ========================================
-- انتهى السكريبت
-- ========================================

SELECT '✅ تم إضافة الأعمدة المفقودة بنجاح!' as status;
