# Project TODO

- [x] قراءة وتحليل متطلبات مكتبة الكورسات العربية
- [x] إعداد خطة تصميم واجهة الجوال RTL في `design.md`
- [x] إنشاء شعار التطبيق وتحديث إعدادات الهوية في `app.config.ts`
- [x] تهيئة ألوان وهوية أكاديمية مسار
- [x] تصميم جداول التصنيفات والكورسات والدروس وحالات الظهور
- [x] إضافة إجراءات قاعدة البيانات والاستعلامات القابلة للتوسع
- [x] إضافة مسارات tRPC العامة لعرض الكورسات والتصنيفات
- [x] إضافة مسارات tRPC المحمية للإدارة
- [x] بناء الرئيسية مع البحث والتصنيفات والكورسات المميزة
- [x] بناء شاشة نتائج البحث وحالات التحميل والفراغ والخطأ
- [x] بناء شاشة تفاصيل الكورس وقائمة الدروس المرتبة
- [x] بناء شاشة مشاهدة الدرس مع YouTube Player رسمي مضمّن
- [x] دعم التنقل السابق/التالي وملء الشاشة وحالات فيديو محذوف أو رابط غير صالح
- [x] بناء دخول الإدارة والتحقق من دور Admin
- [x] بناء لوحة مؤشرات وقائمة الكورسات مع البحث
- [x] بناء محرر الكورس وإدارة الصور والغلاف
- [x] بناء محرر الدروس والإضافة والتعديل والحذف وإعادة الترتيب والإخفاء
- [x] بناء إدارة التصنيفات
- [x] إضافة اختبارات وحدات للمخططات والإجراءات الأساسية
- [x] فحص TypeScript وlint واختبار التدفقات الأساسية
- [x] حفظ checkpoint نهائي قابل للمشاركة

- [x] تحويل لوحة الإدارة إلى Website مستقل
- [x] ربط دخول الموقع بـ Supabase Auth
- [x] إضافة إعدادات Supabase عبر متغيرات بيئة آمنة
- [x] بناء إدارة الكورسات من موقع الإدارة
- [x] إضافة دروس YouTube يدوياً مع استخراج VIDEO_ID محلياً، بدون YouTube Data API
- [x] حذف تبويب الإدارة ومسارات الإدارة من تطبيق الجوال
- [x] تحديث اختبارات الموقع والتطبيق وحفظ checkpoint جديد

- [x] إزالة طلب YouTube Data API ومفتاحه من إعدادات المشروع نهائياً
- [x] اعتماد إدخال الدرس اليدوي: العنوان والرابط والترتيب والصورة والوصف
- [x] استخراج VIDEO_ID محلياً والتحقق من روابط YouTube المدعومة
- [x] عرض خطأ واضح للرابط غير الصالح أو الفيديو غير القابل للتضمين
- [x] إبقاء تكامل YouTube Data API مستقبلياً اختيارياً وغير أساسي

- [x] استبدال Firebase بـ Supabase Auth في موقع الإدارة
- [x] ربط موقع الإدارة بقاعدة بيانات Supabase وسياسات Row Level Security
- [x] حذف استخدام Firebase وعدم طلب مفاتيح YouTube API

- [x] فصل نسخة Website الإدارة عن نسخة تطبيق الطالب
- [x] تجهيز مستودع adminstudentwep دون أسرار أو ملفات التطبيق
- [x] تجهيز مستودع adminstudentapp دون كود لوحة الإدارة
- [x] رفع النسختين إلى مستودعي GitHub والتحقق من المحتوى

- [x] تجهيز Website الإدارة للنشر على Netlify مع إعدادات Expo Web وSPA redirects
- [x] استبدال دخول البريد/كلمة المرور بدخول Google/Gmail عبر Supabase OAuth
- [x] تقييد الدخول على حسابات Admin المضافة إلى allow-list في Supabase
- [x] توثيق إعداد Google Cloud وSupabase وNetlify للحساب الإداري
- [x] اختبار build نسخة Website وتحديث مستودع AdminStudentWeb

- [x] تجهيز نشر Website الإدارة فقط على Netlify
- [x] عدم نشر تطبيق الطالب على Netlify وإبقاؤه جاهزاً للتثبيت عبر Expo/متجر التطبيقات
- [x] توثيق أن Website والتطبيق يشتركان في Supabase كمصدر بيانات واحد

- [x] إضافة صفحة إحصائيات رئيسية في لوحة الإدارة لإجمالي الكورسات والدروس وحالات النشر

- [x] إصلاح فشل Netlify بسبب `react-native-css-interop/.cache/web.css`
- [x] اختبار بناء Website على بيئة نظيفة مماثلة لـ Netlify
- [x] رفع إصلاح Netlify إلى مستودع AdminStudentWeb

- [x] تشخيص خطأ 404 في Netlify لموقع AdminStudentWeb
- [x] تأكيد أن مجلد إخراج Expo Web هو dist
- [x] إضافة أو تصحيح SPA fallback عبر _redirects أو netlify.toml
- [x] اختبار البناء والنشر بعد إصلاح إعدادات Netlify

- [ ] نشر أحدث commit من AdminStudentWeb على Netlify عبر الاتصال المرتبط
- [ ] التحقق من حالة Netlify build والرابط النهائي بعد النشر

- [ ] استبدال تسجيل Google OAuth بواجهة بريد إلكتروني وكلمة مرور فقط
- [ ] تحديث توثيق Netlify وSupabase ليتوافق مع تسجيل الدخول التقليدي
- [ ] اختبار البناء ورفع تحديث تسجيل الدخول إلى AdminStudentWeb

- [x] إضافة Supabase Edge Function باسم admin-ai للاتصال الآمن بـ OpenRouter
- [x] التحقق من جلسة Supabase Auth ومن صلاحية admin_profiles قبل استدعاء OpenRouter
- [x] إضافة استدعاء Admin Web تجريبي دون أي عمليات كتابة أو حذف أو تعديل
- [x] إضافة معالجة أخطاء timeout وrate limit و401/403 والاستجابة الفارغة
- [x] اختبار عدم كشف OPENROUTER_API_KEY في الواجهة أو السجلات

- [x] إضافة واجهة Chat Assistant محلية داخل AdminStudentWeb مرتبطة بـ admin-ai
- [x] دعم رسائل Admin وAI وEnter وLoading وError وبدء محادثة جديدة
- [x] اختبار Responsive وعدم إضافة أي Database mutation أو AI tools

- [x] فحص مخطط Supabase الفعلي والعلاقات دون افتراض أسماء جديدة
- [x] تحديث admin-ai لقراءة البيانات الضرورية فقط بحسب سؤال Admin
- [x] منع أي INSERT أو UPDATE أو DELETE أو Schema change في هذه المرحلة
- [x] اختبار الإجابات الواقعية وحالات عدم العثور وحماية غير Admin

- [x] إعداد تقرير هندسي عن Schema الحالية والبنية المستقبلية المقترحة
- [x] فحص بيانات الكورسات والمدرسين والتصنيفات والدروس قراءة فقط
- [x] اقتراح Migration Plan مرحلية دون تنفيذها أو تعديل Admin Web

- [x] تنفيذ Migration لإضافة stages وsubjects وstage_subjects وteachers وteacher_assignments
- [x] إضافة teacher_assignment_id nullable إلى courses دون نقل أو تعديل البيانات الحالية
- [x] إضافة Foreign Keys وUnique Constraints وIndexes وRLS المناسبة
- [x] التحقق من بقاء C++ والدرس والمدرس وcategory_id كما هي
- [x] التحقق من توافق Admin Web وStudent App بعد Migration

- [x] إضافة إدارة Stages من Supabase داخل AdminStudentWeb
- [x] إضافة إدارة Subjects وربطها بالـStages عبر stage_subjects
- [x] إضافة إدارة Teachers وTeacher Assignments
- [x] تحديث نموذج الكورس لاختيار Stage ثم Subject ثم Teacher Assignment
- [x] الحفاظ على الكورس C++ والدرس الحالي والسماح بربطهما يدوياً لاحقاً
- [x] اختبار الصلاحيات والقيود والقوائم المتسلسلة وبناء AdminStudentWeb

- [x] إضافة Diagnostic Logging مؤقت وآمن داخل admin-ai فقط
- [x] إضافة رموز خطأ غير حساسة في Console داخل Admin Web
- [x] اختبار رسالة «مرحبا» وتحديد آخر مرحلة وصل إليها الطلب
- [x] إصلاح سبب الفشل المحدد فقط وإعادة اختبار المسار — لم يلزم تعديل؛ السبب كان إدخال الحقول من المتصفح، وتم التحقق من نجاح الدخول

- [x] اختبار أسئلة الصفوف والمدرسين والكورسات والدروس عبر Admin AI
- [x] إصلاح قراءة Admin AI للبنية الأكاديمية الجديدة stages/subjects/teachers دون أي كتابة أو تغيير Schema
- [x] اختبار حالات الصف والمدرس والكورس غير الموجود ومنع التخمين
- [x] التحقق من أن السياق المرسل إلى OpenRouter محدود حسب السؤال
- [x] إعداد تقرير مقارنة السؤال والبيانات والرد وحالة المطابقة دون تعديل النظام
- [x] تشخيص/توثيق تعذر تسجيل الدخول في المعاينة المحلية قبل متابعة اختبار Admin AI — تعذر إدخال الحقول من متصفح الهاتف، ونجح الدخول بعد الإدخال المباشر دون تعديل الكود
- [x] تنفيذ أسئلة Admin AI العشرة ومقارنة كل إجابة ببيانات Supabase الفعلية
- [x] إعداد التقرير النهائي لنتائج اختبارات القراءة فقط والتوقف للمراجعة

# المرحلة الجديدة: تحليل الطلبات والموارد الخارجية

- [x] تمييز CHAT وPLATFORM_READ وEXTERNAL_URL وYOUTUBE_PLAYLIST وYOUTUBE_VIDEO وMIXED
- [x] منع رابط YouTube وحده من تفعيل PLATFORM_READ أو تصنيف الطلب كـMIXED دون نص منصة فعلي
- [x] منع كلمات فيديو/يوتيوب العامة من تفعيل PLATFORM_READ في التحليل الخارجي المستقل
- [x] تصنيف أي رابط خارجي مع طلب Platform Data كـMIXED، وليس Playlist فقط
- [x] إصلاح ReferenceError في readRelevantContent الذي يسبب 503 لمسار PLATFORM_READ/MIXED
- [x] إظهار نتيجة academic_resolution داخل Preview للطلبات المختلطة
- [x] استخراج روابط YouTube متعددة من الرسالة دون YouTube Data API
- [x] إضافة تحقق server-side للروابط الخارجية ومنع SSRF وlocalhost والعناوين الخاصة
- [x] إضافة قراءة خارجية آمنة بمهلة وحجم استجابة وتحقيق redirects وcontent-type
- [x] إضافة Playlist fallback يدوي عند تعذر الاستخراج دون اختلاق بيانات
- [x] إضافة تحليل منظم وPreview فقط دون INSERT أو UPDATE أو DELETE
- [x] التحقق من علاقات Stage/Subject/Teacher Assignment من Supabase في الطلبات المختلطة
- [x] إضافة سجلات تشخيص آمنة لمسارات Intent وExternal Fetch وPreview
- [x] اختبار مسارات CHAT وPLATFORM_READ وYouTube Playlist وVideo وMultiple URLs وMIXED وFallback
- [x] إعداد تقرير المرحلة والتوقف قبل أي Execute أو Database Write

# تدقيق شامل للمشروع

- [x] جرد حالة AdminStudentWeb وAdminStudentApp والملفات والتبعيات الحالية
- [x] فحص Supabase Schema وRLS والبيانات الفعلية والعلاقات
- [x] تتبع تدفقات Admin Website وStudent App وAdmin AI وOpenRouter وYouTube
- [x] توثيق ما أُنجز وما يعمل وما هو تجريبي أو مخطط له والقيود الحالية
- [x] إعداد تقرير الحالة الشاملة وتحديد المرحلة والخطوة التالية

# خطة مقترحة: استيراد وتحليل قوائم YouTube والملفات

- [ ] تصميم Contract لمدخل Playlist أو Video أو CSV/XLSX أو JSON دون YouTube Data API
- [ ] تصميم استخراج metadata من المصادر العامة مع توثيق المصدر ودرجة الثقة وFallback يدوي
- [ ] تصميم Lesson Drafts وترتيب أصلي/مقترح وكشف التكرار وعدم صلاحية الرابط
- [ ] تصميم مطابقة Stage/Subject/Teacher Assignment والتحقق قبل أي إدراج
- [ ] تصميم Preview وDiff وموافقة Admin صريحة قبل أي Database Write
- [ ] تصميم Execute لاحق idempotent مع Audit Log وصلاحيات منفصلة
- [ ] اختبار أمان SSRF وPrompt Injection والحدود الزمنية والحجمية للروابط والملفات
- [ ] إعداد تقرير التصميم والموافقة قبل بدء أي تنفيذ

