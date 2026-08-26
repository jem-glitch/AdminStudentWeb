# AdminStudentWeb

Website مستقل لإدارة محتوى أكاديمية مسار.

## الوظائف

يحتوي الموقع على تسجيل دخول عبر Supabase Auth، والتحقق من صلاحية Admin من جدول `admin_profiles`، وإدارة الكورسات والتصنيفات والدروس وحالات النشر. عند إضافة درس، يدخل المدير العنوان والرابط والترتيب والصورة والوصف اختيارياً، ويستخرج النظام `youtube_video_id` محلياً من رابط YouTube دون استخدام YouTube Data API أو تنزيل أي فيديو.

## التشغيل

```bash
pnpm install
pnpm dev
```

افتح المسار `/admin-web` في المتصفح.

## المتغيرات المطلوبة

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

لا تضع `SUPABASE_SECRET_KEY` في كود المتصفح أو المستودع. يجب تطبيق مخطط `supabase_migration.sql` على مشروع Supabase، ثم إنشاء مستخدم في Supabase Auth وإضافة `user_id` الخاص به إلى `public.admin_profiles`.

## ملاحظات أمنية

المفاتيح والأسرار لا تُحفظ في GitHub. صلاحيات التعديل محمية بواسطة Supabase Row Level Security، بينما القراءة العامة تقتصر على المحتوى المنشور.

## Google/Gmail وNetlify

فعّل Google Provider من Supabase Authentication، وضع Client ID وClient Secret في إعدادات Supabase فقط. أضف رابط Netlify النهائي ضمن Redirect URLs في Supabase، مثل `https://your-site.netlify.app/admin-web`. في Netlify استخدم أمر البناء `pnpm install --frozen-lockfile && pnpm build:web` ومجلد النشر `dist`. لا تستخدم نسخة تطبيق الطالب في Netlify؛ هذا المستودع خاص بالموقع الإداري فقط.
