# تقرير التدقيق الشامل لحالة مشروع أكاديمية مسار

**تاريخ التدقيق:** 26 أغسطس 2026

**نطاق التدقيق:** مستودع `AdminStudentWeb`، مستودع Student App المحلي، ملف Schema والترحيلات، Edge Function `admin-ai`، نتائج اختبارات البناء والاختبارات المحلية، وقراءة محدودة للبيانات الفعلية في مشروع Supabase `blilfynbajhcleiknbtk`.

> هذا التقرير يصف الحالة الموجودة فعلياً في الملفات والبيانات وقت التدقيق. لا يفترض اكتمال أي ميزة لم يظهر لها مسار في الكود، ويفصل بين المكتمل والعامل والتجريبي والمخطط له.

## الملخص التنفيذي

المشروع حالياً يتكون من مسارين منفصلين جزئياً: **AdminStudentWeb** وهو واجهة إدارة ويب تعمل فعلياً على Supabase Auth وSupabase Database، و**Student App** وهو تطبيق Expo يحتوي على واجهات الطالب وتشغيل YouTube، لكنه في الشجرة الحالية ما يزال يعتمد فعلياً على tRPC وخادم Drizzle/MySQL في شاشات الكتالوج، وليس على طبقة Supabase المباشرة التي يصفها آخر commit. توجد في Student App ملفات Supabase مساعدة، لكن الشاشات الرئيسية لا تستوردها. كما أن ملف الإدارة `app/admin-web.tsx` ما يزال موجوداً داخل مستودع التطبيق.

لوحة الإدارة نفسها تعمل مع قاعدة Supabase الحالية، وتحتوي على تسجيل دخول بالبريد وكلمة المرور، إدارة الصفوف والمواد والمدرسين والروابط الأكاديمية، إدارة الكورسات والدروس، وإحصائيات المحتوى. البيانات الفعلية صغيرة حالياً: حساب Admin واحد، صف واحد، مادة واحدة، مدرس واحد، ارتباط صف-مادة واحد، Teacher Assignment واحد، كورسان، ودرس واحد. جدول التصنيفات فارغ.

Admin AI هو Edge Function منشورة ونشطة باسم `admin-ai`، وإصدارها المنشور وقت التدقيق هو **version 19** مع `verify_jwt: true`. القناة الآمنة إلى OpenRouter تعمل من الخادم، وتتحقق من جلسة Supabase ومن وجود سجل Admin قبل استدعاء OpenRouter. أضيفت إليها قراءة محدودة من Supabase، Intent Detection، قراءة External URL، تحليل YouTube Video وPlaylist، الطلبات المختلطة، وPreview غير تنفيذي. لا يوجد في الكود الحالي مسار AI يكتب أو يحذف أو يعدل البيانات.

## تصنيف الحالة حسب المكوّن

| المكوّن | الحالة | الوصف الدقيق |
|---|---|---|
| Admin Website | **عامل ومكتمل وظيفياً ضمن النطاق الحالي** | تسجيل دخول، تحميل بيانات الإدارة، إدارة البنية الأكاديمية، إدارة الكورسات والدروس، الإحصائيات، وواجهة Admin AI. |
| Student App | **عامل جزئياً** | شاشات Home والتصنيفات وتفاصيل الكورس وتشغيل الدرس موجودة، لكن مصدرها الفعلي tRPC/Drizzle وليس Supabase المباشر في المسارات الحالية. |
| Supabase Schema | **مطبق وعامل** | الجداول القديمة والجداول الأكاديمية الجديدة موجودة مع RLS وعلاقات Foreign Key. لم يحدث backfill للكورسات القديمة. |
| Admin AI الأساسي | **عامل** | CHAT وقراءة بيانات المنصة والتحقق الإداري واستدعاء OpenRouter. |
| Admin AI External/YouTube | **تجريبي عامل للمعاينة** | تحليل الروابط وPlaylist/Video وMixed يعمل، لكن لا يوجد استيراد أو حفظ. |
| OpenRouter | **عامل عبر الخادم** | المفتاح والنموذج يقرآن من Server-side environment، مع fallback للنموذج ومعالجة أخطاء. |
| YouTube | **تشغيل وتحليل فقط** | Student App يشغّل Embed من YouTube، وAdmin AI يستخرج Video ID محلياً ويحلل Playlist عند الإمكان؛ لا YouTube Data API ولا تنزيل. |
| Offline cache 24 ساعة | **غير مثبت في الشجرة الحالية** | لم توجد طبقة `supabase-catalog` أو إعداد persistence واضح في المسارات الحالية؛ QueryClient يضبط retry وrefetch behavior فقط. |
| AI Actions / Execute | **مخطط له، غير منفذ** | أزرار Preview موجودة لكنها disabled، ولا توجد mutations من AI. |
| Playlist Import الحافظ | **مخطط له، غير منفذ** | يوجد fallback وPreview فقط. |