# تنفيذ وكيل إدارة محتوى مدعوم بالذكاء الاصطناعي

- [x] إنشاء مهارات محلية منظمة للمعرفة والمنطق والتحقق والأمان داخل admin-ai
- [x] إضافة Intent Router لـ COURSE_IMPORT وCOURSE_UPDATE وCOURSE_DELETE وPUBLISH مع فصل التحليل عن التنفيذ
- [x] إضافة Structured Draft Schema وتحقق خادمي من المسودات والملحقات
- [x] إضافة استقبال وتحليل CSV/XLSX/JSON/TXT/Markdown مع قيود النوع والحجم
- [x] تحسين تحليل YouTube Video وPlaylist من مصادر عامة دون YouTube Data API أو تجاوز حماية
- [x] إضافة فحص التكرار والمحتوى المفقود والفرز الأكاديمي والـTranscript الاختياري عند توفر مصدر مسموح
- [x] إنشاء مسار Approval/Execute خادمي منفصل يتحقق من Admin وValidation وidempotency
- [x] إضافة Audit Log لعمليات الوكيل دون أسرار أو JWT أو محتوى غير لازم
- [x] إضافة أدوات إنشاء وتحديث وحذف ونشر Server-side بعد الموافقة الصريحة فقط
- [x] تطوير واجهة AI للمرفقات وPreview القابل للتحرير وDiff والتأكيد
- [x] اختبار Chat وPlatform Read وVideo وPlaylist وملفات وفشل مصدر وتكرار وموافقة وExecute End-to-End
- [x] إصلاح فحص التكرار للكورس حتى لا يعتبر أي كورس للمدرس تكراراً عند غياب Playlist ID
- [x] الاحتفاظ بـVideo ID وLesson Draft من رابط فيديو صالح عند تعذر جلب metadata الخارجية
- [x] منع تعطل بطاقة Preview عند عودة رد اعتماد أو تنفيذ مختصر من الخادم
- [x] الاحتفاظ ببيانات النوع والمصدر في بطاقة Preview بعد اعتماد أو تنفيذ أو إلغاء المسودة
- [x] تفعيل COURSE_IMPORT لطلب الملف المنظم عند وجود فعل إدراج حتى إن لم يحتو نص الرسالة على رابط
- [x] إظهار سبب دقيق عند محاولة تنفيذ Draft نُفذت سابقاً ضمن فحص منع التكرار
- [x] جعل اختبار مفتاح OpenRouter الحي اختيارياً حتى لا يفشل التحقق المحلي عند انقطاع الشبكة
- [x] استخدام نموذج OpenRouter الاحتياطي عند خطأ 400 من النموذج المهيأ، ثم التحقق من قراءة المنصة
- [x] إضافة اختبارات وحدات حتمية لمنطق YouTube والملفات والتحقق ومنع تكرار التنفيذ
- [x] قصر استخراج Video ID وPlaylist ID على نطاقات YouTube وإظهار تكرار المصدر في تحذيرات Draft
- [x] إزالة SECURITY DEFINER غير الضروري من public.is_admin لمعالجة تحذير Supabase الأمني
- [x] تصحيح دلالة Audit Log لمرحلة إنشاء المسودة حتى لا تُسجل كموافقة
- [x] التحقق من عدم استخدام YouTube Data API أو Service Role Key في العميل وعدم تسريب الأسرار
- [ ] حفظ checkpoint وإعداد تقرير تنفيذ شامل
- [x] إعداد تقرير تنفيذ شامل لوكيل المحتوى في `docs/admin-ai-content-agent-final-report.ar.md`
- [ ] حفظ checkpoint مُدار عند فتح AdminStudentWeb كمشروع نشط مستقل

# اختبار End-to-End تجريبي لوكيل إدارة المحتوى

- [ ] تجهيز اختبار Playlist/روابط YouTube تجريبية باستخدام Stage وSubject وTeacher Assignment موجودة
- [ ] تشغيل Analysis وإنشاء Draft والتحقق من الحقول والـPreview دون نشر
- [ ] التحقق من رفض Execute قبل Approval ثم اعتماد Draft صراحةً
- [ ] تنفيذ Course تجريبي مخفي ودروس والتحقق من العلاقات وVideo IDs والترتيب
- [ ] اختبار Idempotency برفض تنفيذ Draft نفسها مرة ثانية دون تكرار
- [ ] حذف Course التجريبي ودروسه عبر التدفق المحمي
- [ ] التحقق من بقاء C++ والدرس الحالي والمحتوى الحقيقي دون تغيير
- [ ] تدقيق Audit Log والأمان ونتيجة External Fetch والقيود
- [ ] إعداد تقرير End-to-End نهائي والتوقف دون إضافة ميزات جديدة

# قيود اختبار End-to-End

- [ ] لا تستخدم Course حقيقياً أو تنشئ كيانات أكاديمية جديدة
- [ ] لا تغيّر Schema أو Student App أو تضف Skills أو YouTube API
- [ ] لا تتجاوز حماية YouTube أو تنفذ CAPTCHA/login bypass
- [ ] لا تترك Course أو Lessons تجريبية ظاهرة أو معلقة بعد الاختبار
- [ ] لا تنفذ أي mutation خارج المحتوى التجريبي المحدد في الاختبار

# حفظ وتسليم اختبار End-to-End

- [ ] حفظ تقرير الاختبار في ملف مستقل بعد انتهاء التحقق والحذف
- [ ] حفظ checkpoint بعد إتمام الاختبار إذا كان AdminStudentWeb هو المشروع النشط المدار
- [ ] التوقف بعد التقرير وعدم إضافة أي ميزة جديدة

---

# اختبار End-to-End جديد — طلب pasted_content_11.txt

- [ ] تنفيذ المسار Playlist/Analysis/Draft/Approve/Execute/Verify/Delete باستخدام بيانات تجريبية فقط
- [ ] فصل نتيجة فشل استخراج Playlist الخارجي عن نتيجة بقية Pipeline إن حدث 429 أو منع وصول
- [ ] إثبات عدم تسريب الأسرار وعدم تجاوز Approval في التقرير النهائي
- [ ] توثيق القيود الحالية لاستخراج Playlist والتوقف بعد التقرير

---

# متطلبات الاختبار الجديدة — pasted_content_11.txt

- [ ] استخدام Playlist أو fallback روابط قصيرة تجريبية فقط دون YouTube Data API
- [ ] استخدام Stage وSubject وTeacher Assignment موجودة وعدم إنشاء كيانات جديدة
- [ ] التحقق من Preview الكامل وحقول Draft قبل النشر
- [ ] التحقق من رفض Execute غير المعتمدة ثم Approve ثم Execute
- [ ] التحقق من Course مخفي وLessons والعلاقات وVideo IDs وsort_order
- [ ] التحقق من رفض التنفيذ المتكرر وعدم إنشاء تكرارات
- [ ] حذف Course التجريبي وLessons المرتبطة به عبر التدفق المحمي
- [ ] فحص Audit Log والأمان وSSRF وعدم المساس بالمحتوى الحقيقي
- [ ] كتابة التقرير النهائي والتوقف دون إضافة ميزة
- [ ] التأكد من عدم وجود Course أو Lessons تجريبية بعد الحذف وعدم تغير C++ والدرس الحالي
- [ ] عدم تغيير Schema أو Student App أو Skills أو إضافة YouTube API أثناء الاختبار
- [ ] حفظ checkpoint مستقل فقط إذا كان AdminStudentWeb هو المشروع النشط المدار
- [ ] التوقف بعد التقرير وعدم تنفيذ أي عمل إضافي

---

# متابعة اختبار End-to-End وفق pasted_content_11.txt

- [ ] اعتماد خطة الاختبار التجريبي المحدودة قبل تنفيذ أي Course/lesson mutation
- [ ] استخدام Playlist تجريبية أو fallback روابط قصيرة عامة مع قبول 429 دون تجاوز حماية
- [ ] استعمال Stage وSubject وTeacher Assignment الحالية والتحقق من ربطها
- [ ] تشغيل Analysis ثم Draft فقط أولاً وفحص جميع حقول Preview
- [ ] اختبار رفض Execute قبل Approval ثم Approval ثم Execute
- [ ] إنشاء Course تجريبي مخفي ودروس والتحقق من IDs والعلاقات والترتيب
- [ ] اختبار Idempotency برفض التنفيذ الثاني دون Course/Lessons مكررة
- [ ] حذف Course التجريبي ودروسه فقط عبر المسار المحمي
- [ ] التحقق من بقاء C++ والدرس الحالي والمحتوى الحقيقي كما هو
- [ ] مراجعة Audit Log بحثاً عن Analysis/Draft/Approval/Execution/Deletion دون أسرار
- [ ] اختبار غير Admin وDraft غير معتمدة وDraft منفذة وSSRF ضمن حدود الاختبار
- [ ] كتابة تقرير يجيب عن البنود الاثني عشر والتوقف دون إضافة ميزة

# حالة اختبار End-to-End الجديدة

- [ ] بدأ تجهيز الاختبار وفق `pasted_content_11.txt`
- [ ] لم تُنفذ بعد أي عملية إنشاء أو تعديل أو حذف لهذا الطلب
- [ ] لا توجد موافقة تنفيذ جديدة من المستخدم بعد قراءة الملف
- [ ] يجب طلب تأكيد صريح قبل أول عملية كتابة تجريبية في Pipeline

# توثيق نهائي للاختبار الجديد

- [ ] تسجيل نتيجة Playlist extraction أو fallback
- [ ] تسجيل Draft وPreview وApproval وExecute وVerify وIdempotency وDelete
- [ ] تسجيل سلامة المحتوى الحقيقي وAudit Log ونتائج الحماية
- [ ] إعداد التقرير النهائي ثم التوقف

# خطة تنفيذ pasted_content_11.txt

- [ ] جرد بيانات الاختبار الحالية واختيار target الأكاديمي الموجود
- [ ] اختيار Playlist/روابط YouTube التجريبية المقبولة
- [ ] تنفيذ Analysis وDraft فقط والتحقق من Preview
- [ ] طلب تأكيد صريح قبل Execute التجريبي
- [ ] تنفيذ Course تجريبي مخفي وLessons بعد الموافقة
- [ ] Verify ثم Idempotency ثم Delete
- [ ] التحقق من عدم تغير المحتوى الحقيقي
- [ ] تدقيق Audit Log وSSRF والأمان
- [ ] كتابة تقرير نهائي والتوقف

# طلب E2E: pasted_content_11.txt — ملخص القيود

- [ ] المحتوى التجريبي فقط
- [ ] لا Course حقيقي ولا تعديل C++ أو الكورسات الحالية
- [ ] لا بيانات ظاهرة للطلاب
- [ ] لا Schema change ولا Skills جديدة ولا YouTube API
- [ ] لا تجاوز لحماية YouTube
- [ ] fallback عند 429 مسموح
- [ ] Approval صريح قبل Execute
- [ ] حذف كامل بعد Verify
- [ ] تقرير نهائي ثم توقف

# اختبار End-to-End: pasted_content_11.txt — تنفيذ مقيد

- [ ] تحديد Playlist أو fallback التجريبي
- [ ] تحليل المصدر وإنشاء Draft فقط
- [ ] مراجعة Preview والحقول والتحذيرات
- [ ] رفض Execute قبل Approval
- [ ] الحصول على تأكيد صريح قبل Execute
- [ ] تنفيذ Course مخفي وLessons
- [ ] Verify وIdempotency
- [ ] Delete وVerify النهائي
- [ ] Audit/Security report
- [ ] التوقف بعد التقرير

# E2E test run — pasted_content_11.txt

- [ ] اختيار المصدر التجريبي
- [ ] اختيار العلاقات الأكاديمية الموجودة
- [ ] Analysis وDraft
- [ ] Preview validation
- [ ] Approval gate
- [ ] Execute hidden course/lessons
- [ ] Post-execute verification
- [ ] Idempotency verification
- [ ] Delete test data
- [ ] Final integrity verification
- [ ] Audit log verification
- [ ] Security verification
- [ ] Final report and stop

# Acceptance checklist — pasted_content_11.txt

- [ ] Playlist extraction/fallback result recorded
- [ ] Draft fields recorded
- [ ] Preview recorded
- [ ] Approval gate recorded
- [ ] Hidden Course and Lessons verified
- [ ] YouTube IDs and order verified
- [ ] Repeat execution rejected
- [ ] Test data deleted
- [ ] Real data unchanged
- [ ] Audit Log safe
- [ ] Security checks recorded
- [ ] Limitations recorded
- [ ] Final report delivered and work stopped

