# Final AI

منصة ذكاء اصطناعي احترافية — مساعد ذكي متكامل بواجهة حديثة تضاهي أشهر منصات الذكاء الاصطناعي.

- **الواجهة:** HTML / CSS / JavaScript خالص (قابل للنشر على GitHub Pages)
- **الخلفية:** Cloudflare Worker يتصل بنموذج **NVIDIA Nemotron Ultra** عبر NVIDIA API
- **الأمان:** مفتاح API محفوظ في Cloudflare Secrets ولا يظهر في الواجهة إطلاقًا

---

## المميزات

### المحادثة
- ردود متدفقة (Streaming) مع مؤشر كتابة
- دعم كامل لـ Markdown و تلوين الأكواد (Syntax Highlighting) و LaTeX
- نسخ الرسائل، تعديل الرسائل، إعادة التوليد
- سجل محادثات كامل: محادثة جديدة، بحث، إعادة تسمية، حذف
- تمرير تلقائي ذكي

### الملفات
- رفع بالسحب والإفلات أو بالزر
- قراءة وتحليل: PDF, DOCX, XLSX, CSV, TXT, JSON, XML, HTML, CSS, JS/TS/JSX/TSX, Java, C/C++/C#, Python, PHP, Go, Rust, Kotlin, Swift, ZIP, والصور
- يُستخرج محتوى الملفات ويُرسل للنموذج تلقائيًا

### توليد الأكواد
- عند طلب إنشاء ملف أو مشروع برمجي، تظهر الأكواد كملفات **قابلة للتنزيل** مباشرة (html, css, js, py, java, cpp, php ...)
- تنزيل المشروع كاملًا كملف ZIP

### الأداء والأمان
- تحميل سريع + Lazy Loading + Cache للواجهة (Service Worker)
- Rate Limiting داخل الـ Worker
- CORS مضبوط
- إعادة المحاولة تلقائيًا عند الفشل (Retry)
- وضع داكن / فاتح، تصميم متجاوب (Mobile First)، Glassmorphism

---

## هيكل المشروع

```
├── index.html              # الواجهة الرئيسية
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (كاش الواجهة)
├── assets/
│   ├── css/style.css       # التصميم الكامل (داكن/فاتح، RTL)
│   ├── js/
│   │   ├── config.js       # إعدادات الواجهة (رابط الـ Worker)
│   │   ├── files.js        # قراءة وتحليل الملفات المرفوعة
│   │   └── app.js          # منطق التطبيق الكامل
│   └── img/favicon.svg
└── worker/
    ├── worker.js           # Cloudflare Worker (الاتصال الآمن بـ NVIDIA)
    └── wrangler.toml       # إعدادات النشر
```

---

## خطوة 1 — نشر Cloudflare Worker

### المتطلبات
- حساب [Cloudflare](https://dash.cloudflare.com) (مجاني)
- مفتاح NVIDIA API من [build.nvidia.com](https://build.nvidia.com) (يبدأ بـ `nvapi-`)
- Node.js مثبت على جهازك

### الخطوات

```bash
# 1. ثبت wrangler
npm install -g wrangler

# 2. سجل الدخول إلى Cloudflare
wrangler login

# 3. من داخل مجلد worker/
cd worker

# 4. أضف مفتاح NVIDIA كسر (Secret) — لن يظهر في الكود أبدًا
wrangler secret put NVIDIA_API_KEY
# الصق المفتاح عند الطلب

# 5. انشر الـ Worker
wrangler deploy
```

بعد النشر ستحصل على رابط مثل:

```
https://final-ai-worker.<your-subdomain>.workers.dev
```

### ضبط النطاقات المسموحة (CORS)

في `worker/wrangler.toml` عدّل `ALLOWED_ORIGINS` ليتضمن نطاق موقعك:

```toml
[vars]
ALLOWED_ORIGINS = "https://<username>.github.io"
```

ثم أعد النشر: `wrangler deploy`

> اتركها `*` أثناء التطوير المحلي فقط، وقيّدها قبل الإطلاق.

---

## خطوة 2 — ربط الواجهة بالـ Worker

افتح `assets/js/config.js` وعدّل السطر:

```js
WORKER_URL: 'https://final-ai-worker.<your-subdomain>.workers.dev',
```

---

## خطوة 3 — النشر على GitHub Pages

```bash
# 1. أنشئ مستودعًا جديدًا على GitHub ثم:
git init
git add .
git commit -m "Final AI"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

2. من إعدادات المستودع: **Settings → Pages**
3. اختر **Deploy from a branch** → الفرع `main` → المجلد `/ (root)`
4. احفظ، وسيكون موقعك على:

```
https://<username>.github.io/<repo>/
```

> **ملاحظة:** مجلد `worker/` لا يؤثر على GitHub Pages — يُنشر فقط عبر wrangler.

---

## الإعدادات المتقدمة (worker/wrangler.toml)

| المتغير | الوصف | الافتراضي |
|---------|-------|-----------|
| `NVIDIA_API_KEY` | (Secret) مفتاح NVIDIA — يُضاف عبر `wrangler secret put` | — |
| `ALLOWED_ORIGINS` | النطاقات المسموح لها بالاتصال (مفصولة بفواصل) | `*` |
| `RATE_LIMIT_RPM` | أقصى عدد طلبات لكل IP في الدقيقة | `20` |
| `MODEL_ID` | معرف النموذج في NVIDIA API | `nvidia/nemotron-3-ultra-550b-a55b` |

لتغيير النموذج، عدّل `MODEL_ID` في `wrangler.toml` بأي نموذج متاح في حسابك على build.nvidia.com ثم أعد النشر.

---

## الأمان

- المفتاح محفوظ في **Cloudflare Secrets** — لا يوجد في أي ملف من ملفات الواجهة
- جميع الطلبات تمر عبر الـ Worker فقط
- Rate Limiting لكل IP لمنع إساءة الاستخدام
- حد أقصى لحجم الطلب لمنع الحمولات الضخمة
- CORS مقيّد بالنطاقات المصرح بها

---

## التطوير المحلي

```bash
# الواجهة
npx serve .

# الـ Worker (في نافذة أخرى)
cd worker
wrangler dev
# ثم اجعل WORKER_URL في config.js يشير إلى http://localhost:8787
```

---

## الترخيص

MIT