## أولاً: ما تم إنجازه فعلياً

### AdminStudentWeb

تم فصل لوحة الإدارة في مستودع مستقل هو `AdminStudentWeb`، ويحتوي على إعداد Expo Web ثابت. يوجد `app/index.tsx` كمسار جذر يعيد تصدير شاشة `admin-web`، ولذلك لا يعتمد فتح الموقع على `/admin-web` فقط. إعداد Netlify موجود في `netlify.toml`، وأمر البناء هو `pnpm install --frozen-lockfile && pnpm build:web`، ومجلد النشر هو `dist`، مع SPA redirect إلى `/index.html`.

تم تنفيذ تسجيل الدخول عبر `supabase.auth.signInWithPassword`. بعد الحصول على الجلسة، تقرأ الواجهة `admin_profiles` بواسطة `user_id` و`role = admin`. الحساب الذي لا يملك سجلاً إدارياً لا يدخل إلى اللوحة حتى لو نجحت مصادقة Supabase. توجد رسائل منفصلة تقريباً للحساب غير الموجود، البريد غير المؤكد، أخطاء الاتصال، وفشل التحقق من الصلاحية.

تم تنفيذ إدارة مباشرة من الواجهة للجداول التالية: `stages` و`subjects` و`teachers` و`stage_subjects` و`teacher_assignments`. كما تنفذ الواجهة CRUD للكورسات والدروس والتبديل بين النشر والإخفاء والحذف. عند إنشاء الكورس الجديد يجب اختيار Teacher Assignment، ويُنسخ اسم المدرس إلى الحقل legacy `courses.instructor`. عند حفظ الدرس يتحقق الكود من رابط YouTube ويستخرج `youtube_video_id` محلياً.

### قاعدة البيانات

تم الاحتفاظ بالجداول القديمة `admin_profiles` و`course_categories` و`courses` و`lessons`، ثم إضافة البنية الأكاديمية الجديدة دون نقل تلقائي للبيانات القديمة. هذا يعني أن الترحيل بنيوي، وليس عملية backfill شاملة.

### Admin AI

تم إنشاء Edge Function باسم `admin-ai`. المسار يبدأ بوجود Bearer token، ثم يستدعي `client.auth.getUser(token)`، ثم يقرأ `admin_profiles` ويتأكد من `role = admin`. لا يستدعي OpenRouter إذا فشل التحقق أو لم يوجد Admin.

تمت إضافة سجلات تشخيص allow-listed مثل `REQUEST_RECEIVED` و`AUTH_HEADER_PRESENT` و`USER_AUTHENTICATED` و`ADMIN_CHECK_PASSED` و`OPENROUTER_REQUEST_STARTED` و`OPENROUTER_RESPONSE_RECEIVED` و`RESPONSE_RETURNED`، بالإضافة إلى رموز الأخطاء. الكود لا يسجل الرسالة الكاملة، Authorization header، JWT، المفتاح، كلمات المرور، أو جسم استجابة OpenRouter الكامل.

تمت إضافة Intent Detection للأنواع `CHAT` و`PLATFORM_READ` و`EXTERNAL_URL` و`YOUTUBE_PLAYLIST` و`YOUTUBE_VIDEO` و`MIXED`. الروابط الخارجية تُقرأ server-side فقط بعد تحقق HTTPS ورفض localhost وبعض العناوين الخاصة، مع حد زمني 12 ثانية وحد أقصى مليون بايت وحد redirects. YouTube Video ID يستخرج محلياً، وPlaylist تُحلل من HTML العام عند نجاح القراءة. عند فشل ذلك يظهر fallback يطلب من Admin لصق روابط الفيديوهات يدوياً.

