# 🔧 دليل مزامنة بنية قاعدة البيانات

## 📋 نظرة عامة

هذا الدليل يشرح كيفية جعل بنية قاعدة البيانات متطابقة 100% مع ملف `tables_columns_structure.json` و migrations.

---

## 📁 الملفات المُنشأة

### 1. **Migrations (يجب تشغيلها أولاً)**

#### `supabase/migrations/20250105000000_create_missing_tables_from_json.sql`
**الوظيفة**: إنشاء الجداول المفقودة من JSON
- ✅ `competitor_tracking`
- ✅ `autopilot_logs`
- ✅ `autopilot_settings`
- ✅ `citation_listings`
- ✅ `citation_sources`
- ✅ `ai_requests`
- ✅ `ai_settings`

**يتضمن**:
- إنشاء الجداول مع جميع الأعمدة
- Foreign Keys صحيحة
- Indexes للأداء
- RLS Policies
- Triggers للـ `updated_at`

#### `supabase/migrations/20250105000001_fix_foreign_keys_and_constraints.sql`
**الوظيفة**: إصلاح Foreign Keys والـ Constraints
- إضافة `user_id` للجداول التي تحتاجها
- إصلاح Foreign Key constraints
- إضافة Unique constraints
- تحديث RLS policies

---

### 2. **SQL Scripts (للتحقق والإصلاح)**

#### `sql/verify_schema_completeness.sql`
**الوظيفة**: التحقق من اكتمال البنية
- ✅ التحقق من وجود جميع الجداول
- ✅ عرض جميع Foreign Keys
- ✅ اكتشاف Foreign Keys المفقودة
- ✅ ملخص الجداول حسب الفئة

#### `sql/fix_all_schema_issues.sql`
**الوظيفة**: إصلاح جميع مشاكل البنية
- ✅ إضافة الأعمدة المفقودة
- ✅ إصلاح جميع Foreign Keys
- ✅ تفعيل RLS على جميع الجداول
- ✅ إنشاء Indexes للـ Foreign Keys

---

## 🚀 خطوات التنفيذ

### الخطوة 1: تشغيل Migrations

#### في Supabase Dashboard:

1. افتح **Supabase Dashboard** → مشروعك
2. اذهب إلى **SQL Editor**
3. انسخ محتوى `supabase/migrations/20250105000000_create_missing_tables_from_json.sql`
4. الصقه في SQL Editor
5. اضغط **Run**
6. انتظر حتى يكتمل التنفيذ ✅

7. انسخ محتوى `supabase/migrations/20250105000001_fix_foreign_keys_and_constraints.sql`
8. الصقه في SQL Editor
9. اضغط **Run**
10. انتظر حتى يكتمل التنفيذ ✅

---

### الخطوة 2: التحقق من البنية

1. في **SQL Editor**، انسخ محتوى `sql/verify_schema_completeness.sql`
2. الصقه واضغط **Run**
3. راجع النتائج:
   - ✅ يجب أن ترى "All expected tables exist!"
   - ✅ يجب أن ترى جميع Foreign Keys
   - ✅ يجب ألا ترى أي جداول بدون Foreign Keys

---

### الخطوة 3: إصلاح أي مشاكل متبقية

1. في **SQL Editor**، انسخ محتوى `sql/fix_all_schema_issues.sql`
2. الصقه واضغط **Run**
3. راجع الرسائل (NOTICE messages):
   - يجب أن ترى رسائل عن أي إصلاحات تمت
   - إذا كان كل شيء صحيح، لن ترى أخطاء

---

### الخطوة 4: التحقق النهائي

1. شغّل `sql/verify_schema_completeness.sql` مرة أخرى
2. تأكد من:
   - ✅ جميع الجداول موجودة
   - ✅ جميع Foreign Keys صحيحة
   - ✅ لا توجد جداول بدون Foreign Keys

---

## 📊 ملخص التغييرات

