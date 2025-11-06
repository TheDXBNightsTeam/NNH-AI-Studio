# 🔍 مقارنة بنية الجداول: JSON vs Migrations

## 📊 ملخص

تم تحليل ملف `tables_columns_structure.json` ومقارنته مع SQL migrations الموجودة في المشروع.

---

## ⚠️ **مشكلة رئيسية: JSON file غير مكتمل**

### الجداول الموجودة في JSON فقط:
- `activity_logs`
- `ai_autopilot_logs`
- `ai_autopilot_settings`
- `ai_requests`
- `ai_settings`
- `autopilot_logs`
- `autopilot_settings`
- `citation_listings`
- `citation_sources`
- `competitor_tracking`

### الجداول المفقودة من JSON (موجودة في Migrations):
- ❌ `gmb_accounts` - **جدول أساسي**
- ❌ `gmb_locations` - **جدول أساسي**
- ❌ `gmb_reviews` - **جدول أساسي**
- ❌ `gmb_media` - موجود في migrations
- ❌ `gmb_questions` - موجود في migrations
- ❌ `gmb_performance_metrics` - موجود في migrations
- ❌ `gmb_search_keywords` - موجود في migrations
- ❌ `gmb_attributes` - موجود في migrations
- ❌ `gmb_posts` - موجود في migrations
- ❌ `gmb_dashboard_reports` - موجود في migrations

---

## 🔍 مقارنة الجداول الموجودة

### 1. **competitor_tracking**

#### في JSON:
- `id` (uuid)
- `location_id` (uuid) ⚠️
- `competitor_name` (text)
- `competitor_gmb_id` (text)
- `distance_miles` (numeric)
- `average_rating` (numeric)
- `review_count` (integer)
- `post_frequency` (integer)

#### في Migrations:
❌ **لم يتم العثور على جدول `competitor_tracking` في migrations!**

**⚠️ تحذير**: هذا الجدول موجود في JSON لكن لا يوجد migration له. يجب التحقق من:
- هل تم إنشاء الجدول يدوياً؟
- هل يجب إنشاء migration جديد؟
- هل `location_id` يشير إلى `gmb_locations(id)`؟

---

### 2. **ai_autopilot_logs** vs **autopilot_logs**

#### في JSON - `ai_autopilot_logs`:
- `id` (uuid)
- `location_id` (uuid) ⚠️
- `action_type` (text)
- `action_description` (text)
- `status` (text, default: 'success')
- `metadata` (jsonb)
- `created_at` (timestamptz)

#### في JSON - `autopilot_logs`:
- `id` (uuid)
- `location_id` (uuid) ⚠️
- `action_type` (text)
- `status` (text, default: 'pending')
- `details` (jsonb)
- `error_message` (text)
- `created_at` (timestamptz)

**⚠️ تنبيه**: يوجد جدولان مشابهان:
- `ai_autopilot_logs` - في JSON فقط
- `autopilot_logs` - في JSON فقط

**❌ لم يتم العثور على migrations لهما!**

---

### 3. **ai_autopilot_settings** vs **autopilot_settings**

#### في JSON - `ai_autopilot_settings`:
- `id` (uuid)
- `location_id` (uuid) ⚠️
- `is_enabled` (boolean)
- `auto_reply_enabled` (boolean)
- `auto_reply_min_rating` (integer)
- `auto_reply_tone` (text)
- `smart_posting_enabled` (boolean)
- `posting_frequency` (integer)
- `posting_days` (ARRAY)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### في JSON - `autopilot_settings`:
- `id` (uuid)
- `location_id` (uuid) ⚠️
- `user_id` (uuid) ⚠️ **موجود هنا!**
- `is_enabled` (boolean)
- `auto_reply_enabled` (boolean)
- `auto_reply_min_rating` (integer)
- `reply_tone` (text) - **اسم مختلف**: `reply_tone` vs `auto_reply_tone`
- `smart_posting_enabled` (boolean)
- `post_frequency` (integer) - **اسم مختلف**: `post_frequency` vs `posting_frequency`
- `post_days` (jsonb) - **اسم مختلف + نوع**: `post_days` (jsonb) vs `posting_days` (ARRAY)
- `post_times` (jsonb) - **موجود فقط في autopilot_settings**
- `content_preferences` (jsonb) - **موجود فقط في autopilot_settings**
- `competitor_monitoring_enabled` (boolean) - **موجود فقط في autopilot_settings**
- `insights_reports_enabled` (boolean) - **موجود فقط في autopilot_settings**
- `report_frequency` (text) - **موجود فقط في autopilot_settings**
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**⚠️ اختلافات مهمة**:
1. `autopilot_settings` يحتوي على `user_id` لكن `ai_autopilot_settings` لا يحتوي عليه
2. أسماء الأعمدة مختلفة في بعض الحقول
3. `autopilot_settings` أكثر تفصيلاً