تم تنفيذ Preview في رد الخادم وفي واجهة Admin AI. الـPreview يعرض نوع الطلب، المصدر، الروابط، عناصر الفيديو، التحذيرات، ونتيجة `academic_resolution` عند وجود Stage/Subject/Teacher. أزرار «تأكيد التحليل فقط» و«تعديل» و«إلغاء» موجودة للعرض لكنها disabled، ولا تؤدي إلى أي عملية.

## ثانياً: ما يعمل حالياً وكيف يعمل

### تدفق Admin Website

التدفق الحالي هو: فتح الموقع، قراءة جلسة Supabase المحفوظة، عرض نموذج البريد وكلمة المرور عند عدم وجود جلسة، استدعاء `signInWithPassword`، التحقق من `admin_profiles`، ثم تحميل البيانات من Supabase مباشرة عبر Promise متوازية. بعد ذلك تظهر لوحة واحدة طويلة RTL تضم مساعد AI، البنية الأكاديمية، الإحصائيات، الكورسات، ونموذج الدروس.

إنشاء أو تعديل بيانات الإدارة يتم من المتصفح مباشرة باستخدام Supabase publishable key وسياسات RLS. هذا مناسب للنطاق الحالي لأن صلاحية Admin تُفرض في RLS، لكنه يعني أن جميع عمليات الإدارة تعتمد على صحة سياسات RLS وعدم وجود مسار عميل يتجاوزها.

### تدفق Student App

شاشة Home في الشجرة الحالية تستعمل `trpc.catalog.categories` و`trpc.catalog.courses`. تعرض بحثاً في الكورس أو المدرس، التصنيفات، الكورسات المميزة، وبطاقات الكورسات في عمودين. الضغط على الكورس ينتقل إلى `course/[id]`.

شاشة تفاصيل الكورس تستعمل `trpc.catalog.courseById`، وتعرض الغلاف، اسم الكورس، التصنيف، المدرس، الوصف، وعدد الدروس. الدرس ينتقل إلى `watch/[courseId]/[lessonId]`.

شاشة المشاهدة تستعمل `YoutubePlayer` مع `react-native-webview` وتبني رابطاً بصيغة `https://www.youtube.com/embed/{videoId}?playsinline=1&rel=0&modestbranding=1`. توجد حالات تحميل وفشل، وأزرار درس سابق وتالٍ، ورسالة عند عدم توفر الفيديو. لا توجد في هذا المكون آلية تنزيل فيديو أو YouTube Data API.

### تدفق Supabase

AdminStudentWeb يستخدم عميل Supabase المباشر من `lib/supabase.ts` مع persistSession وautoRefreshToken. Student App يحتوي على `lib/supabase.ts` أيضاً، لكن الشاشات الفعلية التي تم فحصها تستورد `lib/trpc.ts`، والـRoot Layout يهيئ `QueryClient` و`tRPC Provider` و`createTRPCClient`. خادم Student App يعرّف `catalog` و`admin` في `server/routers.ts`، وطبقة `server/db.ts` تستخدم `drizzle-orm/mysql2` وتقرأ `DATABASE_URL`.

بالتالي، الاتصال المشترك بـSupabase موجود فعلياً في Admin Website وEdge Function، لكنه ليس مصدر القراءة الفعلي لمسارات Student App الحالية، رغم أن رسالة آخر commit في Student App تصف نقلاً إلى Supabase المباشر.

### تدفق OpenRouter

بعد المصادقة وIntent Detection وجلب السياق الضروري، يبني Edge Function رسالة system ورسالة user، ويرسلها إلى `https://openrouter.ai/api/v1/chat/completions`. النموذج الافتراضي يقرأ من `OPENROUTER_MODEL` مع fallback إلى `openai/gpt-4o-mini`. المفتاح يقرأ من `OPENROUTER_API_KEY` داخل Edge Function فقط. درجة الحرارة 0.1 و`max_tokens` يساوي 800، والاستدعاء غير streaming.

السياق ليس قاعدة البيانات كاملة، لكنه ليس دائماً استعلاماً ضيقاً جداً: بعض نوايا القراءة تحمل قوائم محدودة من stages/subjects/links أو teachers/assignments، بينما الكورس والدرس يقرآن الكورسات المنشورة حتى 100 صف ثم يفلتران محلياً، ويقرآن دروس الكورسات المطابقة حتى 200 صف.

