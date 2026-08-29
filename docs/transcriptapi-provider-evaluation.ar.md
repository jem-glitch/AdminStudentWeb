# تقرير اختبار TranscriptAPI — Provider الأول القابل للاستبدال

## نطاق العمل

تم اعتماد TranscriptAPI كـProvider أول لاستخراج YouTube Playlist، مع إبقاء التصميم قابلاً للاستبدال مستقبلاً. اقتصر العمل على Adapter خادمي واختبار ingestion حي محدود يعيد JSON منظماً. لم يُدمج Provider في AI Course Import، ولم يُستدعَ OpenRouter، ولم تُنشأ أو تُعدّل أو تُحذف أي بيانات Course أو Lesson.

لم يُستخدم YouTube Data API أو YouTube API Key أو MCP داخل Edge Function أو تنزيل فيديو أو OAuth أو CAPTCHA/login bypass. كما لم تتغير Schema أو Student App، وبقي HTML fallback الحالي موجوداً.

## النتيجة المختصرة

> **الاختبار ناجح:** Playlist URL → TranscriptAPI → metadata → جميع العناصر → Video IDs → titles → order/index → URLs → JSON منظم.

تم الاختبار من خلال `admin-ai` في Supabase Edge Function بعد التحقق من جلسة Admin. أُضيف مسار محدود باسم `test_playlist_provider` للاختبار الخام فقط؛ لا ينشئ Draft ولا Course ولا Lesson ولا ينفذ أي mutation.

| البند | النتيجة الفعلية |
|---|---|
| الاتصال بـTranscriptAPI | ناجح، HTTP 200 |
| Provider | `transcriptapi` عبر `TranscriptApiYouTubeProvider` |
| Playlist ID | `PLFvZG69HOWk99ZYlqD7qPkhzFVdvjGsQs` |
| عنوان Playlist | الفصل الرابع -خامس علمي ~دوال دائريه |
| وصف Playlist | غير متاح (`null`) ولم يتم اختلاقه |
| اسم القناة | الاستاذ عباس علي الدراجي |
| العدد المعلن | 9 |
| العناصر المسترجعة | 9 |
| الصفحات الحية | 1 |
| credits المستخدمة | 1 |
| truncated | `false` |
| OpenRouter | لم يُستدعَ |
| Course/Lesson mutation | لم تُنفذ |

## الفيديوهات المستخرجة

استُخرجت تسعة عناصر، وكانت Video IDs بالترتيب التالي: `3cL-OoKrELQ`, `NfCo2LdZRew`, `IjXI7LSyLH8`, `7v8qgRbcGVI`, `340V2-icktk`, `uVlgdxFgTM8`, `7NCpbPEKd1E`, `KpnXOH8VdrQ`, `PydX3DGyWJQ`.

لكل عنصر تم التحقق من وجود `video_id` و`title` و`position` وYouTube URL صحيح. كانت positions من 1 إلى 9 بلا فجوات أو تكرار، ولذلك تطابق عدد العناصر المسترجعة مع `video_count` المعلن. الوصف الفردي لم يكن متاحاً وبقي `null`. كما ظهرت قيمة غير موثوقة في الحقل الذي بدا كـ`channelTitle` شبيهة بعدد المشاهدات؛ لذلك عُزلت ولم تُعرض كاسم قناة للفيديو.

## Pagination

الـPlaylist الحية تحتوي على 9 فيديوهات فقط، وأعاد المزود صفحة واحدة؛ لذلك لم يكن هناك continuation حي مطلوب لهذه القائمة. تم اختبار pagination حتمياً دون استهلاك credits: استجابة أولى تحتوي `has_more=true` و`continuation_token` أدت إلى طلب الصفحة الثانية، ثم أعاد Adapter صفحتين وعنصرين بترتيب صحيح و`credits_used=2`.

بهذا يكون منطق continuation مثبتاً عبر اختبار الوحدة، بينما لا يُدّعى أن Playlist الاختبار الحية أثبتت تعدد الصفحات.

## معالجة الأخطاء

تمت محاكاة أكواد 401 و402 و403 و404 و408 و422 و429 باختبارات وحدات حتمية، بحيث يُعاد status المزود ولا تُكرر الطلبات بلا حدود. في حالة 429 حُفظت قيمة `Retry-After: 30`، ولم يُجرَ retry تلقائي غير محدود. لم تُستهلك credits لاختبارات الأخطاء.