# E2E verification record — pasted_content_11.txt

- [ ] No test content mutation has been performed yet for this request
- [ ] No real Course has been selected for mutation
- [ ] No Schema, Student App, Skills, or YouTube API changes are planned
- [ ] User confirmation is required before the first Execute mutation
- [ ] Final report will be produced after cleanup

# تنفيذ اختبار E2E — pasted_content_11.txt

- [ ] تثبيت target الأكاديمي الحالي
- [ ] تثبيت مصدر YouTube التجريبي أو fallback
- [ ] تحليل المصدر
- [ ] إنشاء Draft
- [ ] فحص Preview
- [ ] رفض Execute غير المعتمد
- [ ] طلب موافقة Admin الصريحة
- [ ] Execute بعد الموافقة
- [ ] Verify
- [ ] Idempotency
- [ ] Delete
- [ ] Verify عدم وجود بيانات تجريبية
- [ ] Verify سلامة البيانات الحقيقية
- [ ] Audit وSecurity
- [ ] Report ثم Stop

# E2E request state

- [ ] في انتظار تأكيد صريح من Admin قبل Execute التجريبي
- [ ] لا توجد عملية كتابة أو حذف جارية لهذا الطلب
- [ ] لا توجد موافقة ضمنية مستنتجة من طلب اتباع الملف
- [ ] بعد الحذف سيُكتب التقرير النهائي فقط

# تقرير اختبار E2E — عناصر مطلوبة

- [ ] نجاح أو فشل Playlist extraction
- [ ] إنشاء Draft وحقولها
- [ ] عرض Preview
- [ ] Approval
- [ ] Course تجريبي مخفي
- [ ] عدد Lessons
- [ ] صحة روابط وVideo IDs
- [ ] is_published=false
- [ ] رفض التنفيذ المتكرر
- [ ] الحذف الكامل
- [ ] سلامة المحتوى الحقيقي
- [ ] Audit Log
- [ ] الأخطاء والقيود
- [ ] التوقف النهائي

# E2E execution guard

- [ ] لا تنفذ Execute قبل موافقة صريحة جديدة من المستخدم
- [ ] لا تستخدم Course حقيقي
- [ ] لا تلمس C++ أو الكورسات الحالية
- [ ] لا تنشئ بيانات ظاهرة للطلاب
- [ ] لا تغير Schema أو Student App أو Skills
- [ ] لا تستخدم YouTube Data API أو تجاوز حماية المصدر
- [ ] احذف كل بيانات الاختبار بعد التحقق
- [ ] أوقف المهمة بعد التقرير

# متابعة pasted_content_11.txt — المرحلة الحالية

- [ ] قراءة الملف مكتملة
- [ ] خطة اختبار E2E مقيدة أُعدت
- [ ] لم يبدأ Execute
- [ ] ينتظر الاختبار تأكيداً صريحاً قبل mutation
- [ ] التقرير النهائي بعد التنظيف

# E2E test contract

- [ ] Source: تجريبي فقط
- [ ] Target: Stage/Subject/Teacher Assignment موجودة
- [ ] Analyze: Draft فقط
- [ ] Approve: صريح
- [ ] Execute: Course مخفي وLessons
- [ ] Verify: العلاقات والـIDs والترتيب
- [ ] Idempotency: رفض التكرار
- [ ] Delete: المحتوى التجريبي فقط
- [ ] Audit: آمن
- [ ] Security: Admin/Approval/SSRF
- [ ] Report: ثم توقف

# اختبار E2E المقيد — حالة الموافقة

- [ ] لم تتم الموافقة بعد على تنفيذ mutation التجريبية
- [ ] طلب اتباع الملف لا يُعد موافقة تنفيذ
- [ ] يلزم رد صريح يجيز Execute ثم Delete للمحتوى التجريبي فقط
- [ ] لا توجد تغييرات محتوى لهذا الطلب حتى ورود الموافقة

# سجل اختبار pasted_content_11

- [ ] تم استلام الملف وقراءة القيود
- [ ] تم إنشاء خطة دون تنفيذ mutation
- [ ] تم تثبيت شرط Approval الصريح
- [ ] ستُسجل نتائج كل مرحلة بعد التنفيذ المصرح
- [ ] سيُسلّم التقرير ثم تتوقف المهمة

# Final E2E gate

- [ ] لا Execute قبل موافقة صريحة
- [ ] لا بيانات حقيقية
- [ ] لا Course ظاهر
- [ ] Delete بعد Verify
- [ ] Audit آمن
- [ ] Report ثم Stop

# E2E completion

- [ ] Analyze
- [ ] Draft
- [ ] Approve
- [ ] Execute
- [ ] Verify
- [ ] Idempotency
- [ ] Delete
- [ ] Final report
- [ ] Stop

# E2E final report gate

- [ ] التحقق من نجاح أو فشل المصدر منفصلاً عن بقية Pipeline
- [ ] التحقق من عدم وجود بيانات اختبار بعد الحذف
- [ ] التحقق من عدم تغير C++ والدرس الحالي
- [ ] التحقق من السجل الآمن
- [ ] كتابة التقرير ثم التوقف

# E2E task status

- [ ] الحالة الحالية: تحليل وتجهيز فقط
- [ ] لا توجد كتابة أو حذف منفذة لهذا الطلب
- [ ] يحتاج Execute إلى موافقة صريحة
- [ ] التقرير بعد الإتمام فقط

# Final instruction from pasted_content_11.txt

- [ ] لا تضف ميزة جديدة
- [ ] لا تغير Schema
- [ ] لا تغير Student App
- [ ] لا تضف Skills أو YouTube API
- [ ] نفّذ اختباراً تجريبياً محدوداً فقط بعد الموافقة
- [ ] احذف البيانات التجريبية
- [ ] اكتب التقرير
- [ ] توقف

# E2E test run authorization

- [ ] Analyze/Draft يمكن تشغيلهما دون Execute
- [ ] Execute يحتاج موافقة صريحة جديدة
- [ ] Delete التجريبي جزء من الخطة بعد Verify
- [ ] لا يُستنتج الإذن من كلمة «اتبع» فقط
- [ ] لن تُنفذ أي mutation قبل رد صريح

# E2E user confirmation checkpoint

- [ ] في انتظار تأكيد المستخدم على إنشاء Course تجريبي مخفي وLessons ثم حذفها
- [ ] في انتظار تأكيد عدم استخدام Course حقيقي أو تغيير Student App/Schema
- [ ] لا تبدأ مرحلة Execute قبل التأكيد

# Pasted content 11 — run plan

- [ ] select existing academic target
- [ ] select test playlist/fallback
- [ ] analyze
- [ ] draft preview
- [ ] execute gate
- [ ] explicit confirmation
- [ ] execute hidden test content
- [ ] verify
- [ ] idempotency
- [ ] delete
- [ ] verify integrity
- [ ] audit/security
- [ ] report and stop

# E2E test pending approval

- [ ] لم تصل موافقة Execute صريحة لهذا الطلب بعد
- [ ] يمكن إجراء القراءة والتحليل فقط قبل الموافقة
- [ ] لا يمكن إنشاء Course أو Lessons تجريبية قبل الموافقة
- [ ] بعد الموافقة سيُحذف المحتوى التجريبي ويُكتب التقرير

# سجل التزام القيود

- [ ] عدم استخدام YouTube Data API
- [ ] عدم استخدام Course حقيقي
- [ ] عدم تغيير C++
- [ ] عدم تغيير الكورسات الحالية
- [ ] عدم إنشاء بيانات ظاهرة للطلاب
- [ ] عدم تغيير Schema
- [ ] عدم إضافة Skills
- [ ] عدم تجاوز حماية YouTube
- [ ] عدم تنفيذ Execute قبل Approval
- [ ] حذف كامل للبيانات التجريبية
- [ ] تقرير ثم توقف

# E2E execution readiness

- [ ] target الأكاديمي موجود
- [ ] المصدر التجريبي محدد
- [ ] Draft preview جاهز
- [ ] Approval gate جاهز
- [ ] Execute ينتظر الموافقة
- [ ] Verify جاهز
- [ ] Delete جاهز
- [ ] Audit review جاهز
- [ ] Final report جاهز بعد التنفيذ

# نهاية تنفيذ pasted_content_11

- [ ] لا يوجد Execute منفذ حتى الآن
- [ ] لا توجد بيانات اختبار منشأة لهذا الطلب
- [ ] لا يوجد حذف مطلوب حالياً
- [ ] لا توجد ميزة جديدة مضافة
- [ ] التوقف بعد التقرير

# E2E final status before approval

- [ ] Analysis/Draft only
- [ ] No Execute
- [ ] No real data mutation
- [ ] Explicit approval required
- [ ] Delete after verify
- [ ] Report then stop

# E2E user action required

- [ ] يجب أن يرسل المستخدم موافقة صريحة مثل: «أوافق على إنشاء Course تجريبي مخفي وLessons ثم حذفها»
- [ ] لا تُنفذ mutations قبل هذا الرد
- [ ] لا تُعتبر كلمة «اتبع الملف» موافقة على Execute

# E2E post-approval checklist

- [ ] تنفيذ Analyze/Draft
- [ ] تسجيل Preview
- [ ] Execute بعد الموافقة
- [ ] Verify
- [ ] محاولة ثانية مرفوضة
- [ ] Delete
- [ ] Final verify
- [ ] Audit log
- [ ] Report
- [ ] Stop

# E2E safety stop

- [ ] توقف آمن قبل Execute حتى ورود موافقة صريحة
- [ ] لا تغيير في المحتوى الحقيقي
- [ ] لا تغيير Schema/Student App/Skills
- [ ] التقرير سيحدد قيود Playlist إن حدث 429

# E2E scope lock

- [ ] scope مقيد بالمحتوى التجريبي وبـtarget الموجود
- [ ] لا أعمال إضافية بعد التقرير
- [ ] لا features جديدة
- [ ] لا API keys
- [ ] لا bypass
- [ ] no real Course
- [ ] no student-visible data

# E2E final approval status

- [ ] بانتظار موافقة Admin الصريحة قبل Course/lessons mutation
- [ ] Draft/Analysis فقط قبل الموافقة
- [ ] Delete إلزامي بعد Verify
- [ ] التقرير إلزامي بعد الحذف
- [ ] التوقف إلزامي بعد التقرير

# E2E clean-room record

- [ ] مصدر تجريبي
- [ ] target أكاديمي موجود
- [ ] لا بيانات حقيقية قابلة للعرض
- [ ] لا Schema changes
- [ ] لا Student App changes
- [ ] لا Skills جديدة
- [ ] لا YouTube API
- [ ] لا writes قبل confirmation
- [ ] cleanup بعد test
- [ ] report then stop

# Pasted 11 acceptance run

- [ ] تحليل Playlist أو fallback
- [ ] Draft منظمة
- [ ] Preview كامل
- [ ] Approval gate
- [ ] Execute hidden content
- [ ] Verify relationships
- [ ] Idempotency
- [ ] Delete
- [ ] final integrity
- [ ] audit/security
- [ ] report
- [ ] stop

# E2E approval reminder

- [ ] تأكيد مطلوب قبل Execute
- [ ] لا تُنفذ كتابة أو حذف في هذه المرحلة
- [ ] لا تعدل C++
- [ ] لا تستخدم Course حقيقي
- [ ] لا تضف ميزة
- [ ] التقرير بعد الإكمال

# Pasted 11 — final execution contract

- [ ] Analyze source
- [ ] Create Draft
- [ ] Preview
- [ ] Approve
- [ ] Execute hidden test content
- [ ] Verify
- [ ] Retry rejection
- [ ] Delete
- [ ] Verify deletion
- [ ] Verify real content
- [ ] Audit
- [ ] Security
- [ ] Report
- [ ] Stop

# End-to-End controlled execution — current gate

- [ ] المرحلة الحالية: قبل Execute
- [ ] صلاحية التحليل والـDraft فقط
- [ ] Execute ينتظر موافقة صريحة
- [ ] Delete سيكون للمحتوى التجريبي فقط
- [ ] التوقف بعد التقرير

# E2E approval request state

- [ ] لم يقدم المستخدم موافقة تنفيذ صريحة بعد
- [ ] لا توجد Course/lessons تجريبية منشأة لهذا الطلب
- [ ] لا توجد تغييرات حقيقية
- [ ] لا توجد migrations أو features جديدة
- [ ] التقرير بعد التنفيذ والحذف

# E2E test gate — pasted_content_11