**❌ لم يتم العثور على migrations لهما!**

---

### 4. **citation_listings**

#### في JSON:
- `id` (uuid)
- `location_id` (uuid) ⚠️
- `source_id` (uuid)
- `listing_url` (text)
- `business_name` (text)
- `address` (text)
- `phone` (text)
- `status` (text, default: 'pending')
- `last_checked` (timestamptz)
- `consistency_score` (integer)
- `notes` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**❌ لم يتم العثور على migration لـ `citation_listings`!**

---

### 5. **citation_sources**

#### في JSON:
- `id` (uuid)
- `name` (text)
- `url_pattern` (text)
- `domain_authority` (integer)
- `category` (text)
- `is_active` (boolean)
- `logo_url` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**❌ لم يتم العثور على migration لـ `citation_sources`!**

---

### 6. **activity_logs**

#### في JSON:
- `id` (uuid)
- `user_id` (uuid) ⚠️
- `activity_type` (text)
- `activity_message` (text)
- `metadata` (jsonb)
- `actionable` (boolean)
- `created_at` (timestamptz)

**✅ موجود في migrations** (يجب التحقق من التطابق)

---

### 7. **ai_requests**

#### في JSON:
- `id` (uuid)
- `user_id` (uuid) ⚠️
- `location_id` (uuid) ⚠️
- `provider` (text)
- `model` (text)
- `feature` (text)
- `prompt_tokens` (integer)
- `completion_tokens` (integer)
- `total_tokens` (integer)
- `cost_usd` (numeric)
- `latency_ms` (integer)
- `success` (boolean)
- `created_at` (timestamptz)

**❌ لم يتم العثور على migration لـ `ai_requests`!**

---

### 8. **ai_settings**

#### في JSON:
- `id` (uuid)
- `user_id` (uuid) ⚠️
- `provider` (text)
- `api_key` (text)
- `is_active` (boolean)
- `priority` (integer)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**❌ لم يتم العثور على migration لـ `ai_settings`!**

---

## 📋 خلاصة الاختلافات

### ⚠️ **جداول موجودة في JSON لكن لا توجد migrations لها**:
1. ❌ `competitor_tracking` - **لا يوجد migration**
2. ❌ `ai_autopilot_logs` - **لا يوجد migration**
3. ❌ `autopilot_logs` - **لا يوجد migration**
4. ❌ `ai_autopilot_settings` - **لا يوجد migration**
5. ❌ `autopilot_settings` - **لا يوجد migration**
6. ❌ `citation_listings` - **لا يوجد migration**
7. ❌ `citation_sources` - **لا يوجد migration**
8. ❌ `ai_requests` - **لا يوجد migration**
9. ❌ `ai_settings` - **لا يوجد migration**

**⚠️ تحذير**: هذه الجداول قد تكون:
- تم إنشاؤها يدوياً في قاعدة البيانات
- تم نسيانها في migrations
- مخططة لكن لم يتم تنفيذها بعد

### ⚠️ **جداول موجودة في Migrations لكن غير موجودة في JSON**:
1. ❌ `gmb_accounts` - **جدول أساسي** (موجود في `scripts/001_create_gmb_schema.sql`)
2. ❌ `gmb_locations` - **جدول أساسي** (موجود في `scripts/001_create_gmb_schema.sql`)
3. ❌ `gmb_reviews` - **جدول أساسي** (موجود في `scripts/001_create_gmb_schema.sql`)
4. ❌ `gmb_media` - موجود في `20250202_create_gmb_media_table.sql`
5. ❌ `gmb_questions` - موجود في `20250203_create_gmb_questions_table.sql`
6. ❌ `gmb_performance_metrics` - موجود في `20250202_create_gmb_performance_metrics_table.sql`
7. ❌ `gmb_search_keywords` - موجود في `20250202_create_gmb_performance_metrics_table.sql`
8. ❌ `gmb_attributes` - موجود في `20250203_create_gmb_attributes_table.sql`
9. ❌ `gmb_posts` - موجود في `20251031_gmb_posts.sql`
10. ❌ `gmb_dashboard_reports` - موجود في `20251102_fix_production_security_issues.sql`
11. ❌ `content_generations` - موجود في `20250131_content_generations.sql`
12. ❌ `notifications` - موجود في `20250102_notifications.sql`
13. ❌ `youtube_videos` - موجود في `20250131_create_youtube_videos_table.sql`
14. ❌ `youtube_channels` - موجود في `20250102_youtube_tables.sql`

