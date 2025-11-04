-- ========================================
-- إنشاء الجداول المفقودة
-- Create Missing Tables
-- ========================================

-- هذا السكريبت ينشئ الجداول التي يستخدمها الكود لكنها غير موجودة في قاعدة البيانات
-- This script creates tables that are used in code but missing from database

-- ========================================
-- 1. content_generations (AI Content History)
-- ========================================

-- حذف الجدول إذا كان موجود (للتطوير فقط)
-- DROP TABLE IF EXISTS content_generations;

CREATE TABLE IF NOT EXISTS content_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('posts', 'responses', 'descriptions', 'faqs', 'review_reply', 'question_answer', 'other')),
  prompt TEXT,
  tone TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'groq', 'together', 'deepseek', 'anthropic')),
  generated_content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة تعليق على الجدول
COMMENT ON TABLE content_generations IS 'تخزين سجل المحتوى المولد بالذكاء الاصطناعي - AI generated content history';

-- إضافة تعليقات على الأعمدة
COMMENT ON COLUMN content_generations.content_type IS 'نوع المحتوى المولد';
COMMENT ON COLUMN content_generations.prompt IS 'النص المدخل للذكاء الاصطناعي';
COMMENT ON COLUMN content_generations.tone IS 'نبرة الكتابة (friendly, professional, etc)';
COMMENT ON COLUMN content_generations.provider IS 'مزود خدمة الذكاء الاصطناعي';
COMMENT ON COLUMN content_generations.generated_content IS 'المحتوى المولد';
COMMENT ON COLUMN content_generations.metadata IS 'بيانات إضافية (model, tokens, cost, etc)';

-- تفعيل Row Level Security
ALTER TABLE content_generations ENABLE ROW LEVEL SECURITY;

-- سياسة RLS: المستخدمون يمكنهم إدارة محتواهم فقط
CREATE POLICY "Users manage their own content generations"
  ON content_generations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- إنشاء Indexes للأداء
CREATE INDEX idx_content_generations_user_id ON content_generations(user_id);
CREATE INDEX idx_content_generations_created_at ON content_generations(created_at DESC);
CREATE INDEX idx_content_generations_type ON content_generations(content_type);
CREATE INDEX idx_content_generations_provider ON content_generations(provider);

-- Trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_content_generations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_generations_updated_at
  BEFORE UPDATE ON content_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_content_generations_updated_at();

-- ========================================
-- 2. gmb_performance_metrics (Performance Analytics)
-- ========================================

-- حذف الجدول إذا كان موجود (للتطوير فقط)
-- DROP TABLE IF EXISTS gmb_performance_metrics;

CREATE TABLE IF NOT EXISTS gmb_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES gmb_locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gmb_account_id UUID REFERENCES gmb_accounts(id) ON DELETE CASCADE,
  
  -- تاريخ المقاييس
  metric_date DATE NOT NULL,
  
  -- مقاييس الظهور والبحث
  views INT DEFAULT 0,
  searches INT DEFAULT 0,
  search_impressions INT DEFAULT 0,
  maps_views INT DEFAULT 0,
  
  -- مقاييس التفاعل
  actions INT DEFAULT 0,
  calls INT DEFAULT 0,
  direction_requests INT DEFAULT 0,
  website_clicks INT DEFAULT 0,
  booking_clicks INT DEFAULT 0,
  menu_clicks INT DEFAULT 0,
  food_order_clicks INT DEFAULT 0,
  
  -- مقاييس الصور
  photos_views INT DEFAULT 0,
  photos_count INT DEFAULT 0,
  
  -- مقاييس التقييمات
  reviews_count INT DEFAULT 0,
  average_rating DECIMAL(3,2),
  
  -- بيانات إضافية
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- منع التكرار لنفس الموقع في نفس اليوم
  UNIQUE(location_id, metric_date)
);

-- إضافة تعليق على الجدول
COMMENT ON TABLE gmb_performance_metrics IS 'مقاييس أداء المواقع التجارية - Business location performance metrics';

-- إضافة تعليقات على الأعمدة
COMMENT ON COLUMN gmb_performance_metrics.metric_date IS 'تاريخ المقاييس';
COMMENT ON COLUMN gmb_performance_metrics.views IS 'عدد المشاهدات';
COMMENT ON COLUMN gmb_performance_metrics.searches IS 'عدد عمليات البحث';
COMMENT ON COLUMN gmb_performance_metrics.actions IS 'إجمالي الإجراءات';
COMMENT ON COLUMN gmb_performance_metrics.calls IS 'عدد المكالمات';
COMMENT ON COLUMN gmb_performance_metrics.direction_requests IS 'طلبات الاتجاهات';
COMMENT ON COLUMN gmb_performance_metrics.website_clicks IS 'نقرات الموقع الإلكتروني';