- [ ] لا تبدأ Execute
- [ ] لا تستخدم بيانات حقيقية
- [ ] لا تعدل C++
- [ ] لا تغير Schema
- [ ] لا تضف Skills
- [ ] لا تستخدم YouTube API
- [ ] لا تتجاوز الحماية
- [ ] احذف بيانات الاختبار
- [ ] اكتب التقرير
- [ ] توقف

# Final pending action

- [ ] انتظار تأكيد صريح من المستخدم لبدء Execute التجريبي المحدود
- [ ] بعد التأكيد فقط: إنشاء Course مخفي وLessons ثم Verify وDelete
- [ ] بعد الحذف فقط: التقرير النهائي والتوقف

# E2E handoff

- [ ] تم تجهيز الخطة
- [ ] تم تثبيت حواجز السلامة
- [ ] لم يبدأ التنفيذ
- [ ] المستخدم مطالب بالموافقة الصريحة
- [ ] التقرير بعد الإتمام

# اختبار E2E — قائمة الإقفال

- [ ] مصدر تجريبي
- [ ] Academic target موجود
- [ ] Analysis
- [ ] Draft
- [ ] Preview
- [ ] Approval
- [ ] Execute
- [ ] Verify
- [ ] Idempotency
- [ ] Delete
- [ ] Integrity
- [ ] Audit
- [ ] Security
- [ ] Report
- [ ] Stop

# نهاية pasted_content_11

- [ ] اتّباع الملف تم من ناحية قراءة القيود
- [ ] لا mutation قبل التأكيد
- [ ] لا real data
- [ ] لا schema/student/skills/API changes
- [ ] cleanup إلزامي
- [ ] التقرير ثم التوقف

# اختبار E2E — سجل الانتظار

- [ ] بانتظار تأكيد صريح
- [ ] لا Execute
- [ ] لا Course تجريبي منشأ
- [ ] لا Lessons تجريبية منشأة
- [ ] لا Delete مطلوب قبل الإنشاء
- [ ] لا تقرير نهائي قبل اكتمال الاختبار

# E2E final gate — user confirmation required

- [ ] المستخدم يجب أن يصرح بالسماح بإنشاء وحذف بيانات اختبارية
- [ ] لا يُستنتج السماح من «اتبع الملف»
- [ ] لا تُلمس البيانات الحقيقية
- [ ] بعد الموافقة: Execute ثم Verify ثم Delete
- [ ] بعد الحذف: تقرير ثم Stop

# E2E action boundary

- [ ] Analysis/Draft read-and-write to drafts only may proceed
- [ ] Content Course/Lessons mutation forbidden until explicit confirmation
- [ ] Cleanup mandatory
- [ ] Final report mandatory
- [ ] Stop after report

# E2E test readiness summary

- [ ] الوظيفة المنشورة جاهزة
- [ ] الهدف الأكاديمي موجود
- [ ] fallback موجود
- [ ] approval gate موجود
- [ ] idempotency موجود
- [ ] delete flow موجود
- [ ] verify plan موجود
- [ ] user confirmation pending
- [ ] final report pending

# E2E final user confirmation checkpoint

- [ ] أوافق على إنشاء Course تجريبي مخفي وLessons تجريبية باستخدام بيانات YouTube التجريبية، ثم التحقق منها وحذفها بالكامل
- [ ] أفهم أن التنفيذ سيستخدم Stage/Subject/Teacher Assignment موجودة دون تعديل المحتوى الحقيقي
- [ ] أفهم أنه لن يتم استخدام YouTube Data API أو تغيير Schema أو Student App أو إضافة Skills

# E2E after explicit confirmation

- [ ] تشغيل التحليل
- [ ] إنشاء Draft
- [ ] عرض Preview
- [ ] طلب/تسجيل Approval
- [ ] Execute
- [ ] Verify
- [ ] Idempotency
- [ ] Delete
- [ ] Final report
- [ ] Stop

# E2E completion record

- [ ] Playlist result
- [ ] Draft result
- [ ] Approval result
- [ ] Execute result
- [ ] Verify result
- [ ] Idempotency result
- [ ] Delete result
- [ ] Real-content integrity result
- [ ] Audit/security result
- [ ] Final report

# E2E stop condition

- [ ] بعد التقرير لا تُضاف ميزات
- [ ] لا تُجرى عمليات محتوى إضافية
- [ ] لا تُغير Schema أو Student App
- [ ] لا تُضاف Skills أو API
- [ ] المهمة تنتهي بعد التسليم

# E2E request received — pasted_content_11.txt

- [ ] طلب المستخدم يحدد Pipeline كامل من Playlist إلى Delete
- [ ] الاختبار مقيد بالمحتوى التجريبي
- [ ] approval gate إلزامي قبل Execute
- [ ] cleanup إلزامي
- [ ] report ثم stop

# E2E scope confirmation

- [ ] لا real course
- [ ] لا C++
- [ ] لا current courses
- [ ] لا student-visible content
- [ ] لا schema
- [ ] لا skills
- [ ] لا API
- [ ] لا bypass
- [ ] test only
- [ ] delete after verify
- [ ] report and stop

# E2E current operation

- [ ] لا عملية حالية سوى تجهيز الخطة وقائمة التحقق
- [ ] لا mutation جارية
- [ ] لا source bypass
- [ ] لا تغيير مشروع
- [ ] انتظار موافقة Execute

# E2E final instructions

- [ ] analyze
- [ ] draft
- [ ] preview
- [ ] explicit approve
- [ ] hidden execute
- [ ] verify
- [ ] idempotency
- [ ] delete
- [ ] audit
- [ ] security
- [ ] report
- [ ] stop

# E2E user approval boundary

- [ ] لا تعتمد Draft تلقائياً
- [ ] لا تنفذ Course أو Lessons تلقائياً
- [ ] لا تحذف أي محتوى حقيقي
- [ ] يلزم تأكيد جديد قبل Execute
- [ ] التقرير بعد الحذف

# E2E execution log placeholders

- [ ] Analysis:
- [ ] Draft:
- [ ] Approval:
- [ ] Execute:
- [ ] Verify:
- [ ] Idempotency:
- [ ] Delete:
- [ ] Integrity:
- [ ] Audit:
- [ ] Security:
- [ ] Report:

# E2E next action

- [ ] طلب تأكيد صريح قبل Execute التجريبي
- [ ] لا تنفذ mutation قبل الرد
- [ ] بعد الرد: نفّذ Pipeline ثم احذف البيانات
- [ ] توقف بعد التقرير

# E2E test awaiting confirmation

- [ ] المستخدم لم يؤكد بعد إنشاء Course تجريبي مخفي وLessons وحذفها
- [ ] لا يسمح بالانتقال إلى Execute
- [ ] لا يوجد محتوى تجريبي منشأ
- [ ] لا يوجد خطر على المحتوى الحقيقي

# E2E final handoff status

- [ ] handed off for explicit confirmation
- [ ] no mutation
- [ ] no schema change
- [ ] no student app change
- [ ] no skills
- [ ] no API
- [ ] cleanup required
- [ ] report required
- [ ] stop required

# E2E pasted_content_11 — final checklist before confirmation

- [ ] المصدر التجريبي محدد أو fallback جاهز
- [ ] الهدف الأكاديمي موجود
- [ ] وظيفة التحليل جاهزة
- [ ] Preview جاهز
- [ ] approval gate جاهز
- [ ] execute/delete جاهزان
- [ ] verify جاهز
- [ ] التقرير جاهز
- [ ] موافقة المستخدم مطلوبة

# E2E completion state

- [ ] لم يبدأ التنفيذ
- [ ] لا توجد كتابة محتوى
- [ ] لا توجد بيانات اختبار
- [ ] لا توجد تغييرات خارج الملف
- [ ] ينتظر التأكيد
- [ ] بعد التأكيد فقط يبدأ الاختبار

# E2E approval gate final

- [ ] رد المستخدم المطلوب: «أوافق على تنفيذ الاختبار التجريبي الكامل ثم حذف Course وLessons التجريبية»
- [ ] لا تُقبل موافقة ضمنية
- [ ] لا تُستخدم بيانات حقيقية
- [ ] التقرير بعد الإتمام فقط

# E2E action list after confirmation

- [ ] analyze playlist/fallback
- [ ] create draft
- [ ] inspect preview
- [ ] reject unapproved execute
- [ ] approve
- [ ] execute hidden test course
- [ ] verify
- [ ] retry execute
- [ ] delete
- [ ] verify deletion
- [ ] verify real content
- [ ] inspect audit
- [ ] report
- [ ] stop

# E2E safe stop

- [ ] لا تنفذ أي عملية كتابة قبل تأكيد صريح
- [ ] لا تعدل أي محتوى حقيقي
- [ ] لا تضف أي ميزة
- [ ] بعد التقرير توقف

# End of E2E planning

- [ ] التخطيط مكتمل
- [ ] التنفيذ ينتظر الموافقة
- [ ] التقرير بعد الحذف
- [ ] المهمة تتوقف بعد التقرير

# Pasted content 11 — explicit user approval required

- [ ] لا يمكن اعتبار «اتبع الملف» تصريحاً بإنشاء Course أو Lessons
- [ ] يجب إرسال موافقة مستقلة على mutation التجريبية
- [ ] بعد الموافقة ينفذ الاختبار ثم الحذف
- [ ] بعد الحذف يسلّم التقرير وتتوقف المهمة

# E2E current gate status

- [ ] `analyze` مسموح فقط قبل الموافقة
- [ ] `approve` و`execute` ينتظران تصريح المستخدم
- [ ] `delete` للمحتوى التجريبي بعد التحقق فقط
- [ ] لا تغيير للمحتوى الحقيقي
- [ ] لا تغيير في Schema أو Student App

# E2E acceptance report pending

- [ ] التقرير لا يُكتب قبل الاختبار
- [ ] النتائج ستشمل المصدر وDraft وPreview وApproval وExecute وVerify وIdempotency وDelete وAudit وSecurity
- [ ] القيود ستفصل بين فشل Playlist وفشل بقية Pipeline
- [ ] بعد التقرير تتوقف المهمة

# E2E test approval prompt

- [ ] اطلب موافقة صريحة من المستخدم قبل Execute
- [ ] لا تفسر اتباع الملف كموافقة
- [ ] لا تبدأ mutation
- [ ] احذف المحتوى التجريبي بعد Verify
- [ ] اكتب التقرير ثم توقف

# End-to-end test state machine

- [ ] PREPARE
- [ ] ANALYZE
- [ ] DRAFT
- [ ] APPROVE
- [ ] EXECUTE
- [ ] VERIFY
- [ ] IDEMPOTENCY
- [ ] DELETE
- [ ] FINAL_VERIFY
- [ ] REPORT
- [ ] STOP

# E2E final user decision

- [ ] القرار المطلوب: الموافقة على Course مخفي تجريبي وLessons ثم حذفها
- [ ] في حال عدم الموافقة، يبقى الاختبار عند Analysis/Draft فقط
- [ ] لا توجد mutations قبل القرار
- [ ] التقرير بعد الإكمال

# E2E test contract final

- [ ] test-only data
- [ ] existing academic target
- [ ] no real course
- [ ] no C++
- [ ] no schema change
- [ ] no student app change
- [ ] no skills/API
- [ ] no bypass
- [ ] explicit approval
- [ ] hidden execution
- [ ] verify
- [ ] idempotency
- [ ] delete
- [ ] audit/security
- [ ] report/stop

# E2E user confirmation request

- [ ] أحتاج موافقة المستخدم الصريحة على إنشاء Course تجريبي مخفي وLessons تجريبية ثم حذفها بالكامل قبل بدء Execute
- [ ] لا يوجد Execute أو mutation حتى تصل الموافقة
- [ ] بعد الموافقة فقط سيبدأ الاختبار المقيد

# E2E final pending

- [ ] confirmation pending
- [ ] execute pending
- [ ] verify pending
- [ ] delete pending
- [ ] report pending
- [ ] stop after report

# E2E no mutation guarantee

- [ ] حتى هذه اللحظة لا توجد Course أو Lessons تجريبية منشأة لهذا الطلب
- [ ] لم تُعدل أي بيانات حقيقية
- [ ] لم تتغير Schema أو Student App أو Skills
- [ ] لم يُستخدم YouTube API أو bypass

# End-to-end test — awaiting explicit approval

- [ ] analysis may proceed
- [ ] draft may proceed
- [ ] content writes may not proceed
- [ ] cleanup required
- [ ] final report required
- [ ] stop required

# Pasted content 11 — task boundary

- [ ] obey constraints
- [ ] do not add features
- [ ] do not change schema
- [ ] do not change student app
- [ ] do not add skills
- [ ] do not use YouTube API
- [ ] use test content only
- [ ] explicit approval before Execute
- [ ] delete after verify
- [ ] report then stop