## ثالثاً: الصفحات والميزات الموجودة

### AdminStudentWeb

| المسار أو القسم | الموجود فعلياً |
|---|---|
| `/` | يعيد تصدير شاشة Admin Web. |
| `/admin-web` | شاشة لوحة الإدارة وتسجيل الدخول. |
| `AdminAiChat` | محادثة محلية للجلسة، استدعاء Edge Function، أخطاء عامة، Preview. |
| `AcademicManagement` | Stages، Subjects، Teachers، Stage Subjects، Teacher Assignments. |
| الإحصائيات | إجمالي الكورسات والدروس، المنشور منها، والمخفي منها. |
| إدارة الكورسات | بحث، إنشاء، تعديل، نشر/إخفاء، حذف. |
| إدارة الدروس | إنشاء، تعديل، نشر/إخفاء، حذف، ترتيب يدوي عند الإدخال. |
| `/dev/theme-lab` | صفحة تطوير/اختبار للثيم، وليست ميزة تشغيلية للمستخدم النهائي. |

### Student App

| المسار | الموجود فعلياً |
|---|---|
| `/` | في الشجرة الحالية يعيد تصدير `admin-web`، وليس Home الطالب. |
| `/(tabs)` | تبويب الطالب الرئيسي. |
| `/(tabs)/index` | Home، البحث، التصنيفات، الكورسات المميزة، قائمة الكورسات. |
| `/(tabs)/categories` و`/categories` | قائمة التصنيفات والتنقل إلى Home مفلترة. |
| `/course/[id]` | تفاصيل الكورس وقائمة الدروس. |
| `/watch/[courseId]/[lessonId]` | تشغيل YouTube، حالات الفشل، السابق/التالي. |
| `/admin-web` | ملف إدارة ما يزال موجوداً داخل مستودع التطبيق، لكنه يعرض رسالة على native ويعرض الإدارة على web. |
| `/oauth/callback` | مسار callback موجود ضمن القالب، ولا يمثل تدفق تسجيل دخول الطالب في الواجهة الحالية. |
| `/dev/theme-lab` | صفحة تطوير. |

لا توجد شاشة طالب لاختيار **Stage ثم Subject ثم Teacher** في المسارات الحالية. البنية الأكاديمية موجودة في Supabase ولوحة الإدارة وAdmin AI، لكنها لم تُوصل بعد إلى تنقل الطالب.

## رابعاً: بنية قاعدة البيانات والعلاقات

### الجداول

| الجدول | الغرض | الملاحظات |
|---|---|---|
| `admin_profiles` | قائمة الحسابات الإدارية | `user_id` مفتاح أساسي مرتبط بـ`auth.users`، والدور المسموح حالياً هو `admin`. |
| `course_categories` | تصنيفات عامة للكورسات | منفصلة عن Stage/Subject، وعدد الصفوف الحالي صفر. |
| `courses` | الكورسات | تحتوي على `instructor` النصي legacy و`category_id` و`teacher_assignment_id`. |
| `lessons` | الدروس | مرتبطة بـ`courses` عبر `course_id`، وتحتوي رابط YouTube وVideo ID وترتيباً ونشر/إخفاء. |
| `stages` | الصفوف/المراحل | اسم وslug وترتيب وحالة نشاط. |
| `subjects` | المواد | اسم وslug وترتيب وحالة نشاط. |
| `stage_subjects` | ربط الصف بالمادة | قيد uniqueness على `(stage_id, subject_id)`. |
| `teachers` | المدرسون | `display_name` وslug وحالة نشاط. |
| `teacher_assignments` | ربط مدرس بمادة وصف | يربط `teacher_id` بـ`stage_subject_id` مع قيد uniqueness. |

### العلاقة المنطقية

العلاقة الحالية هي:

`stages -> stage_subjects -> subjects`

`stage_subjects -> teacher_assignments -> teachers`

`teacher_assignments -> courses -> lessons -> YouTube Video`