**⚠️ تحذير**: JSON file غير مكتمل - يجب إضافة جميع هذه الجداول.

### ⚠️ **اختلافات في Foreign Keys (user_id, account_id, location_id)**:

#### الجداول التي تحتوي على `location_id` في JSON:
- `competitor_tracking` - ❌ لا يوجد migration
- `ai_autopilot_logs` - ❌ لا يوجد migration
- `autopilot_logs` - ❌ لا يوجد migration
- `ai_autopilot_settings` - ❌ لا يوجد migration
- `autopilot_settings` - ❌ لا يوجد migration (لكن يحتوي على `user_id` أيضاً)
- `citation_listings` - ❌ لا يوجد migration
- `ai_requests` - ❌ لا يوجد migration

#### الجداول التي تحتوي على `user_id` في JSON:
- `activity_logs` - ✅ موجود في migrations
- `autopilot_settings` - ❌ لا يوجد migration
- `ai_requests` - ❌ لا يوجد migration
- `ai_settings` - ❌ لا يوجد migration

#### الجداول التي تحتوي على `gmb_account_id` في Migrations:
- `gmb_locations` - ✅ موجود في migrations
- `gmb_reviews` - ✅ موجود في migrations
- `gmb_media` - ✅ موجود في migrations
- `gmb_questions` - ✅ موجود في migrations
- `gmb_performance_metrics` - ✅ موجود في migrations
- `gmb_search_keywords` - ✅ موجود في migrations
- `gmb_attributes` - ✅ موجود في migrations

---

## 🎯 التوصيات

### 1. **إكمال JSON file**:
   - إضافة جميع جداول `gmb_*` الموجودة في migrations
   - إضافة `gmb_posts` و `gmb_dashboard_reports`

### 2. **إنشاء Migrations للجداول المفقودة**:
   - إنشاء migrations للجداول الموجودة في JSON فقط
   - التأكد من Foreign Keys (user_id, location_id, gmb_account_id)

### 3. **توحيد أسماء الجداول**:
   - حل مشكلة `ai_autopilot_logs` vs `autopilot_logs`
   - حل مشكلة `ai_autopilot_settings` vs `autopilot_settings`
   - تحديد أي واحد يجب استخدامه

### 4. **التحقق من Foreign Keys**:
   - جميع `location_id` يجب أن تشير إلى `gmb_locations(id)`
   - جميع `user_id` يجب أن تشير إلى `auth.users(id)`
   - جميع `gmb_account_id` يجب أن تشير إلى `gmb_accounts(id)`

---

## 📝 ملاحظات مهمة

1. **JSON file غير مكتمل** - يفتقد إلى جداول GMB الأساسية
2. **جداول كثيرة بدون migrations** - قد تكون تم إنشاؤها يدوياً أو تم نسيانها
3. **اختلافات في الأسماء** - `reply_tone` vs `auto_reply_tone`, `post_frequency` vs `posting_frequency`
4. **اختلافات في الأنواع** - `post_days` (jsonb) vs `posting_days` (ARRAY)

---

## 🔑 **تفاصيل Foreign Keys**

### **جداول GMB الأساسية (موجودة في Migrations فقط)**:

#### `gmb_accounts`:
- ✅ `id` (uuid) - Primary Key
- ✅ `user_id` (uuid) - Foreign Key → `auth.users(id)`
- ✅ `account_id` (text) - Google Account ID
- ✅ `account_name` (text)
- ✅ `email` (text) - أُضيف في `20251104_add_email_to_gmb_accounts.sql`
- ✅ `google_account_id` (text) - أُضيف في `20251104_add_email_to_gmb_accounts.sql`
- ✅ `access_token` (text)
- ✅ `refresh_token` (text)
- ✅ `token_expires_at` (timestamptz)
- ✅ `is_active` (boolean)
- ✅ `last_sync` (timestamptz)
- ✅ `settings` (jsonb)
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)