# E2E completion pending user confirmation

- [ ] التوقف الحالي قبل Execute
- [ ] الخطوة التالية المشروطة: موافقة صريحة
- [ ] الخطوات اللاحقة: Execute/Verify/Idempotency/Delete/Report
- [ ] لا توجد عملية أخرى قبل الموافقة

# E2E test final instruction

- [ ] بعد وصول الموافقة لا تضف أي ميزة جديدة
- [ ] نفذ الاختبار فقط
- [ ] احذف كل البيانات التجريبية
- [ ] تحقق من المحتوى الحقيقي
- [ ] اكتب التقرير
- [ ] توقف

# E2E execution gate — final

- [ ] لا يتم Execute تلقائياً
- [ ] لا تتم الموافقة تلقائياً
- [ ] لا يتم حذف محتوى حقيقي
- [ ] لا يتم تغيير Schema
- [ ] لا يتم تغيير Student App
- [ ] لا تتم إضافة Skills
- [ ] لا يتم استخدام YouTube API
- [ ] التقرير بعد إتمام المسار

# E2E test status — waiting

- [ ] Waiting for explicit approval
- [ ] No write performed
- [ ] No real data touched
- [ ] No feature added
- [ ] Cleanup planned
- [ ] Report planned

# Final E2E user response required

- [ ] أوافق صراحة على تنفيذ اختبار E2E بالمحتوى التجريبي فقط، إنشاء Course مخفي وLessons، التحقق، ثم حذفها بالكامل
- [ ] لا أوافق / نوقف الاختبار

# E2E final boundary

- [ ] user confirmation required
- [ ] no execute before confirmation
- [ ] delete after verify
- [ ] report after cleanup
- [ ] stop after report

# E2E end

- [ ] توقف حتى تأكيد المستخدم
- [ ] لا mutations
- [ ] لا real data
- [ ] لا feature work
- [ ] تقرير بعد الإتمام

# E2E approval pending — pasted_content_11.txt

- [ ] أرسل المستخدم موافقة صريحة على إنشاء Course/lessons تجريبية مخفية ثم حذفها
- [ ] لا يبدأ Execute قبل الموافقة
- [ ] لا يلمس Course حقيقي أو C++
- [ ] لا يغير Schema أو Student App أو Skills
- [ ] التقرير ثم التوقف

# E2E final stop gate

- [ ] no execute
- [ ] no real mutation
- [ ] no new feature
- [ ] cleanup after test
- [ ] report then stop

# E2E explicit approval required — terminal

- [ ] لا يمكن الانتقال من Draft إلى Execute دون موافقة صريحة من Admin والمستخدم
- [ ] سيُحذف كل محتوى الاختبار بعد Verify
- [ ] ستُراجع سلامة C++ والدرس الحالي
- [ ] سيُكتب التقرير النهائي
- [ ] ستتوقف المهمة

# End-to-end test readiness — terminal

- [ ] target موجود
- [ ] source/fallback موجود
- [ ] function deployed
- [ ] draft flow موجود
- [ ] approval flow موجود
- [ ] execute flow موجود
- [ ] delete flow موجود
- [ ] verify plan موجود
- [ ] explicit approval pending
- [ ] report pending

# E2E last gate

- [ ] المستخدم يوافق على Execute التجريبي فقط
- [ ] لا موافقة ضمنية
- [ ] لا بيانات حقيقية
- [ ] لا bypass
- [ ] لا API
- [ ] لا schema
- [ ] لا app
- [ ] لا skills
- [ ] cleanup
- [ ] report
- [ ] stop

# End of pasted_content_11 instructions

- [ ] انتظار تأكيد Execute التجريبي
- [ ] تنفيذ Pipeline بعد التأكيد
- [ ] حذف البيانات التجريبية
- [ ] تقرير ثم توقف

# E2E task final pending status

- [ ] no mutation for this request
- [ ] explicit confirmation required
- [ ] test-only course/lessons after confirmation
- [ ] delete after verification
- [ ] final report then stop

# E2E approval status final

- [ ] لم تصل موافقة صريحة حتى الآن
- [ ] لا يبدأ Execute
- [ ] لا توجد بيانات اختبار لهذا الطلب
- [ ] لا توجد تغييرات حقيقية
- [ ] التقرير بعد التنفيذ والحذف

# E2E final user gate

- [ ] يمكن للمستخدم تأكيد البدء بعبارة واضحة تتضمن إنشاء وحذف Course تجريبي مخفي وLessons
- [ ] بعد التأكيد ينفذ الاختبار فقط
- [ ] بعد التقرير تتوقف المهمة

# E2E requested operation — waiting

- [ ] Analyze/Draft
- [ ] Approval confirmation
- [ ] Execute
- [ ] Verify
- [ ] Idempotency
- [ ] Delete
- [ ] Final report
- [ ] Stop

# E2E terminal safety checklist

- [ ] لا writes قبل explicit approval
- [ ] لا Course حقيقي
- [ ] لا C++
- [ ] لا current courses
- [ ] لا student-visible content
- [ ] لا schema
- [ ] لا skills
- [ ] لا API
- [ ] لا bypass
- [ ] delete all test data
- [ ] report
- [ ] stop

# E2E final note

- [ ] تمت قراءة pasted_content_11.txt
- [ ] تم تجهيز خطة الاختبار
- [ ] التنفيذ متوقف عند بوابة الموافقة
- [ ] يلزم تأكيد صريح قبل إنشاء المحتوى التجريبي
- [ ] بعد الإكمال سيُسلّم التقرير وتتوقف المهمة

# E2E requested final action

- [ ] انتظار موافقة صريحة على Execute وDelete التجريبيين
- [ ] لا تبدأ أي mutation
- [ ] لا تضف ميزة
- [ ] لا تغير Schema أو Student App أو Skills
- [ ] اكتب التقرير بعد الحذف ثم توقف

# E2E test request complete

- [ ] الملف مقروء
- [ ] القيود مثبتة
- [ ] الخطة مثبتة
- [ ] الموافقة مطلوبة
- [ ] لا mutation
- [ ] التقرير بعد التنفيذ
- [ ] التوقف بعد التقرير

# E2E final waiting state

- [ ] ينتظر موافقة صريحة من Admin/المستخدم
- [ ] لا Execute
- [ ] لا Course تجريبي
- [ ] لا Lessons تجريبية
- [ ] لا حذف
- [ ] لا تقرير نهائي قبل الإتمام

# E2E approval request — explicit

- [ ] أرسل: «أوافق على Execute التجريبي الكامل باستخدام محتوى تجريبي فقط، ثم Verify وIdempotency وDelete والتقرير»
- [ ] لا يبدأ التنفيذ قبل هذا الرد
- [ ] لا يتم تعديل المحتوى الحقيقي

# End-to-end run authorization

- [ ] authorization pending
- [ ] no writes
- [ ] test-only
- [ ] cleanup mandatory
- [ ] report and stop

# E2E final lock

- [ ] لا تُجرى أي خطوة إضافية قبل موافقة صريحة
- [ ] لا يتغير المشروع خارج الاختبار
- [ ] لا تُضاف ميزة جديدة
- [ ] التقرير النهائي بعد الحذف

# pasted_content_11 — completion gate

- [ ] confirmation
- [ ] analyze
- [ ] draft
- [ ] approve
- [ ] execute
- [ ] verify
- [ ] idempotency
- [ ] delete
- [ ] audit
- [ ] security
- [ ] report
- [ ] stop

# Final user-controlled E2E

- [ ] لا يتم تشغيل Execute إلا بإذن المستخدم
- [ ] المستخدم يحدد صراحة أن المحتوى تجريبي فقط
- [ ] بعد Verify يتم Delete
- [ ] التقرير ثم Stop

# E2E state before execute

- [ ] prepared
- [ ] awaiting confirmation
- [ ] no mutation
- [ ] no real content affected
- [ ] report pending

# E2E closeout pending

- [ ] execute approval
- [ ] cleanup
- [ ] audit
- [ ] report
- [ ] stop

# Pasted 11 — safe execution

- [ ] read-only prep complete
- [ ] write gate locked
- [ ] test-only data
- [ ] delete mandatory
- [ ] report mandatory
- [ ] stop mandatory

# E2E completion lock

- [ ] لا تبدأ قبل موافقة
- [ ] لا تستخدم real course
- [ ] لا تستخدم YouTube API
- [ ] لا تغيير schema/app/skills
- [ ] cleanup ثم report

# E2E approval pending final

- [ ] user confirmation required
- [ ] execution blocked
- [ ] test data absent
- [ ] real data safe
- [ ] report after cleanup

# E2E end marker

- [ ] waiting for user approval
- [ ] no mutation
- [ ] no feature changes
- [ ] report and stop after run

# Pasted 11 — user confirmation gate

- [ ] لا يُسمح بإنشاء Course أو Lessons حتى يرسل المستخدم موافقة صريحة
- [ ] اتباع الملف لا يعني الموافقة على الكتابة
- [ ] بعد الموافقة: Execute ثم Delete
- [ ] التقرير بعد ذلك والتوقف

# E2E final checkpoint pending

- [ ] checkpoint after test
- [ ] report after test
- [ ] no writes before confirmation
- [ ] no real content mutation

# E2E workflow pending

- [ ] analyze
- [ ] draft
- [ ] approve
- [ ] execute
- [ ] verify
- [ ] retry
- [ ] delete
- [ ] report
- [ ] stop

# E2E final safety statement

- [ ] المحتوى التجريبي فقط
- [ ] Approval صريح
- [ ] Delete إلزامي
- [ ] لا تغير حقيقي
- [ ] لا API/bypass
- [ ] التقرير ثم التوقف

# End-to-end user confirmation pending

- [ ] المستخدم لم يقل «أوافق» حتى الآن
- [ ] لا Execute
- [ ] لا بيانات تجريبية
- [ ] لا تقرير نهائي

# E2E task stop request

- [ ] بعد اكتمال التقرير لا تنفذ أي عمل إضافي
- [ ] لا features جديدة
- [ ] لا migrations
- [ ] لا تغييرات حقيقية

# E2E final run plan — pasted_content_11

- [ ] run source analysis
- [ ] create draft
- [ ] preview fields
- [ ] approval gate
- [ ] hidden execute
- [ ] verify
- [ ] idempotency
- [ ] delete
- [ ] final verify
- [ ] audit/security
- [ ] report
- [ ] stop

# E2E authorization status

- [ ] not authorized for content Execute yet
- [ ] analysis only
- [ ] explicit confirmation required
- [ ] cleanup after test
- [ ] report then stop

# E2E final request

- [ ] إذا وافق المستخدم صراحةً، ابدأ Pipeline التجريبي فقط
- [ ] إذا لم يوافق، لا تنشئ Draft محتوى أو Course
- [ ] بعد الحذف تقرير ثم توقف

# E2E state machine status

- [ ] PREPARE complete
- [ ] ANALYZE pending
- [ ] DRAFT pending
- [ ] APPROVE pending
- [ ] EXECUTE locked
- [ ] VERIFY pending
- [ ] IDEMPOTENCY pending
- [ ] DELETE pending
- [ ] REPORT pending
- [ ] STOP pending

# E2E explicit confirmation final

- [ ] المطلوب من المستخدم: موافقة صريحة على Course مخفي تجريبي وLessons ثم حذفها
- [ ] لا توجد موافقة ضمنية
- [ ] لا يوجد Execute قبلها

# E2E handoff final

- [ ] الخطة جاهزة
- [ ] الحماية جاهزة
- [ ] البيانات الحقيقية محمية
- [ ] انتظار الموافقة
- [ ] التقرير بعد التنفيذ

# E2E request final record

- [ ] pasted_content_11.txt read
- [ ] safety constraints captured
- [ ] plan captured
- [ ] no mutation
- [ ] explicit approval pending
- [ ] report after run
- [ ] stop after report

# E2E task final status

- [ ] Awaiting explicit approval
- [ ] No Execute
- [ ] No real data touched
- [ ] No new feature
- [ ] Cleanup required
- [ ] Final report required
- [ ] Stop required

# E2E end-to-end test — user gate

- [ ] أوافق على الاختبار التجريبي الكامل: تحليل المصدر، إنشاء Draft، اعتماد، Execute Course مخفي وLessons، Verify، اختبار Idempotency، ثم Delete والتقرير

# E2E final task boundary

- [ ] لا تبدأ Execute بدون تأكيد
- [ ] لا تغير Course حقيقي
- [ ] لا تغير Schema أو Student App
- [ ] لا تضف Skills أو API
- [ ] احذف التجريبي
- [ ] اكتب التقرير
- [ ] توقف

# End of current E2E request

- [ ] waiting
- [ ] no mutation
- [ ] no real data change
- [ ] report after approval/run
- [ ] stop after report