وتظل `course_categories` تصنيفاً عاماً مستقلاً، بينما يبقى `courses.instructor` حقلاً legacy للتوافق مع الكورسات القديمة. الحذف المتسلسل موجود من `courses` إلى `lessons`، ومن `stages/subjects` إلى روابطها، ومن Teacher Assignment إلى الكورسات عبر `ON DELETE SET NULL`.

### RLS

كل الجداول الأساسية والأكاديمية مفعّل عليها RLS. القراءة العامة متاحة للصفوف والمواد والمدرسين والروابط النشطة، وللكورسات والدروس المنشورة. Admin يملك سياسات إدارة تعتمد على `public.is_admin()`. توجد تنبيهات Supabase من نوع **Multiple Permissive Policies** لعدة جداول بسبب وجود سياسة قراءة عامة وسياسة إدارة Admin على SELECT للدور authenticated؛ هذه تحذيرات أداء/وضوح سياسات وليست دليلاً بحد ذاتها على اختراق.

## خامساً: البيانات الفعلية وقت التدقيق

تمت قراءة البيانات دون أي كتابة. النتائج هي:

| الكيان | العدد |
|---|---:|
| `admin_profiles` | 1 |
| `course_categories` | 0 |
| `courses` | 2 |
| `lessons` | 1 |
| `stages` | 1 |
| `subjects` | 1 |
| `stage_subjects` | 1 |
| `teachers` | 1 |
| `teacher_assignments` | 1 |

الصف الموجود هو **الخامس الابتدائي**، والمادة الموجودة **رياضيات**، والمدرس الموجود **احمد علي**. يوجد Stage Subject واحد وTeacher Assignment واحد لهذا الربط.

الكورسان الحاليان هما **C++** بمدرس نصي legacy هو **الزيرو أسامة** ومن دون `teacher_assignment_id`، و**الكسور الاعتيادية** بمدرس **احمد علي** مع Teacher Assignment. يوجد درس منشور واحد بعنوان **الدرس الأول** داخل كورس C++، وVideo ID الخاص به هو `XDuWyYxksXU`. كورس الكسور الاعتيادية موجود لكنه بلا درس ظاهر حالياً. لا توجد تصنيفات عامة في `course_categories`.

## سادساً: ما تم حذفه أو استبداله ولماذا

تم استبدال مسار لوحة الإدارة المضمنة كحل رئيسي بمستودع Admin Website مستقل؛ هذا هو المسار المستخدم فعلياً للإدارة. مع ذلك، لم يُحذف ملف `app/admin-web.tsx` من Student App، بل بقي في الشجرة الحالية كمسار زائد/متبقٍ.

تم استبدال تسجيل الدخول الإداري السابق الذي كان يتضمن Google OAuth بواجهة بريد وكلمة مرور عبر Supabase Auth، لأن المتطلب الحالي هو إدخال Gmail وكلمة المرور مباشرة وعدم ربطه بخدمات Google OAuth.

تم استبدال فكرة YouTube Data API بمسار لا يحتاج API Key: Admin يدخل الرابط، والكود يستخرج Video ID محلياً. لا تُجلب العناوين أو الصور المصغرة أو المدة تلقائياً من YouTube Data API، ولا تُنزّل الفيديوهات.

تمت إضافة البنية الأكاديمية الجديدة بدلاً من الاعتماد وحده على `courses.instructor` النصي. الحقل القديم لم يُحذف، بل بقي للتوافق، وهذا سبب وجود مسارين للبيانات داخل النظام حالياً.

## سابعاً: المشاكل والقيود الحالية

أهم مشكلة بنيوية هي عدم تطابق Student App الحالي مع وصف آخر commit. الكود الفعلي للشاشات يستعمل tRPC، وخادم tRPC يستعمل Drizzle/MySQL، ولا توجد في الشجرة طبقة `lib/supabase-catalog.ts` أو طبقة persistence لـ24 ساعة. لذلك لا يمكن اعتبار Student App حالياً تطبيق Supabase مباشر أو Offline-first بناءً على الملفات الموجودة.

المشكلة الثانية أن ملف `app/index.tsx` في Student App يعيد تصدير `admin-web`، وملف الإدارة نفسه ما يزال موجوداً. على native تظهر رسالة بأن الإدارة متاحة عبر Website، لكن مسار الإدارة لم يُحذف فعلياً من المستودع.

