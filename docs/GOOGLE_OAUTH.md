# Google OAuth — راه‌اندازی ورود / ثبت‌نام

MovieSync با **موبایل + OTP/رمز** طراحی شده. Google **اختیاری** است: ایمیل و نام از خود Google می‌آید؛ در فرم ثبت‌نام فیلد ایمیل نمی‌گیریم.

## آیا Google بگذاریم؟

| | موبایل / OTP | Google |
|---|-------------|--------|
| بازار اصلی (ایران) | ✅ پیش‌فرض | اختیاری |
| ثبت‌نام سریع | OTP | یک کلیک |
| ایمیل | — | خودکار از Google |
| شماره واقعی | ✅ | بعداً در پروفایل (اختیاری) |

**توصیه:** Google را **نگه دارید ولی اختیاری** — اگر `GOOGLE_CLIENT_ID` خالی باشد دکمه اصلاً نشان داده نمی‌شود. برای کاربر بدون Gmail همان OTP/رمز کافی است.

---

## ۱. Google Cloud Console

1. برو به [Google Cloud Console](https://console.cloud.google.com/)
2. پروژه بساز یا انتخاب کن
3. **APIs & Services → OAuth consent screen**
   - User type: External (یا Internal برای Workspace)
   - App name: `MovieSync`
   - Support email + Developer contact
   - Scopes: فقط `email`, `profile`, `openid` (پیش‌فرض کافی است)
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `MovieSync Web`
   - **Authorized JavaScript origins** (هر محیطی که فرانت روی آن است):
     ```
     http://localhost:3000
     https://your-domain.com
     ```
   - **Authorized redirect URIs** — برای `@react-oauth/google` با One Tap معمولاً خالی یا همان origin کافی است؛ اگر popup خطا داد:
     ```
     http://localhost:3000
     https://your-domain.com
     ```
5. **Client ID** و **Client Secret** را کپی کن

> Secret در backend فعلاً برای verify لازم نیست (tokeninfo با ID token کار می‌کند). Secret را برای آینده نگه دار.

---

## ۲. متغیرهای محیطی

### Backend (`backend/.env`)

```env
GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...   # اختیاری فعلاً
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
```

**همان Client ID** در هر دو طرف — مقدار `NEXT_PUBLIC_*` باید دقیقاً برابر `GOOGLE_CLIENT_ID` باشد.

### Docker (`deploy/.env`)

```env
GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=
```

`docker-compose` خودش `NEXT_PUBLIC_GOOGLE_CLIENT_ID` را از همان مقدار می‌گیرد.

---

## ۳. جریان در کد (خلاصه)

```
کاربر → دکمه Google (فرانت)
     → id_token
     → POST /auth/google { "id_token": "..." }
     → backend: tokeninfo + aud check
     → FindOrCreateGoogleUser (email, name, avatar از Google)
     → JWT مثل بقیه کاربران
```

- کاربر جدید: `auth_provider=google`, `email` از Google, `phone_number=google:{sub}` (شناسه داخلی)
- اگر قبلاً با همان email ثبت شده: حساب **لینک** می‌شود (`auth_provider=both`)
- فیلد ایمیل در `/signup` لازم نیست

---

## ۴. تست محلی

```bash
# backend
cd backend && go run ./cmd/server

# frontend
cd frontend && npm run dev
```

1. `.env` / `.env.local` را پر کن
2. `/login` → «ادامه با Google»
3. با حساب Gmail تست کن
4. در MongoDB کاربر باید `google_id`, `email`, `display_name` داشته باشد

---

## ۵. عیب‌یابی

| مشکل | راه‌حل |
|------|--------|
| دکمه Google نیست | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` خالی است — عمدی است |
| `Google sign-in is not configured` | `GOOGLE_CLIENT_ID` در backend خالی |
| `token audience mismatch` | Client ID فرانت و بک **یکی نیست** |
| `origin_mismatch` | origin در Google Console اضافه نشده |
| `403 access_denied` | OAuth consent در حالت Testing — Test users اضافه کن |
| Popup blocked | مرورگر popup را allow کن |

---

## ۶. امنیت (production)

- فقط HTTPS روی دامنه واقعی
- Client ID در فرانت public است — طبیعی است
- `login_enabled` در تنظیمات ادمین می‌تواند ورود را قطع کند
- Rate limit روی `POST /auth/google` (مثل login)