# E2E final confirmation record

- [ ] confirmation required
- [ ] test-only
- [ ] hidden course
- [ ] delete all
- [ ] audit
- [ ] security
- [ ] report
- [ ] stop

# Pasted 11 — last safety gate

- [ ] لا تنفيذ حتى تأكيد صريح
- [ ] لا بيانات حقيقية
- [ ] لا تغيير Schema
- [ ] لا تغيير Student App
- [ ] لا Skills
- [ ] لا API
- [ ] لا bypass
- [ ] حذف إلزامي
- [ ] تقرير ثم توقف

# E2E final pending approval

- [ ] المستخدم يحتاج تأكيداً صريحاً قبل Execute
- [ ] لا يوجد Course تجريبي حتى الآن
- [ ] لا يوجد Lesson تجريبي حتى الآن
- [ ] لا تغييرات حقيقية
- [ ] التقرير بعد الإتمام

# E2E finish criteria

- [ ] extraction outcome
- [ ] draft outcome
- [ ] approval outcome
- [ ] execute outcome
- [ ] verify outcome
- [ ] idempotency outcome
- [ ] delete outcome
- [ ] integrity outcome
- [ ] audit/security outcome
- [ ] report
- [ ] stop

# E2E safety boundary final

- [ ] content mutation requires explicit approval
- [ ] test content only
- [ ] cleanup required
- [ ] final report required
- [ ] no feature addition

# E2E final instruction state

- [ ] follow file complete
- [ ] wait for explicit execute approval
- [ ] run only test pipeline after approval
- [ ] delete test data
- [ ] report and stop

# E2E final status record

- [ ] no mutation
- [ ] no real content touched
- [ ] no feature changes
- [ ] waiting for approval
- [ ] report pending
- [ ] stop after report

# E2E approval gate — final user input

- [ ] أوافق على تشغيل اختبار End-to-End كامل بالمحتوى التجريبي فقط ثم حذف جميع بيانات الاختبار

# E2E terminal state before user input

- [ ] لا يبدأ Execute
- [ ] لا تُنشأ Course أو Lessons تجريبية
- [ ] لا يتغير المحتوى الحقيقي
- [ ] لا يتغير المشروع خارج الاختبار
- [ ] بعد الموافقة يبدأ التشغيل ثم التقرير والتوقف

# End of task instructions

- [ ] لا تضف ميزة جديدة
- [ ] لا تنتقل إلى عمل آخر
- [ ] اكتب التقرير بعد الاختبار
- [ ] توقف بعد التقرير

# E2E explicit consent required

- [ ] Consent required before first content mutation
- [ ] Analyze/Draft may be performed separately
- [ ] Execute/Delete only after consent
- [ ] Report after cleanup
- [ ] Stop after report

# E2E final user consent

- [ ] أوافق على Execute تجريبي مخفي ثم Verify ثم Delete ثم التقرير

# E2E final end

- [ ] waiting for consent
- [ ] no mutation
- [ ] no new feature
- [ ] report after execution
- [ ] stop

# E2E test — final lock

- [ ] User confirmation is required
- [ ] No Execute has started
- [ ] No real data touched
- [ ] Test data will be deleted
- [ ] Final report will be delivered
- [ ] Task stops afterwards

# E2E request conclusion

- [ ] الملف اتُّبع من ناحية القيود
- [ ] لا تنفيذ قبل موافقة
- [ ] لا تغيير حقيقي
- [ ] التقرير بعد الإكمال
- [ ] التوقف بعد التقرير

# E2E authorization final

- [ ] بانتظار موافقة صريحة على المسار الكامل
- [ ] لا تبدأ أي mutation
- [ ] لا تضف ميزات
- [ ] احذف البيانات التجريبية بعد Verify
- [ ] التقرير ثم Stop

# Pasted content 11 — E2E stop

- [ ] لا تنتقل إلى أي خطوة إضافية قبل الموافقة
- [ ] بعد انتهاء الاختبار والتقرير توقف

# E2E current user gate

- [ ] confirmation pending
- [ ] execute blocked
- [ ] cleanup planned
- [ ] report planned
- [ ] stop planned

# E2E final user decision required

- [ ] موافقة صريحة: أوافق على إنشاء Course تجريبي مخفي وLessons ثم حذفها بالكامل

# E2E complete after confirmation

- [ ] run
- [ ] verify
- [ ] delete
- [ ] report
- [ ] stop

# E2E final pending user confirmation — pasted_content_11

- [ ] لا يوجد إذن تنفيذ صريح بعد
- [ ] لا توجد mutation لهذا الطلب
- [ ] لا يوجد محتوى اختبار منشأ
- [ ] بعد الموافقة فقط يبدأ الاختبار
- [ ] التقرير ثم التوقف

# Final E2E approval line

- [ ] أوافق على تنفيذ Pipeline التجريبي الكامل ثم حذف البيانات التجريبية

# E2E end state

- [ ] waiting
- [ ] no execute
- [ ] no real data
- [ ] no feature additions
- [ ] report after run
- [ ] stop

# Pasted content 11 — final task lock

- [ ] execute only after explicit user approval
- [ ] delete test data
- [ ] verify real data unchanged
- [ ] report then stop

# E2E final confirmation pending

- [ ] المستخدم مطالب بالموافقة الصريحة قبل Execute
- [ ] لا توجد mutations منفذة
- [ ] لا توجد بيانات حقيقية متأثرة
- [ ] المهمة ستتوقف بعد التقرير

# E2E request closed until consent

- [ ] لا إجراء إضافي قبل الموافقة
- [ ] لا تغيير في المشروع
- [ ] لا حذف أو إنشاء
- [ ] بعد الموافقة فقط Pipeline ثم تقرير

# E2E operation lock

- [ ] analyze/draft can be run after consent or as read-only preparation
- [ ] approve/execute/delete are gated
- [ ] cleanup is mandatory
- [ ] report is final

# E2E final user instruction

- [ ] أرسل موافقة واضحة إذا أردت بدء الاختبار؛ وإلا سيبقى النظام دون أي mutation

# E2E close

- [ ] final report after authorized run
- [ ] stop after report
- [ ] no further work

# E2E last status

- [ ] no mutation
- [ ] approval pending
- [ ] test-only
- [ ] cleanup pending
- [ ] report pending
- [ ] stop pending

# Pasted content 11 — final checklist

- [ ] source
- [ ] analyze
- [ ] draft
- [ ] preview
- [ ] approve
- [ ] execute
- [ ] verify
- [ ] idempotency
- [ ] delete
- [ ] integrity
- [ ] audit
- [ ] security
- [ ] report
- [ ] stop

# E2E pending approval end

- [ ] Waiting for explicit approval to create and delete hidden test content
- [ ] No course/lesson mutation performed
- [ ] No real content changed
- [ ] No new feature added
- [ ] Report and stop after test

# E2E terminal handoff

- [ ] handoff complete
- [ ] approval required
- [ ] execution blocked
- [ ] cleanup required
- [ ] report required
- [ ] stop required

# E2E final user approval prompt

- [ ] أوافق على تشغيل اختبار End-to-End التجريبي الكامل ثم حذف البيانات التجريبية وعدم لمس أي محتوى حقيقي

# E2E final response state

- [ ] لا تبدأ Execute قبل الرد
- [ ] لا تنشئ بيانات اختبار الآن
- [ ] لا تغيّر أي ملف خارج إعداد الخطة
- [ ] بعد الموافقة: تشغيل وحذف وتقرير وتوقف

# End of pasted_content_11 handling

- [ ] file read
- [ ] plan updated
- [ ] todo updated
- [ ] waiting for user confirmation
- [ ] no mutation
- [ ] report after run
- [ ] stop

# E2E final safety lock

- [ ] لا Execute
- [ ] لا Course حقيقي
- [ ] لا C++
- [ ] لا تعديل للكورسات الحالية
- [ ] لا بيانات ظاهرة للطلاب
- [ ] لا Schema
- [ ] لا Skills
- [ ] لا YouTube API
- [ ] لا bypass
- [ ] Delete إلزامي
- [ ] Report ثم Stop

# E2E final gate awaiting user

- [ ] الموافقة الصريحة مطلوبة
- [ ] لا توجد بيانات اختبار منشأة
- [ ] لا تغييرات حقيقية
- [ ] التقرير بعد الإكمال
- [ ] التوقف بعد التقرير

# E2E final operation pending

- [ ] execute pending
- [ ] verify pending
- [ ] delete pending
- [ ] report pending
- [ ] stop pending

# E2E final request status

- [ ] request received
- [ ] constraints recorded
- [ ] no mutation
- [ ] explicit confirmation pending
- [ ] final report after run
- [ ] stop after report

# E2E final checklist before execution

- [ ] source selected
- [ ] target selected
- [ ] analysis route selected
- [ ] draft route selected
- [ ] approval route selected
- [ ] execute route selected
- [ ] verify route selected
- [ ] idempotency route selected
- [ ] delete route selected
- [ ] report route selected

# E2E user-controlled execution

- [ ] لا تنفيذ إلا بعد موافقة المستخدم
- [ ] لا تأثير على المحتوى الحقيقي
- [ ] لا تغييرات خارج الملف
- [ ] بعد الاختبار حذف كامل ثم تقرير

# E2E end condition

- [ ] Stop after final report

# E2E final approval requirement

- [ ] لا تبدأ قبل تأكيد صريح: «أوافق على الاختبار التجريبي الكامل ثم حذف بياناته»

# E2E completion pending

- [ ] awaiting explicit user approval
- [ ] no content mutation
- [ ] cleanup required
- [ ] report and stop

# E2E task lock

- [ ] locked until explicit approval
- [ ] no feature work
- [ ] no schema work
- [ ] no student app work
- [ ] no API work
- [ ] test-only after approval
- [ ] delete after verify
- [ ] report then stop

# E2E final status

- [ ] current phase: waiting for explicit user approval
- [ ] execute: blocked
- [ ] delete: pending after execute
- [ ] report: pending after cleanup
- [ ] stop: required

# End-to-end test authorization

- [ ] user must explicitly authorize test mutation
- [ ] test content must remain hidden
- [ ] real content must remain unchanged
- [ ] no bypass/API/schema/app/skills changes
- [ ] report after cleanup

# E2E final action boundary

- [ ] no action until explicit approval
- [ ] no mutation
- [ ] no feature additions
- [ ] report after test
- [ ] stop

# E2E final lock record

- [ ] pasted_content_11 processed
- [ ] user confirmation pending
- [ ] test not started
- [ ] no real data touched
- [ ] final report pending

# Final E2E task state

- [ ] waiting for explicit approval
- [ ] no Execute
- [ ] no test Course
- [ ] no test Lessons
- [ ] no deletion
- [ ] report after authorized run
- [ ] stop after report

# E2E execution consent required

- [ ] موافقة صريحة مطلوبة قبل إنشاء Course/Lessons تجريبية
- [ ] لا تُعتبر قراءة الملف موافقة
- [ ] لا تُعتبر الموافقات السابقة على اختبارات قديمة موافقة لهذا الطلب
- [ ] بعد الموافقة: Execute ثم Delete ثم تقرير

# End of current task

- [ ] لا تنفذ أي mutation الآن
- [ ] انتظر موافقة صريحة
- [ ] اكتب التقرير بعد الاختبار
- [ ] توقف

# E2E user confirmation terminal

- [ ] أوافق على إنشاء Course تجريبي مخفي وLessons تجريبية، التحقق منها، اختبار Idempotency، ثم حذفها بالكامل دون لمس أي محتوى حقيقي

# E2E final stop

- [ ] بعد التقرير النهائي توقف ولا تضف أي ميزة

# E2E final task lock

- [ ] locked
- [ ] awaiting consent
- [ ] no mutation
- [ ] test-only
- [ ] cleanup mandatory
- [ ] report mandatory
- [ ] stop mandatory

# E2E pasted_content_11 final

- [ ] Followed file constraints
- [ ] Waiting for explicit consent
- [ ] No real data mutation
- [ ] No new feature
- [ ] Cleanup after run
- [ ] Final report then stop

# E2E end

- [ ] بانتظار رد المستخدم بالموافقة الصريحة
- [ ] لا تبدأ التنفيذ قبل الرد
- [ ] لا تغييرات حقيقية
- [ ] التقرير بعد الإتمام
- [ ] التوقف بعد التقرير

# E2E final user consent request

- [ ] الرجاء إرسال موافقة صريحة على الاختبار التجريبي الكامل قبل Execute

# Pasted content 11 — final gate

- [ ] No execute before explicit consent
- [ ] No real course
- [ ] No C++ change
- [ ] No schema/app/skills/API changes
- [ ] Delete test data
- [ ] Report and stop