المشكلة الثالثة هي وجود بيانات legacy غير مربوطة. كورس C++ يستخدم `instructor = الزيرو أسامة` ولا يرتبط بمدرس موجود في جدول `teachers`. وبالمقابل، جدول teachers يحتوي مدرساً واحداً فقط هو احمد علي. لذلك لا يمكن اعتبار كل الكورسات الحالية ضمن hierarchy الجديدة.

المشكلة الرابعة أن `course_categories` فارغة بينما Student App القديم يعرض التصنيفات ويستعملها للفلترة. عند غياب التصنيفات سيظهر الكورس كـ«عام» أو لن توجد فلاتر مفيدة.

المشكلة الخامسة أن Intent Detection يعتمد على regex وكلمات مفتاحية، وليس مصنفاً لغوياً مستقلاً. تم إصلاح حالتي false positive ظهرتا أثناء الاختبار، لكن العبارات العربية الجديدة أو الصياغات غير المتوقعة قد تحتاج حالات إضافية.

المشكلة السادسة أن External URL Fetch يرفض عدداً من العناوين الخاصة عبر hostname checks، لكنه لا ينفذ DNS resolution/IP verification كاملاً قبل الاتصال. لذلك ما زال هذا المسار تجريبياً ويحتاج تقوية قبل استخدامه على نطاق واسع.

المشكلة السابعة أن تحليل Playlist يعتمد على بنية HTML عامة قد تتغير. عند الفشل لا يتم اختلاق قائمة، لكن لا يوجد Import حقيقي أو حفظ تلقائي.

المشكلة الثامنة أن رد OpenRouter نص حر، بينما Preview منظم من الخادم. توجد بنية JSON للرد العام، لكن لا يوجد حتى الآن OpenRouter Structured Output schema صارم يضمن أن كل جواب يتبع نموذجاً ثابتاً.

المشكلة التاسعة أن الاختبارات المحلية تغطي TypeScript وlint وبعض اختبارات Supabase/OpenRouter، لكن لا يوجد اختبار Vitest شامل لمسار `admin-ai` بكل أنواع Intent، ولا اختبار native فعلي لتطبيق Expo على جهاز iOS/Android ضمن الملفات الحالية.

## ثامناً: ما لم يُنفذ بعد

لم تُنفذ شاشة الطالب ذات التسلسل Stage → Subject → Teacher → Course، ولم تُربط شاشات الطالب بجداول hierarchy الجديدة. لم تُنفذ مزامنة ذكية أو قاعدة محلية Offline cache مؤكدة في الشجرة الحالية. لم يُنفذ backfill للكورسات القديمة ولا حل تعارض المدرس النصي مع Teacher Assignment.

لم يُنفذ Playlist Import إلى Supabase، ولم تُنشأ دروس تلقائياً من قائمة تشغيل، ولم تُجلب metadata من YouTube Data API. لم تُنفذ AI Course Import أو AI Actions أو أي زر Execute حقيقي. لم تُنفذ صلاحيات متعددة مثل editor أو reviewer؛ الدور الحالي في Schema هو admin فقط.

لم يُثبت من الملفات أن Admin Website منشور حالياً على Netlify؛ الموجود هو إعداد `netlify.toml` وبناء ناجح إلى `dist`. كما أن مستودع AdminStudentWeb الظاهر من GitHub CLI هو `jem-glitch/AdminStudentWeb` وحالته الحالية **public**، بينما Student App remote المحلي ليس مستودع GitHub معروفاً في GitHub CLI وقت التدقيق.

## تاسعاً: الاختبارات وحالة الجودة

تم تشغيل `pnpm check` و`pnpm lint` و`pnpm test` و`pnpm build:web` في كلا المجلدين دون أخطاء مخرجات. في AdminStudentWeb نجحت اختبارات Supabase credentials وOpenRouter secret، واختبار logout كان skipped. في Student App نجح اختبار Supabase credentials، واختبار logout كان skipped. يظهر تحذير Node غير مؤثر عن إعادة تحليل `eslint.config.js` كـES module لغياب `type: module` في `package.json`.

