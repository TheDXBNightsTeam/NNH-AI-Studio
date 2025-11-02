# تشغيل GMB Audit عبر Supabase CLI

## المتطلبات

1. تثبيت Supabase CLI:
```bash
npm install -g supabase
```

2. تسجيل الدخول:
```bash
supabase login
```

3. تحديد معرف المشروع:
```bash
export SUPABASE_PROJECT_REF=your-project-ref
```

أو يمكنك الحصول على معرف المشروع من:
- Supabase Dashboard → Settings → General → Reference ID

## الاستخدام

### الطريقة 1: تشغيل جميع الاستعلامات دفعة واحدة

```bash
./scripts/run_gmb_audit.sh
```

### الطريقة 2: تشغيل استعلام واحد

```bash
./scripts/run_single_audit.sh sql/gmb_quick_audit.sql
```

أو:

```bash
supabase db execute -f sql/gmb_quick_audit.sql --project-ref YOUR_PROJECT_REF
```

## الملفات المتاحة

1. **sql/gmb_quick_audit.sql** - تقرير سريع (موصى به للبداية)
2. **sql/gmb_critical_issues_analysis.sql** - تحليل المشاكل الحرجة
3. **sql/gmb_audit_summary_report.sql** - تقرير شامل مع إحصائيات JSON
4. **sql/gmb_data_audit_logic_checks.sql** - جميع الفحوصات التفصيلية

## أمثلة

```bash
# تشغيل Quick Audit
supabase db execute -f sql/gmb_quick_audit.sql --project-ref YOUR_PROJECT_REF

# تشغيل Critical Issues Analysis
supabase db execute -f sql/gmb_critical_issues_analysis.sql --project-ref YOUR_PROJECT_REF

# تشغيل Summary Report
supabase db execute -f sql/gmb_audit_summary_report.sql --project-ref YOUR_PROJECT_REF
```

## حفظ النتائج في ملف

```bash
# حفظ النتائج في ملف نصي
supabase db execute -f sql/gmb_quick_audit.sql --project-ref YOUR_PROJECT_REF > audit_results.txt

# حفظ النتائج في ملف JSON (للتقارير)
supabase db execute -f sql/gmb_audit_summary_report.sql --project-ref YOUR_PROJECT_REF > audit_results.json
```

## استكشاف الأخطاء

إذا واجهت مشاكل:

1. **خطأ في الاتصال**:
```bash
supabase login
```

2. **خطأ في معرف المشروع**:
```bash
supabase projects list
# ثم استخدم Reference ID من القائمة
export SUPABASE_PROJECT_REF=your-project-ref
```

3. **التحقق من الإعدادات**:
```bash
supabase status
```