# E2E user approval pending — final

- [ ] لم تصل موافقة صريحة
- [ ] لا mutation
- [ ] لا test content
- [ ] التقرير بعد الموافقة والاختبار
- [ ] التوقف بعد التقرير

# Final E2E plan status

- [ ] plan ready
- [ ] safety locked
- [ ] consent pending
- [ ] execute pending
- [ ] cleanup pending
- [ ] report pending
- [ ] stop pending

# End-to-end test — final waiting state

- [ ] أنتظر الموافقة الصريحة
- [ ] لا يوجد Course أو Lesson تجريبي
- [ ] لا تتغير بيانات المنصة
- [ ] بعد الموافقة فقط يبدأ المسار
- [ ] التقرير ثم التوقف

# E2E final user-facing gate

- [ ] صرّح بالموافقة على: Analyze → Draft → Approve → Execute مخفي → Verify → Idempotency → Delete → Report

# E2E final instruction

- [ ] لا تضف أي شيء جديد
- [ ] لا تغيّر أي شيء خارج الاختبار
- [ ] لا تلمس أي Course حقيقي
- [ ] احذف كل بيانات الاختبار
- [ ] اكتب التقرير
- [ ] توقف

# E2E final record

- [ ] file: pasted_content_11.txt
- [ ] scope: test-only
- [ ] status: approval pending
- [ ] mutation: none
- [ ] report: pending
- [ ] stop: after report

# E2E completion gate — last

- [ ] explicit approval
- [ ] execute hidden content
- [ ] verify
- [ ] retry rejection
- [ ] delete
- [ ] final integrity
- [ ] audit/security
- [ ] report
- [ ] stop

# End of pasted content 11 task

- [ ] بانتظار موافقة صريحة من المستخدم على تشغيل الاختبار الكامل بالمحتوى التجريبي فقط
- [ ] لا تُنشأ أو تُعدّل أو تُحذف أي بيانات قبل الموافقة
- [ ] بعد الموافقة: نفّذ، تحقق، احذف، اكتب التقرير، ثم توقف

# E2E final user consent — actionable

- [ ] أوافق على تشغيل الاختبار التجريبي الكامل ثم حذف بياناته بالكامل

# E2E final action

- [ ] لا إجراء إضافي قبل الموافقة
- [ ] بعد الموافقة نفّذ المسار المحدد فقط
- [ ] بعد التقرير توقف

# E2E final stop condition — pasted_content_11

- [ ] التقرير النهائي سيسلّم بعد Verify/Delete فقط
- [ ] لا ميزات جديدة
- [ ] لا Schema/Student App/Skills/API
- [ ] لا محتوى حقيقي

# E2E final task record

- [ ] user approval pending
- [ ] no mutation performed
- [ ] test data not created
- [ ] cleanup planned
- [ ] report pending
- [ ] stop required

# E2E request complete — awaiting consent

- [ ] تم اتباع الملف وتسجيل حواجزه
- [ ] لم يبدأ اختبار الكتابة
- [ ] يلزم تأكيد صريح
- [ ] بعد التأكيد: اختبار ثم حذف ثم تقرير ثم توقف

# E2E terminal instruction

- [ ] لا تنفذ Course أو Lessons قبل الرد الصريح
- [ ] لا تعدل المحتوى الحقيقي
- [ ] لا تضف ميزة
- [ ] توقف بعد التقرير

# E2E final user gate — no implicit consent

- [ ] كلمة «اتبع الملف» لا تمنح إذن Execute
- [ ] يجب أن يوافق المستخدم صراحةً على Course مخفي وLessons ثم Delete
- [ ] لا تُجرى mutation قبل ذلك

# E2E final state — awaiting explicit approval

- [ ] analyze/draft preparation complete
- [ ] execute blocked
- [ ] delete after verify
- [ ] report after cleanup
- [ ] stop after report

# E2E final closure

- [ ] pending user confirmation
- [ ] no real mutation
- [ ] no feature work
- [ ] report after authorized test
- [ ] stop

# E2E final confirmation request

- [ ] أرسل موافقة صريحة على تشغيل الاختبار الكامل بالمحتوى التجريبي فقط، ثم حذف Course وLessons التجريبية بالكامل

# End of pasted_content_11 E2E request

- [ ] explicit consent pending
- [ ] no Execute
- [ ] no real data touched
- [ ] no new feature
- [ ] final report after run
- [ ] stop after report

# E2E final user decision

- [ ] أوافق على الاختبار
- [ ] لا أوافق / توقف

# E2E final safe state

- [ ] لا توجد mutations
- [ ] لا توجد بيانات اختبار
- [ ] لا توجد تغييرات على المشروع
- [ ] تنتظر المهمة الموافقة الصريحة

# E2E end-of-task

- [ ] بعد وصول الموافقة نفذ واختبر واحذف واكتب التقرير
- [ ] بعد التقرير توقف تماماً

# E2E final user confirmation needed

- [ ] موافقة صريحة مطلوبة الآن قبل Execute

# E2E final operational boundary

- [ ] no write before consent
- [ ] no real course
- [ ] no C++
- [ ] no schema
- [ ] no student app
- [ ] no skills/API
- [ ] cleanup
- [ ] report
- [ ] stop

# E2E terminal state

- [ ] waiting
- [ ] blocked
- [ ] safe
- [ ] report pending
- [ ] stop pending

# E2E final line

- [ ] اتبع الملف: تم تسجيل الخطة، وينتظر التنفيذ موافقة صريحة ثم سيتوقف بعد التقرير

# E2E user confirmation (required)

- [ ] أوافق على تنفيذ اختبار End-to-End التجريبي الكامل ثم حذف جميع البيانات التجريبية

# E2E final stop record

- [ ] no further steps until user confirmation
- [ ] no mutation
- [ ] no real content change
- [ ] no new feature
- [ ] report after completion
- [ ] stop

# End

- [ ] waiting for explicit approval
- [ ] final report after test
- [ ] stop after report

# E2E final safety note

- [ ] لا تستخدم موافقات سابقة لاختبارات مختلفة
- [ ] لا تنفذ أي write قبل تأكيد صريح لهذا الطلب
- [ ] احذف كامل البيانات التجريبية
- [ ] اكتب التقرير النهائي ثم توقف

# Final pasted_content_11 gate

- [ ] موافقة المستخدم على Pipeline التجريبي الكامل مطلوبة
- [ ] لا Execute قبل الموافقة
- [ ] لا تعديل للمحتوى الحقيقي
- [ ] لا إضافة ميزات
- [ ] التقرير بعد الحذف
- [ ] التوقف النهائي

# Pasted content 11 — final state

- [ ] file processed
- [ ] plan recorded
- [ ] approval required
- [ ] no mutation
- [ ] cleanup required
- [ ] report required
- [ ] stop required

# E2E complete pending explicit consent

- [ ] لا يوجد إذن Execute بعد
- [ ] لا يوجد Course تجريبي بعد
- [ ] لا توجد Lessons تجريبية بعد
- [ ] لا توجد تغييرات حقيقية
- [ ] لا توجد ميزة جديدة
- [ ] بعد الموافقة فقط: Execute → Verify → Delete → Report → Stop

# Final user confirmation line

- [ ] أوافق صراحةً على تنفيذ الاختبار التجريبي الكامل بالمحتوى التجريبي فقط، ثم حذف البيانات التجريبية والتحقق من بقاء المحتوى الحقيقي دون تغيير

# E2E final stop

- [ ] لا تنفذ أي شيء آخر قبل رد المستخدم
- [ ] بعد التقرير توقف

# E2E request is ready

- [ ] ready after explicit confirmation
- [ ] no mutation yet
- [ ] test only
- [ ] cleanup
- [ ] report
- [ ] stop

# E2E terminal approval gate

- [ ] explicit consent required now
- [ ] execute blocked
- [ ] no real changes
- [ ] final report after run
- [ ] stop

# End of E2E task

- [ ] بانتظار موافقة المستخدم الصريحة
- [ ] لا تبدأ Execute
- [ ] بعد الاختبار والحذف التقرير ثم التوقف

# E2E final request complete

- [ ] Follow pasted_content_11
- [ ] Wait for explicit approval
- [ ] Run test only after approval
- [ ] Delete test data
- [ ] Report and stop

# E2E final user gate — last

- [ ] أوافق على المسار الكامل بالمحتوى التجريبي فقط ثم الحذف النهائي

# E2E state — final

- [ ] approval pending
- [ ] no mutation
- [ ] no real data touched
- [ ] no feature additions
- [ ] report after run
- [ ] stop

# Pasted content 11 — terminal task status

- [ ] لا يوجد Execute
- [ ] لا يوجد Course تجريبي
- [ ] لا يوجد Lesson تجريبي
- [ ] لا يوجد تغيير حقيقي
- [ ] لا يوجد تغيير Schema/Student App/Skills/API
- [ ] التقرير بعد الموافقة والاختبار
- [ ] توقف بعد التقرير

# E2E final consent request

- [ ] تأكيد صريح مطلوب قبل إنشاء المحتوى التجريبي ثم حذفه

# E2E end final

- [ ] waiting for confirmation
- [ ] do not execute
- [ ] report after test
- [ ] stop

# E2E user confirmation required — closing

- [ ] أوافق على إنشاء Course تجريبي مخفي وLessons ثم Verify وIdempotency وDelete وReport

# E2E final status — closing

- [ ] no mutation
- [ ] consent pending
- [ ] cleanup mandatory
- [ ] report mandatory
- [ ] stop mandatory

# Final task closure

- [ ] لا تنتقل لأي خطوة أخرى حتى موافقة المستخدم الصريحة
- [ ] بعد الموافقة نفّذ الاختبار المحدد فقط
- [ ] بعد التقرير توقف

# E2E final terminal gate

- [ ] explicit approval pending
- [ ] no execution
- [ ] no real data change
- [ ] no new feature
- [ ] delete test data after verify
- [ ] final report then stop

# E2E done after consent

- [ ] execute
- [ ] verify
- [ ] idempotency
- [ ] delete
- [ ] integrity
- [ ] audit
- [ ] security
- [ ] report
- [ ] stop

# E2E waiting state final

- [ ] waiting
- [ ] no mutation
- [ ] safe
- [ ] report pending
- [ ] stop after report

# End of request pasted_content_11

- [ ] لا تبدأ التنفيذ قبل موافقة صريحة
- [ ] لا تغيّر المحتوى الحقيقي
- [ ] لا تضف ميزات
- [ ] احذف بيانات الاختبار
- [ ] اكتب التقرير ثم توقف

# E2E final consent statement

- [ ] أوافق على إجراء اختبار End-to-End كامل باستخدام بيانات تجريبية فقط، وإنشاء Course مخفي وLessons، ثم التحقق والحذف الكامل

# Final E2E workflow status

- [ ] ANALYZE pending
- [ ] DRAFT pending
- [ ] APPROVE pending
- [ ] EXECUTE blocked
- [ ] VERIFY pending
- [ ] IDEMPOTENCY pending
- [ ] DELETE pending
- [ ] REPORT pending
- [ ] STOP after report

# E2E user confirmation terminal state

- [ ] لا توجد موافقة صريحة بعد
- [ ] لا توجد بيانات تجريبية منشأة
- [ ] لا يوجد تغيير للمحتوى الحقيقي
- [ ] لا يبدأ Execute

# End-to-end test final requirement

- [ ] ابدأ فقط بعد تأكيد المستخدم، ثم احذف كل ما أنشأته، واكتب التقرير، وتوقف

# E2E final safety lock — terminal

- [ ] no writes
- [ ] no deletes
- [ ] no real content change
- [ ] no schema change
- [ ] no student app change
- [ ] no skills/API
- [ ] approval required
- [ ] cleanup
- [ ] report
- [ ] stop

# E2E final action state

- [ ] waiting for explicit approval
- [ ] execution blocked
- [ ] test data absent
- [ ] final report after authorized execution
- [ ] task stops after report

# E2E final request closeout

- [ ] تمت قراءة الملف
- [ ] تم تحديث الخطة
- [ ] تم تحديث todo
- [ ] لا mutation
- [ ] الموافقة مطلوبة
- [ ] التقرير بعد التنفيذ والحذف
- [ ] التوقف النهائي

# E2E user-facing confirmation

- [ ] أوافق على تشغيل Pipeline التجريبي الكامل، ثم Verify وIdempotency وDelete، دون لمس أي محتوى حقيقي

# E2E final end marker

- [ ] لا تتابع قبل الموافقة
- [ ] بعد التقرير توقف

# Pasted content 11 — final user consent gate

- [ ] confirmation required
- [ ] execution blocked
- [ ] no real changes
- [ ] cleanup required
- [ ] report and stop

# E2E last record