-- تفعيل Row Level Security
ALTER TABLE gmb_performance_metrics ENABLE ROW LEVEL SECURITY;

-- سياسة RLS: المستخدمون يمكنهم مشاهدة مقاييسهم فقط
CREATE POLICY "Users view their own performance metrics"
  ON gmb_performance_metrics
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- إنشاء Indexes للأداء
CREATE INDEX idx_performance_user_id ON gmb_performance_metrics(user_id);
CREATE INDEX idx_performance_location_id ON gmb_performance_metrics(location_id);
CREATE INDEX idx_performance_location_date ON gmb_performance_metrics(location_id, metric_date DESC);
CREATE INDEX idx_performance_date ON gmb_performance_metrics(metric_date DESC);
CREATE INDEX idx_performance_account_id ON gmb_performance_metrics(gmb_account_id);

-- Trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_gmb_performance_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gmb_performance_metrics_updated_at
  BEFORE UPDATE ON gmb_performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_gmb_performance_metrics_updated_at();

-- ========================================
-- إنشاء Views مفيدة
-- ========================================

-- View للمقاييس الأخيرة لكل موقع
CREATE OR REPLACE VIEW latest_location_metrics AS
SELECT DISTINCT ON (location_id)
  lm.*,
  l.location_name,
  l.address,
  l.category
FROM gmb_performance_metrics lm
JOIN gmb_locations l ON l.id = lm.location_id
ORDER BY location_id, metric_date DESC;

COMMENT ON VIEW latest_location_metrics IS 'أحدث مقاييس لكل موقع - Latest metrics for each location';

-- View لملخص الأداء الشهري
CREATE OR REPLACE VIEW monthly_performance_summary AS
SELECT 
  user_id,
  location_id,
  DATE_TRUNC('month', metric_date) as month,
  SUM(views) as total_views,
  SUM(searches) as total_searches,
  SUM(actions) as total_actions,
  SUM(calls) as total_calls,
  SUM(direction_requests) as total_directions,
  SUM(website_clicks) as total_website_clicks,
  AVG(average_rating) as avg_rating,
  COUNT(*) as days_count
FROM gmb_performance_metrics
GROUP BY user_id, location_id, DATE_TRUNC('month', metric_date)
ORDER BY month DESC;

COMMENT ON VIEW monthly_performance_summary IS 'ملخص الأداء الشهري - Monthly performance summary';

-- ========================================
-- إدراج بيانات تجريبية (اختياري)
-- ========================================

-- مثال لإدراج بيانات تجريبية (قم بالتعليق عليه في الإنتاج)
/*
INSERT INTO content_generations (user_id, content_type, prompt, tone, provider, generated_content, metadata)
VALUES (
  '9ad81b99-a835-435a-ac4e-3170df5b0455', -- استبدل بـ user_id حقيقي
  'review_reply',
  'شكراً لتقييمك الرائع!',
  'friendly',
  'groq',
  'نشكرك جزيل الشكر على تقييمك الرائع! نحن سعداء جداً بزيارتك لنا ونتطلع لاستقبالك مرة أخرى قريباً.',
  '{"model": "llama-3.1-70b-versatile", "tokens": 150, "cost": 0.001}'::jsonb
);
*/

-- ========================================
-- التحقق من النجاح
-- ========================================

-- عرض الجداول المنشأة
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('content_generations', 'gmb_performance_metrics')
ORDER BY table_name;

-- عرض Indexes المنشأة
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename IN ('content_generations', 'gmb_performance_metrics')
ORDER BY tablename, indexname;

-- عرض RLS Policies
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('content_generations', 'gmb_performance_metrics')
ORDER BY tablename, policyname;

-- ========================================
-- انتهى السكريبت
-- ========================================

-- ملاحظات:
-- 1. قم بتشغيل هذا السكريبت في Supabase SQL Editor
-- 2. تأكد من أن لديك صلاحيات كافية لإنشاء الجداول
-- 3. الجداول محمية بـ RLS تلقائياً
-- 4. تم إنشاء Indexes للأداء الأفضل
-- 5. تم إنشاء Triggers لتحديث updated_at تلقائياً

SELECT '✅ تم إنشاء الجداول المفقودة بنجاح!' as status;