#### `gmb_locations`:
- ✅ `id` (uuid) - Primary Key
- ✅ `gmb_account_id` (uuid) - Foreign Key → `gmb_accounts(id)`
- ✅ `user_id` (uuid) - Foreign Key → `auth.users(id)` - أُضيف في `20251029_add_user_id_columns.sql`
- ✅ `location_id` (text) - Google Location ID
- ✅ `normalized_location_id` (text) - أُضيف في `20250131_fix_database_issues.sql`
- ✅ `location_name` (text)
- ✅ `address` (text)
- ✅ `phone` (text)
- ✅ `website` (text)
- ✅ `category` (text)
- ✅ `rating` (numeric) - أُضيف في `20250201_add_rating_to_gmb_locations.sql`
- ✅ `review_count` (integer)
- ✅ `response_rate` (numeric)
- ✅ `is_active` (boolean)
- ✅ `is_syncing` (boolean)
- ✅ `status` (text) - 'verified', 'pending', 'suspended'
- ✅ `latitude` (numeric)
- ✅ `longitude` (numeric)
- ✅ `business_hours` (jsonb)
- ✅ `metadata` (jsonb)
- ✅ `ai_insights` (text)
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)

#### `gmb_reviews`:
- ✅ `id` (uuid) - Primary Key
- ✅ `location_id` (uuid) - Foreign Key → `gmb_locations(id)`
- ✅ `user_id` (uuid) - Foreign Key → `auth.users(id)` - أُضيف في `20251029_add_user_id_columns.sql`
- ✅ `external_review_id` (text) - تم تغيير الاسم من `review_id` في `20250131_fix_gmb_reviews_columns.sql`
- ✅ `reviewer_name` (text)
- ✅ `rating` (integer)
- ✅ `review_text` (text) - تم تغيير الاسم من `comment` في `20250131_fix_gmb_reviews_columns.sql`
- ✅ `review_reply` (text)
- ✅ `reply_date` (timestamptz) - تم تغيير الاسم من `replied_at` في `20250131_fix_gmb_reviews_columns.sql`
- ✅ `ai_generated_response` (text) - تم تغيير الاسم من `ai_suggested_reply` في `20250131_fix_gmb_reviews_columns.sql`
- ✅ `ai_sentiment` (text) - أُضيف في `20250131_add_missing_columns.sql`
- ✅ `status` (text) - 'new', 'in_progress', 'responded'
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)

#### `gmb_media`:
- ✅ `id` (uuid) - Primary Key
- ✅ `gmb_account_id` (uuid) - Foreign Key → `gmb_accounts(id)`
- ✅ `location_id` (uuid) - Foreign Key → `gmb_locations(id)`
- ✅ `user_id` (uuid) - Foreign Key → `auth.users(id)`
- ✅ `external_media_id` (text) - UNIQUE
- ✅ `type` (text) - 'PHOTO', 'VIDEO'
- ✅ `url` (text)
- ✅ `thumbnail_url` (text)
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)
- ✅ `metadata` (jsonb)
- ✅ `synced_at` (timestamptz)

#### `gmb_questions`:
- ✅ `id` (uuid) - Primary Key
- ✅ `gmb_account_id` (uuid) - Foreign Key → `gmb_accounts(id)`
- ✅ `location_id` (uuid) - Foreign Key → `gmb_locations(id)`
- ✅ `user_id` (uuid) - Foreign Key → `auth.users(id)`
- ✅ `external_question_id` (text) - UNIQUE
- ✅ `question_text` (text)
- ✅ `author_name` (text)
- ✅ `author_type` (text) - 'MERCHANT', 'CUSTOMER', 'GOOGLE_USER'
- ✅ `answer_text` (text)
- ✅ `answered_by` (text)
- ✅ `answered_at` (timestamptz)
- ✅ `answer_status` (text) - 'pending', 'answered', 'draft'
- ✅ `ai_suggested_answer` (text)
- ✅ `ai_confidence_score` (decimal)
- ✅ `upvote_count` (integer)
- ✅ `is_featured` (boolean)
- ✅ `is_hidden` (boolean)
- ✅ `language_code` (text)
- ✅ `metadata` (jsonb)
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)
- ✅ `synced_at` (timestamptz)

