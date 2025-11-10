# 🔍 NNH Code Auditor - دليل الاستخدام

## 📋 نظرة عامة

NNH Code Auditor هو Extension قوي يستخدم **Claude Sonnet 4.5** لتحليل ومراجعة الكود تلقائياً، مع إمكانية **تطبيق الإصلاحات تلقائياً** على الملفات!

---

## ✨ المميزات

- ✅ تحليل شامل للكود (Frontend, Backend, Security, Performance, Database)
- ✅ تصنيف المشاكل حسب الأولوية (Critical, High, Medium, Low)
- ✅ إصلاحات جاهزة مع كود copy-paste ready
- ✅ **تطبيق الإصلاحات تلقائياً** على الملفات
- ✅ Backup تلقائي قبل التعديل
- ✅ واجهة مستخدم سهلة وبسيطة

---

## 🚀 كيفية الاستخدام

### الطريقة 1: واجهة المستخدم (UI)

1. **افتح Extension في المتصفح:**
   ```
   http://localhost:3001
   ```

2. **اختر Component للتدقيق:**
   - Dashboard
   - Locations
   - Reviews
   - Questions

3. **انتظر النتائج** (30-60 ثانية)

4. **راجع التقرير:**
   - عدد المشاكل حسب الأولوية
   - تفاصيل كل مشكلة
   - كود الإصلاح المقترح

5. **طبق الإصلاحات:**
   - اضغط "Apply All Fixes" لتطبيق الإصلاحات تلقائياً
   - أو انسخ الكود والصقه يدوياً

---

### الطريقة 2: API مباشر

#### 1️⃣ Health Check
تحقق من عمل Extension:

```bash
curl http://localhost:3001/api/health
```

**النتيجة:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "projectPath": "/home/runner/workspace",
  "services": {
    "claude": "✅ Connected",
    "fileHandler": "✅ Ready",
    "prompts": "✅ Loaded"
  }
}
```

---

#### 2️⃣ تدقيق Dashboard

```bash
curl -X POST http://localhost:3001/api/audit/dashboard
```

**النتيجة:**
```json
{
  "success": true,
  "component": "dashboard",
  "analysis": {
    "content": "## تقرير التدقيق الكامل...",
    "usage": {
      "inputTokens": 12000,
      "outputTokens": 8000,
      "totalCost": "0.1560"
    }
  },
  "filesAnalyzed": 8,
  "totalLines": 2500,
  "duration": "45.3s"
}
```

---

#### 3️⃣ تطبيق الإصلاحات

```bash
curl -X POST http://localhost:3001/api/fix/apply \
  -H "Content-Type: application/json" \
  -d '{
    "fixes": [
      {
        "file": "components/dashboard/stats-cards.tsx",
        "oldCode": "const handleClick = () => {",
        "newCode": "const handleClick = useCallback(() => {"
      }
    ]
  }'
```

**النتيجة:**
```json
{
  "success": true,
  "applied": 1,
  "failed": 0,
  "results": [
    {
      "success": true,
      "file": "components/dashboard/stats-cards.tsx",
      "linesChanged": 1
    }
  ]
}
```

---

## 🔍 نطاق التدقيق

Extension يحلل:

### Frontend:
- ✅ Component structure
- ✅ State management (useState, useEffect, custom hooks)
- ✅ Responsive design
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Performance (bundle size, lazy loading)
- ✅ TypeScript type safety

### Backend (API Routes):
- ✅ Authentication & authorization
- ✅ Input validation
- ✅ Error handling
- ✅ Database queries (N+1, indexes, efficiency)
- ✅ Rate limiting
- ✅ Security (XSS, SQL injection, CSRF)

### Database:
- ✅ Schema design
- ✅ Indexes (missing or inefficient)
- ✅ RLS policies
- ✅ Query optimization

---

## 💰 التكلفة

- **Claude Sonnet 4.5 Pricing:**
  - $3 لكل 1M input tokens
  - $15 لكل 1M output tokens

- **تكلفة تقريبية لكل تدقيق:**
  - Dashboard audit: ~$0.15 - $0.30
  - Component audit: ~$0.05 - $0.15

---

## ⚠️ ملاحظات مهمة

### Backups تلقائية:
Extension يعمل **backup تلقائي** قبل أي تعديل:
```
components/dashboard/stats-cards.tsx.backup-2025-11-05T04-25-00-000Z
```

### التحقق قبل التطبيق:
- ✅ راجع الإصلاحات المقترحة دائماً
- ✅ تأكد من أن الكود منطقي
- ✅ اختبر بعد التطبيق

### الملفات المدعومة حالياً:
Extension مُعد لتحليل:
- `app/[locale]/(dashboard)/dashboard/page.tsx`
- `components/dashboard/*.tsx`
- `app/api/dashboard/*/route.ts`

يمكن تعديل `src/fileHandler.js` لإضافة مكونات أخرى.

---

## 🛠️ استكشاف الأخطاء

### Extension لا يعمل؟
```bash
# تحقق من الـ logs
cat /tmp/logs/Code_Auditor_*.log

# تحقق من port 3001
lsof -i :3001
```

### Claude API Error?
```bash
# تحقق من API Key
echo $ANTHROPIC_API_KEY

# تأكد من وجوده في Secrets
```

### الملفات غير موجودة؟
تأكد من `PROJECT_PATH` في `.env`:
```bash
cat code-auditor/.env
```

---

## 📚 موارد إضافية

- [Anthropic API Docs](https://docs.anthropic.com)
- [Claude Sonnet 4.5 Info](https://www.anthropic.com/claude)
- [Replit Extensions](https://docs.replit.com/extensions)

---

## 💡 نصائح للاستخدام الأمثل

1. **ابدأ بـ Critical Issues**
   - ركز على المشاكل الحمراء 🔴 أولاً
   - ثم الصفراء 🟡
   - ثم البقية

2. **اختبر بعد كل إصلاح**
   - لا تطبق كل الإصلاحات مرة واحدة
   - اختبر واحدة واحدة

3. **استخدم Backups**
   - إذا حصلت مشكلة، استعد من Backup
   - الـ backups موجودة بجانب الملف الأصلي

4. **راجع الكود**
   - Claude ذكي جداً لكن مو معصوم
   - دائماً راجع الإصلاحات قبل التطبيق

---

## 🎉 الخلاصة

NNH Code Auditor يوفر لك:
- ✅ تدقيق احترافي للكود
- ✅ إصلاحات جاهزة
- ✅ توفير الوقت والجهد
- ✅ تحسين جودة الكود

**ابدأ التدقيق الآن: http://localhost:3001** 🚀
