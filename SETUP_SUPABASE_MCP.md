# إعداد MCP Servers لـ GitHub Copilot

## 📋 نظرة عامة
MCP (Model Context Protocol) يسمح لـ GitHub Copilot بالوصول المباشر لموارد المشروع، مما يمكّن الـ AI من:

### 🗄️ **Supabase MCP:**
- قراءة schema الجداول
- فهم العلاقات بين الجداول
- توليد SQL queries دقيقة
- اقتراح migrations بناءً على البنية الحالية

### 📁 **Filesystem MCP:**
- قراءة وكتابة الملفات في المشروع
- فهم بنية المجلدات
- البحث في الملفات

### 🔀 **Git MCP:**
- قراءة Git history
- فهم التغييرات والـ commits
- اقتراح commits منظمة

---

## ⚡ الإعداد السريع

### الخطوة 1️⃣: تحديث ملف MCP Configuration

الملف موجود في:
```
~/Library/Application Support/Code/User/mcp.json
```

**المحتوى المحدث (مع جميع الـ MCP Servers):**
```json
{
	"servers": {
		"github/github-mcp-server": {
			"type": "http",
			"url": "https://api.githubcopilot.com/mcp/",
			"gallery": "https://api.mcp.github.com/2025-09-15/v0/servers/ab12cd34-5678-90ef-1234-567890abcdef",
			"version": "0.13.0"
		},
		"supabase": {
			"command": "npx",
			"args": ["-y", "@supabase/mcp-server"],
			"env": {
				"SUPABASE_URL": "ضع_هنا_NEXT_PUBLIC_SUPABASE_URL",
				"SUPABASE_SERVICE_ROLE_KEY": "ضع_هنا_SUPABASE_SERVICE_ROLE_KEY"
			}
		},
		"filesystem": {
			"command": "npx",
			"args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/nnh-ai-studio/Desktop/nnh_new-1"]
		},
		"git": {
			"command": "npx",
			"args": ["-y", "@modelcontextprotocol/server-git", "--repository", "/Users/nnh-ai-studio/Desktop/nnh_new-1"]
		}
	},
	"inputs": []
}
```

### الخطوة 2️⃣: إضافة القيم الفعلية

**احصل على القيم من:**
1. افتح مشروع Supabase على https://supabase.com
2. اذهب إلى **Settings** → **API**
3. انسخ:
   - **Project URL** → ضعها في `SUPABASE_URL`
   - **service_role key** (⚠️ سرية!) → ضعها في `SUPABASE_SERVICE_ROLE_KEY`

**مثال:**
```json
{
	"servers": {
		"github/github-mcp-server": {
			"type": "http",
			"url": "https://api.githubcopilot.com/mcp/",
			"gallery": "https://api.mcp.github.com/2025-09-15/v0/servers/ab12cd34-5678-90ef-1234-567890abcdef",
			"version": "0.13.0"
		},
		"supabase": {
			"command": "npx",
			"args": ["-y", "@supabase/mcp-server"],
			"env": {
				"SUPABASE_URL": "https://abcdefghijklmnop.supabase.co",
				"SUPABASE_SERVICE_ROLE_KEY": "eyJhbGc..._your_actual_key_here"
			}
		}
	},
	"inputs": []
}
```

### الخطوة 3️⃣: إعادة تشغيل VS Code

```bash
# أغلق VS Code تماماً
# ثم افتحه من جديد
code .
```

---

## ✅ التحقق من التفعيل

بعد إعادة التشغيل، اسأل GitHub Copilot:

```
"ما هي الجداول الموجودة في قاعدة البيانات؟"
```

أو:

```
"اعرض schema جدول gmb_locations"
```

إذا أجاب بمعلومات دقيقة عن قاعدة بياناتك، فالإعداد نجح! ✨

---

## 🔒 ملاحظات الأمان

⚠️ **مهم جداً:**
- `service_role_key` هو مفتاح خطير يتجاوز Row Level Security
- **لا تشاركه أبداً** في git أو مع أي شخص
- هذا الإعداد للاستخدام المحلي فقط
- الملف `mcp.json` محلي ولن يُدفع لـ git

---

## 🛠️ استكشاف الأخطاء

### المشكلة: Copilot لا يرى قاعدة البيانات
**الحل:**
1. تأكد من صحة `SUPABASE_URL` و `SUPABASE_SERVICE_ROLE_KEY`
2. تأكد من أن JSON formatting صحيح (بدون فواصل زائدة)
3. أعد تشغيل VS Code تماماً

### المشكلة: خطأ في npx
**الحل:**
```bash
# تأكد من تثبيت Node.js و npm
node --version
npm --version

# جرب تثبيت الحزمة يدوياً
npm install -g @supabase/mcp-server
```

### المشكلة: Connection timeout
**الحل:**
- تأكد من اتصال الإنترنت
- تأكد من أن project URL صحيح
- تحقق من firewall settings

---

## 📚 القدرات بعد التفعيل

### 🗄️ من Supabase MCP:
- ✅ قراءة structure الجداول بالكامل
- ✅ فهم العلاقات (Foreign Keys)
- ✅ رؤية RLS Policies
- ✅ اقتراح indexes للأداء
- ✅ توليد migrations دقيقة
- ✅ كتابة queries معقدة بدقة

### 📁 من Filesystem MCP:
- ✅ قراءة وكتابة الملفات
- ✅ إنشاء مجلدات جديدة
- ✅ البحث في الملفات
- ✅ فهم بنية المشروع

### 🔀 من Git MCP:
- ✅ قراءة Git history
- ✅ رؤية التغييرات الحالية
- ✅ فهم الـ commits السابقة
- ✅ اقتراح commit messages منظمة

---

## 🎯 أمثلة للاستخدام

بعد التفعيل، يمكنك طلب:

```
"أنشئ migration لإضافة عمود phone_verified إلى جدول profiles"
```

```
"اكتب query لجلب جميع المواقع مع عدد المراجعات لكل موقع"
```

```
"اقترح indexes لتحسين أداء جدول gmb_reviews"
```

```
"ما هي RLS policies المفعلة على جدول oauth_tokens؟"
```

---

## 📞 الدعم

إذا واجهت مشاكل:
1. تحقق من [Supabase MCP Documentation](https://github.com/supabase/mcp-server)
2. راجع [VS Code MCP Guide](https://code.visualstudio.com/docs/copilot/copilot-mcp)

---

**تم الإعداد في:** 2025-11-04  
**الحالة:** ✅ جاهز للاستخدام بعد إضافة القيم الفعلية