#### `gmb_attributes`:
- ✅ `id` (uuid) - Primary Key
- ✅ `gmb_account_id` (uuid) - Foreign Key → `gmb_accounts(id)`
- ✅ `location_id` (uuid) - Foreign Key → `gmb_locations(id)`
- ✅ `user_id` (uuid) - Foreign Key → `auth.users(id)`
- ✅ `attribute_name` (text)
- ✅ `attribute_value` (jsonb)
- ✅ `value_type` (text)
- ✅ `display_name` (text)
- ✅ `group_name` (text)
- ✅ `is_active` (boolean)
- ✅ `is_deprecated` (boolean)
- ✅ `metadata` (jsonb)
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)
- ✅ `synced_at` (timestamptz)
- ✅ UNIQUE(location_id, attribute_name)

#### `gmb_performance_metrics`:
- ✅ `id` (uuid) - Primary Key
- ✅ `gmb_account_id` (uuid) - Foreign Key → `gmb_accounts(id)`
- ✅ `location_id` (uuid) - Foreign Key → `gmb_locations(id)`
- ✅ `user_id` (uuid) - Foreign Key → `auth.users(id)`
- ✅ `metric_type` (text)
- ✅ `metric_date` (date)
- ✅ `metric_value` (bigint)
- ✅ `sub_entity_type` (jsonb)
- ✅ `metadata` (jsonb)
- ✅ `synced_at` (timestamptz)
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)
- ✅ UNIQUE(location_id, metric_date, metric_type)

#### `gmb_search_keywords`:
- ✅ `id` (uuid) - Primary Key
- ✅ `gmb_account_id` (uuid) - Foreign Key → `gmb_accounts(id)`
- ✅ `location_id` (uuid) - Foreign Key → `gmb_locations(id)`
- ✅ `user_id` (uuid) - Foreign Key → `auth.users(id)`
- ✅ `search_keyword` (text)
- ✅ `month_year` (date)
- ✅ `impressions_count` (bigint)
- ✅ `threshold_value` (bigint)
- ✅ `metadata` (jsonb)
- ✅ `synced_at` (timestamptz)
- ✅ `created_at` (timestamptz)
- ✅ `updated_at` (timestamptz)
- ✅ UNIQUE(location_id, search_keyword, month_year)

---

## ⚠️ **ملاحظات مهمة عن Foreign Keys**

### **في جميع جداول GMB (gmb_*)**:
- ✅ جميع الجداول تحتوي على `gmb_account_id` → `gmb_accounts(id)`
- ✅ جميع الجداول تحتوي على `location_id` → `gmb_locations(id)` (باستثناء `gmb_accounts`)
- ✅ جميع الجداول تحتوي على `user_id` → `auth.users(id)`

### **في الجداول الموجودة في JSON فقط**:
- ⚠️ `competitor_tracking.location_id` - يجب أن يشير إلى `gmb_locations(id)` لكن لا يوجد migration للتحقق
- ⚠️ `ai_autopilot_logs.location_id` - يجب أن يشير إلى `gmb_locations(id)` لكن لا يوجد migration للتحقق
- ⚠️ `autopilot_logs.location_id` - يجب أن يشير إلى `gmb_locations(id)` لكن لا يوجد migration للتحقق
- ⚠️ `ai_autopilot_settings.location_id` - يجب أن يشير إلى `gmb_locations(id)` لكن لا يوجد migration للتحقق
- ⚠️ `autopilot_settings.location_id` - يجب أن يشير إلى `gmb_locations(id)` لكن لا يوجد migration للتحقق
- ⚠️ `autopilot_settings.user_id` - يجب أن يشير إلى `auth.users(id)` لكن لا يوجد migration للتحقق
- ⚠️ `citation_listings.location_id` - يجب أن يشير إلى `gmb_locations(id)` لكن لا يوجد migration للتحقق
- ⚠️ `ai_requests.location_id` - يجب أن يشير إلى `gmb_locations(id)` لكن لا يوجد migration للتحقق
- ⚠️ `ai_requests.user_id` - يجب أن يشير إلى `auth.users(id)` لكن لا يوجد migration للتحقق
- ⚠️ `ai_settings.user_id` - يجب أن يشير إلى `auth.users(id)` لكن لا يوجد migration للتحقق

---

## 🔗 المراجع

- Migrations: `supabase/migrations/`
- Schema Reference: `scripts/001_create_gmb_schema.sql`
- TypeScript Types: `lib/types/database.ts`
- Documentation: `GMB_DASHBOARD_REFERENCE.md`