### الجداول الجديدة:
1. ✅ `competitor_tracking` - تتبع المنافسين
2. ✅ `autopilot_logs` - سجلات Autopilot
3. ✅ `autopilot_settings` - إعدادات Autopilot
4. ✅ `citation_listings` - قوائم Citations
5. ✅ `citation_sources` - مصادر Citations
6. ✅ `ai_requests` - طلبات AI
7. ✅ `ai_settings` - إعدادات AI

### Foreign Keys المُضافة/المُصلحة:
- ✅ `competitor_tracking.location_id` → `gmb_locations(id)`
- ✅ `autopilot_logs.location_id` → `gmb_locations(id)`
- ✅ `autopilot_logs.user_id` → `auth.users(id)`
- ✅ `autopilot_settings.location_id` → `gmb_locations(id)`
- ✅ `autopilot_settings.user_id` → `auth.users(id)`
- ✅ `citation_listings.location_id` → `gmb_locations(id)`
- ✅ `citation_listings.user_id` → `auth.users(id)`
- ✅ `ai_requests.user_id` → `auth.users(id)`
- ✅ `ai_requests.location_id` → `gmb_locations(id)`
- ✅ `ai_settings.user_id` → `auth.users(id)`

---

## ⚠️ ملاحظات مهمة

### 1. **ترتيب التنفيذ**
- يجب تشغيل migrations بالترتيب (حسب التاريخ)
- `20250105000000` قبل `20250105000001`

### 2. **البيانات الموجودة**
- إذا كانت هناك بيانات موجودة، سيتم تحديث `user_id` تلقائياً من `location_id`
- تأكد من أن جميع `location_id` تشير إلى locations صحيحة

### 3. **RLS Policies**
- جميع الجداول الجديدة لديها RLS مفعّل
- Policies تستخدم `user_id` للأداء الأفضل

### 4. **Indexes**
- تم إنشاء indexes تلقائياً لجميع Foreign Keys
- تم إنشاء indexes إضافية للأعمدة المستخدمة بكثرة

---

## 🔍 التحقق من النجاح

بعد تشغيل جميع السكريبتات، تحقق من:

### 1. جميع الجداول موجودة:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### 2. جميع Foreign Keys صحيحة:
```sql
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

### 3. RLS مفعّل:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

---

## 🐛 استكشاف الأخطاء

### إذا ظهرت أخطاء:

1. **"relation already exists"**:
   - الجدول موجود مسبقاً
   - تحقق من البنية الحالية
   - قد تحتاج لتعديل السكريبت

2. **"foreign key constraint violation"**:
   - تأكد من وجود البيانات المطلوبة
   - تحقق من `location_id` و `user_id` صحيحة

3. **"permission denied"**:
   - تأكد من صلاحيات المستخدم
   - استخدم service_role key إذا لزم الأمر

---

## 📝 الخطوات التالية

بعد اكتمال المزامنة:

1. ✅ تحديث `tables_columns_structure.json` لإضافة جميع جداول `gmb_*`
2. ✅ تحديث TypeScript types في `lib/types/database.ts`
3. ✅ اختبار جميع الوظائف المتعلقة بالجداول الجديدة
4. ✅ تحديث التوثيق

---

## 🔗 الملفات المرجعية

- Migrations: `supabase/migrations/`
- Verification Script: `sql/verify_schema_completeness.sql`
- Fix Script: `sql/fix_all_schema_issues.sql`
- Comparison Report: `DATABASE_SCHEMA_COMPARISON.md`

---

## ✅ Checklist

- [ ] تشغيل `20250105000000_create_missing_tables_from_json.sql`
- [ ] تشغيل `20250105000001_fix_foreign_keys_and_constraints.sql`
- [ ] التحقق باستخدام `verify_schema_completeness.sql`
- [ ] إصلاح أي مشاكل باستخدام `fix_all_schema_issues.sql`
- [ ] التحقق النهائي
- [ ] اختبار الوظائف

---

**بعد اكتمال جميع الخطوات، ستكون قاعدة البيانات متطابقة 100% مع JSON و migrations!** 🎉