عند فشل Provider لا تُعرض رسالة توحي بأن البيانات غير موجودة في المنصة؛ بل يبقى مسار fallback الحالي متاحاً للروابط اليدوية وCSV وJSON. ولم تُرسل HTML أو Playlist raw إلى OpenRouter في هذا الاختبار.

## الأمان والأسرار

حُفظ `TRANSCRIPTAPI_API_KEY` داخل Secrets الخاصة بـSupabase Edge Functions فقط. لا يوجد المفتاح في frontend أو GitHub أو التقرير أو الاستجابة أو logs أو OpenRouter context. تُظهر سجلات الطلب الحي فقط أحداثاً آمنة مثل `TRANSCRIPTAPI_REQUEST` و`TRANSCRIPTAPI_SUCCESS` مع `pages` و`item_count` و`credits_used`، دون Authorization أو JWT أو API key.

مر الطلب عبر `auth/v1/user` بحالة 200 ثم تحقق `admin_profiles` بحالة 200 قبل استدعاء TranscriptAPI. عاد استدعاء Edge Function بحالة 200. لا توجد عملية محتوى مرتبطة بالمسار التجريبي.

## الملفات المعدلة

| الملف | الغرض |
|---|---|
| `supabase/functions/admin-ai/index.ts` | إضافة مسار Admin-only للاختبار الخام وفصل شرط OpenRouter عن هذا المسار |
| `supabase/functions/admin-ai/skills/youtube-provider.ts` | abstraction `YouTubePlaylistProvider` وAdapter `TranscriptApiYouTubeProvider` وpagination والتطبيع والمهلة والأخطاء |
| `tests/admin-ai-skills.test.ts` | اختبارات Video ID وnormalization والتكرار وpagination وأكواد الأخطاء |
| `tests/transcriptapi-secret.test.ts` | تحقق حي من Secret TranscriptAPI دون كشف قيمته |
| `tests/supabase-access-token.test.ts` | تحقق خفيف من Management Token المستخدم لضبط Secret عن بُعد |
| `docs/transcriptapi-provider-evaluation.ar.md` | هذا التقرير ونتائج الاختبار |
| `todo.md` | سجل المهام والقيود وحالة الإقفال |

تم ضبط Secret عن بُعد عبر Supabase CLI باستخدام Management Token، ثم حُذف الملف المؤقت فوراً. لا يوجد ملف Secret متتبع في Git.

## بوابات الجودة والـcommit

نجحت الأوامر التالية:

- `pnpm check`
- `pnpm lint`
- `pnpm test`: 16 اختباراً ناجحاً، واختباران متخطّيان قصداً
- `pnpm build:web`

الـcommit المرفوع إلى `jem-glitch/AdminStudentWeb` على `main` هو `01a0498` برسالة `test: validate TranscriptAPI playlist provider`.

## القرار وحدود المرحلة

يمكن اعتماد TranscriptAPI كـProvider أول للاستخراج، مع إبقاء HTML fallback وواجهة Provider قابلة للاستبدال. لا يُعتبر هذا الاختبار موافقة على دمجه في Course Import أو تشغيل AI Course Import أو Execute؛ تلك مرحلة مستقلة تحتاج قراراً واختبارات إضافية.

لم يُضف cache إنتاجي مستمر في هذه المرحلة لأن المطلوب كان إثبات ingestion فقط. كما أن اختبار pagination الحي لقائمة متعددة الصفحات لم يُنفذ لتجنب استهلاك credits بلا حاجة؛ تم إثباته عبر mock حتمي. يجب اعتبار هذه الحدود واضحة قبل الانتقال إلى الدمج الكامل.

## المراجع

[1] [ZeroPointRepo/youtube-skills — MIT License](https://github.com/ZeroPointRepo/youtube-skills/blob/main/LICENSE)

[2] [ZeroPointRepo/youtube-skills — README](https://github.com/ZeroPointRepo/youtube-skills/blob/main/README.md)

[3] [TranscriptAPI — API Reference](https://transcriptapi.com/docs/api/)

[4] [TranscriptAPI — Getting Started](https://transcriptapi.com/docs/getting-started/)

[5] [TranscriptAPI — MCP Documentation](https://transcriptapi.com/docs/mcp/)

**حالة الإقفال:** اكتمل الاختبار الحي المحدود والتقرير. لم يبدأ الدمج الكامل أو Course Import أو Execute. بعد هذا التقرير لا توجد خطوة تنفيذية أخرى ضمن هذا الطلب.