تم اختبار Admin AI فعلياً من واجهة الإدارة: CHAT، قراءة الصفوف والمواد والمدرسين والكورسات والدروس، الحالات غير الموجودة، Playlist fallback، Video مستقل، عدة روابط، وMixed مع الصف والمادة والمدرس. تم إصلاح 503 سببه ReferenceError داخل `readRelevantContent`، وتم إصلاح تصنيف Video/Playlist المستقل حتى لا يفعّل PLATFORM_READ بلا طلب أكاديمي.

## عاشراً: آخر مرحلة وصل إليها المشروع

آخر مرحلة مكتملة هي **مرحلة تحليل الطلبات والموارد الخارجية في Admin AI مع Preview غير تنفيذي**. هذه المرحلة شملت قراءة Supabase المحدودة، Intent Detection، External URL validation/fetch، YouTube Video/Playlist parsing، Mixed academic resolution، وسجلات التشخيص. انتهت المرحلة بالتوقف المقصود قبل أي Execute أو AI Action أو حفظ Playlist.

أما من ناحية المشروع ككل، فهناك عدم اتساق يجب اعتباره أولوية: Admin Website وصل إلى hierarchy وAdmin AI التجريبي، بينما Student App لم يثبت بعد انتقاله الفعلي إلى Supabase أو hierarchy الجديدة في الكود الحالي.

## الحادي عشر: الخطوة المنطقية التالية

الخطوة المنطقية التالية ليست AI Actions ولا Playlist Import. الأولوية هي **توحيد مصدر البيانات بين Admin Website وStudent App** عبر قرار واضح ومختبر: إما إكمال نقل Student App فعلياً إلى Supabase المباشر مع طبقة catalog مشتركة وكاش Offline، أو الإبقاء على tRPC/MySQL مؤقتاً مع مزامنة رسمية من Supabase. وبالنظر إلى أن Admin Website وEdge Function يعتمدان Supabase وأن hierarchy الجديدة موجودة هناك، فالخيار المنطقي هو إكمال النقل المباشر للتطبيق.

ينبغي أن يبدأ ذلك بتدقيق/إزالة المسارات المتبقية للإدارة من Student App، ثم بناء طبقة قراءة Supabase للصفوف والمواد والمدرسين والارتباطات والكورسات والدروس، ثم إضافة كاش محلي مع TTL واضح، ثم بناء تنقل الطالب Stage → Subject → Teacher → Course → Lesson، مع الحفاظ على قراءة الكورسات legacy أثناء فترة الانتقال. بعد ذلك فقط تُعالج عملية backfill للكورسات القديمة، ويُحدد مصير `course_categories` و`courses.instructor`.

بعد استقرار مصدر البيانات وتغطية الاختبارات، تصبح Playlist Import Preview-only مرحلة مناسبة، ثم يمكن لاحقاً طلب موافقة مستقلة لتصميم Execute آمن مع تأكيد صريح، idempotency، audit log، وصلاحيات محددة. لا يُنصح بتفعيل أي كتابة بواسطة AI قبل اكتمال هذه الأساسيات.

## المراجع الداخلية

[1]: `app/admin-web.tsx` في مستودع AdminStudentWeb — المصادقة، تحميل البيانات، إدارة الكورسات والدروس، والإحصائيات.

[2]: `components/academic-management.tsx` في مستودع AdminStudentWeb — إدارة Stages وSubjects وTeachers والروابط.

[3]: `components/admin-ai-chat.tsx` في مستودع AdminStudentWeb — المحادثة المحلية وPreview والأزرار غير التنفيذية.

[4]: `supabase/functions/admin-ai/index.ts` في مستودع AdminStudentWeb — المصادقة، Intent Detection، القراءة الخارجية، OpenRouter، والسجلات.

[5]: `supabase_migration.sql` في مستودع AdminStudentWeb — Schema وForeign Keys وRLS.

[6]: `app/(tabs)/index.tsx` و`app/course/[id].tsx` و`app/watch/[courseId]/[lessonId].tsx` في Student App — شاشات الطالب ومسار tRPC وتشغيل YouTube.

[7]: `lib/trpc.ts` و`server/routers.ts` و`server/db.ts` و`drizzle/schema.ts` في Student App — مصدر البيانات الوسيط ونموذج Drizzle/MySQL.

[8]: `app.config.ts` و`netlify.toml` في المستودعين — إعدادات Expo Web والهوية والبناء والنشر.