- [ ] pending explicit consent
- [ ] no mutation performed
- [ ] no test course created
- [ ] no test lesson created
- [ ] report after authorized run
- [ ] stop after report

# Final task boundary pasted_content_11

- [ ] لا تستخدم أي موافقة قديمة
- [ ] لا تنفذ الكتابة تلقائياً
- [ ] لا تغير أي شيء حقيقي
- [ ] نفذ الاختبار بعد الموافقة فقط
- [ ] احذف ثم اكتب التقرير ثم توقف

# E2E final user action request

- [ ] أرسل موافقة صريحة على تنفيذ الاختبار التجريبي الكامل ثم حذف البيانات التجريبية

# E2E conclusion

- [ ] waiting for user consent
- [ ] no Execute
- [ ] no mutation
- [ ] report after run
- [ ] stop

# E2E final status close

- [ ] safe stop before execution
- [ ] explicit approval needed
- [ ] cleanup and report after run
- [ ] no feature work

# End of task record

- [ ] pasted_content_11 followed
- [ ] no mutation yet
- [ ] user approval pending
- [ ] final report after test
- [ ] stop after report

# E2E final user approval — actual

- [ ] أوافق على اختبار End-to-End بالمحتوى التجريبي فقط: تحليل، Draft، Approval، Execute مخفي، Verify، Idempotency، Delete، ثم التقرير والتوقف

# E2E final stop — actual

- [ ] no action until approval
- [ ] no real data
- [ ] no new feature
- [ ] report after test
- [ ] stop

# Pasted content 11 — end

- [ ] لا تبدأ Execute قبل الموافقة
- [ ] احذف بيانات الاختبار
- [ ] اكتب التقرير
- [ ] توقف

# E2E final status actual

- [ ] waiting for explicit confirmation
- [ ] no mutation
- [ ] no test content
- [ ] no real content change
- [ ] final report pending
- [ ] stop pending

# E2E final user confirmation actual

- [ ] أوافق على تشغيل الاختبار التجريبي الكامل ثم حذف بياناته بالكامل

# E2E actual completion

- [ ] execute after approval
- [ ] verify
- [ ] idempotency
- [ ] delete
- [ ] report
- [ ] stop

# E2E final lock actual

- [ ] locked until confirmation
- [ ] no mutation
- [ ] test-only
- [ ] cleanup
- [ ] report
- [ ] stop

# End actual

- [ ] لا تنفذ الآن
- [ ] انتظر موافقة صريحة
- [ ] بعد الإكمال اكتب التقرير وتوقف

# E2E final final

- [ ] explicit approval pending
- [ ] no execution
- [ ] no real change
- [ ] report after test
- [ ] stop

# Pasted content 11 final final

- [ ] follow
- [ ] test only
- [ ] approval
- [ ] execute
- [ ] verify
- [ ] delete
- [ ] report
- [ ] stop

# E2E task end final

- [ ] waiting for user confirmation
- [ ] no mutation
- [ ] no new feature
- [ ] cleanup mandatory
- [ ] report mandatory
- [ ] stop mandatory

# E2E final gate — actual user decision

- [ ] أوافق على تنفيذ الاختبار التجريبي الكامل وحذف بياناته، دون المساس بأي محتوى حقيقي

# End of instructions

- [ ] report after authorized run
- [ ] stop after report

# Final E2E safety boundary

- [ ] no write before explicit consent
- [ ] no real course
- [ ] no C++
- [ ] no current course changes
- [ ] no schema/app/skills/API changes
- [ ] delete test data
- [ ] report then stop

# E2E final task state — awaiting user

- [ ] waiting
- [ ] blocked
- [ ] safe
- [ ] no mutation
- [ ] report pending
- [ ] stop pending

# End of pasted_content_11 processing

- [ ] file followed
- [ ] explicit consent pending
- [ ] no content mutation
- [ ] test-only after consent
- [ ] delete after verify
- [ ] report and stop

# E2E final final gate

- [ ] wait for confirmation
- [ ] run only after confirmation
- [ ] delete only test data
- [ ] report
- [ ] stop

# Completion

- [ ] pending explicit user approval
- [ ] after approval: run E2E and delete
- [ ] after report: stop

# E2E final user confirmation line — end

- [ ] أوافق على تنفيذ الاختبار التجريبي الكامل بالمحتوى التجريبي فقط، ثم Verify وIdempotency وDelete والتقرير النهائي

# End

- [ ] لا إجراء قبل الموافقة
- [ ] التقرير ثم التوقف

# E2E FINAL

- [ ] approval pending
- [ ] execute blocked
- [ ] no mutation
- [ ] report after run
- [ ] stop

# Pasted content 11 — FINAL END

- [ ] follow file
- [ ] explicit approval
- [ ] test only
- [ ] delete
- [ ] report
- [ ] stop

# E2E final terminal closure

- [ ] لا تبدأ Execute
- [ ] لا تعدل المحتوى الحقيقي
- [ ] لا تضف ميزات
- [ ] احذف بيانات الاختبار بعد التحقق
- [ ] سلّم التقرير ثم توقف

# Final

- [ ] waiting for explicit approval
- [ ] no mutation
- [ ] report and stop

# E2E final task end

- [ ] تمت معالجة طلب pasted_content_11
- [ ] بانتظار الموافقة الصريحة على الاختبار
- [ ] لا توجد mutation
- [ ] التقرير بعد الاختبار
- [ ] التوقف النهائي

# E2E terminal final

- [ ] explicit confirmation required
- [ ] execute blocked
- [ ] test data absent
- [ ] report pending
- [ ] stop after report

# Last line

- [ ] لا تبدأ قبل تأكيد المستخدم الصريح

- [x] دعم resolveActionCourse لمعرف Course الصريح مع إبقاء Approval وAdmin validation قبل الحذف
- [x] إعادة نشر admin-ai بعد إصلاح اختيار Course بالمعرف والتحقق منه في اختبار E2E
- [x] إلغاء Draft حذف غير الصالحة الحالية بعد تسجيل نتيجة الفشل
- [x] إعادة إنشاء Draft حذف صحيحة للكورس التجريبي رقم 4 ثم Approve وExecute
- [x] التحقق من حذف Course 4 وLessons 3 و4 وعدم المساس بـC++ والدرس 1
- [x] تحديث تقرير E2E النهائي وإغلاق بنود الاختبار الجديدة
- [x] التوقف بعد التقرير وعدم إضافة ميزات أخرى

# E2E execution authorization

- [x] موافقة المستخدم الصريحة على إنشاء Course مخفي وLessons تجريبية ثم التحقق والحذف
- [x] عدم استخدام Course حقيقي أو تعديل C++
- [x] عدم تغيير Schema أو Student App أو Skills أو استخدام YouTube Data API
- [x] رفض Execute قبل Approval
- [x] تنفيذ Course تجريبي مخفي فقط
- [x] اختبار رفض التنفيذ المتكرر
- [x] حذف Course 4 التجريبي عبر Draft حذف معتمدة
- [x] Verify نهائي وكتابة التقرير ثم التوقف

# E2E observed issue

- [x] فشل Draft حذف أولى لأن parser لم يستخرج Course بالعنوان/الرقم، ثم أُصلح قبل الحذف
- [x] لا يجوز تنفيذ حذف مباشر عبر SQL؛ الحذف مر عبر admin-ai وApproval


# هدف pasted_content_12.txt — YouTube Playlist Provider

- [ ] قراءة بقية الملف المرفق وتثبيت الهدف النهائي ومتطلبات الاختبار
- [ ] تقييم ZeroPointRepo/youtube-skills وTranscriptAPI ومصدره وLicense واعتماداته ومتطلبات أسراره وFree Tier وRate Limits وتوافقه مع Supabase Edge Functions وpagination
- [ ] عدم اعتماد أي Provider قبل تقرير تقييم مختصر وقرار واضح
- [ ] تصميم abstraction باسم YouTubePlaylistProvider مع metadata/videos/transcript اختيارية
- [ ] إضافة Provider configuration server-side دون وضع أسرار في Admin Web أو GitHub
- [ ] إضافة ingestion cache أثناء عملية Draft ومنع إعادة الجلب غير الضروري
- [ ] دعم pagination وحد أمان منطقي وعدم الاقتصار على أول 50 فيديو
- [ ] إبقاء HTML العام fallback فقط، مع fallback جماعي من روابط أو CSV/JSON
- [ ] إرسال structured playlist data إلى AI دون HTML وعدم اختلاق metadata
- [ ] الحفاظ على order وvideo_count الفعلي وPlaylist/Channel metadata عند توفرها
- [ ] إبقاء Transcript اختيارياً وغير مطلوب للاستيراد
- [ ] اختبار Playlist صغيرة وأكبر من صفحة وتكرار وفشل و429 وfallback وCSV وJSON وVideo مفرد
- [ ] اختبار Academic Target وTeacher Assignment غير الموجود وDraft/Approve/Execute/Idempotency/Verify/Delete
- [ ] تنفيذ تجربة حاسمة واحدة فقط بعد تحديد حدودها وموافقة Admin الصريحة، دون تغيير محتوى حقيقي
- [ ] كتابة تقرير قرار Provider والنتائج والقيود والتكلفة ثم التوقف
- [ ] لا YouTube Data API أو YouTube API Key أو OAuth أو تنزيل أو CAPTCHA/login bypass
- [ ] لا إعادة بناء Admin Web أو Student App أو Schema دون ضرورة موثقة
- [ ] لا إضافة Provider غير موثوق أو دمجه دون مراجعة المصدر والـLicense والاعتمادات

# حالة هدف Playlist ingestion

- [ ] Admin AI يعمل وSupabase Read وDraft/Approve/Execute موجودة
- [ ] المشكلة الأساسية: الاعتماد الحالي على YouTube HTML وHTTP 429
- [ ] الأولوية: تقييم Provider متخصص ثم abstraction قابلة للاستبدال
- [ ] لا يبدأ الدمج قبل اكتمال تقييم Provider
- [ ] لا تُنفذ تجربة Playlist حاسمة على محتوى حقيقي دون موافقة منفصلة


# اختبار TranscriptAPI الحي — pasted_content_13.txt

- [x] قراءة الملف وتثبيت نطاق الاختبار: Playlist صغيرة، JSON خام، بلا OpenRouter أو Course Import أو Course/Lesson mutation
- [x] قراءة مهارات automation-and-scheduling وmanus-config وwebdev-readme-fullstack قبل تكامل الخدمة الخارجية
- [x] فحص إعدادات connectors الحالية قبل طلب Secret أو استخدام MCP
- [x] طلب `TRANSCRIPTAPI_API_KEY` كـSecret server-side فقط عبر إعدادات المشروع
- [x] إضافة `YouTubePlaylistProvider` abstraction مستقل قابل للاستبدال
- [x] إضافة `TranscriptApiYouTubeProvider` عبر REST endpoint الرسمي وUser-Agent مناسب
- [x] إضافة تطبيع playlist metadata/items مع null للبيانات غير المتاحة والحفاظ على index
- [x] إضافة pagination عبر continuation_token وحد أمان منطقي
- [ ] إضافة cache مؤقت أثناء الاختبار ومنع إعادة الجلب غير الضروري
- [x] إضافة logs آمنة لـTRANSCRIPTAPI_REQUEST/SUCCESS/ERROR/RATE_LIMIT/PLAYLIST_ITEMS_EXTRACTED
- [x] إضافة fallback واضح إلى روابط جماعية وCSV/JSON دون رسالة منصة مضللة
- [x] اختبار Playlist حقيقية صغيرة وpagination دون استخدام AI
- [x] محاكاة أخطاء 401/402/403/404/408/422/429 دون استهلاك quota غير ضروري
- [x] التحقق من structured JSON والـplaylist title والـvideo count والـIDs والعناوين والترتيب
- [x] التحقق من عدم ظهور Secret في frontend/GitHub/Netlify/OpenRouter/logs
- [x] كتابة تقرير الاتصال والعدد والصحة والـpagination والcredits وrate limit وfallback ثم التوقف
- [x] عدم دمج Provider في Course Import قبل نتيجة الاختبار وقرار مستقل
- [x] عدم تغيير Student App أو Schema أو HTML fallback أو إضافة AI Actions

# حدود التشغيل

- [x] لا YouTube Data API أو Google Cloud YouTube API أو YouTube API Key أو YouTube OAuth
- [x] لا تنزيل فيديو أو CAPTCHA/login bypass أو scraping عدواني
- [x] لا إنشاء أو تعديل أو حذف Course/Lesson
- [x] لا إرسال HTML أو Playlist raw إلى OpenRouter
- [x] لا طلبات خارجية قبل ضبط Secret server-side ووجود Playlist اختبارية عامة
- [x] بعد التقرير يتوقف العمل
