# تقييم Provider لاستخراج YouTube Playlist

**النطاق:** تقييم فقط قبل الدمج في Admin AI. لم يُعدّل الكود أو Schema أو Student App، ولم يُضبط أي Secret، ولم يُنفذ طلب حي بالمزود.

## القرار المختصر

`ZeroPointRepo/youtube-skills` ليس مكتبة تشغيل مستقلة لاستخراج YouTube، بل مجموعة Skills تعليمية تعتمد على خدمة TranscriptAPI الخارجية. المرشح العملي هو **TranscriptAPI REST API** عبر Adapter خادمي داخل Supabase Edge Function، وليس تركيب MCP داخل Edge Function. يظل اعتماد Provider **مشروطاً** بتزويد مفتاح خادمي وتجربة Playlist عامة يوافق عليها Admin؛ لا أوصي بدمج المستودع كاملاً أو تثبيت كل Skills، لأن داخله Skills أخرى مثل `youtube-api` و`youtube-data` لا تتوافق مع القيود الحالية.

## المصدر والمستودع

| البند | النتيجة |
|---|---|
| المستودع | [ZeroPointRepo/youtube-skills](https://github.com/ZeroPointRepo/youtube-skills) |
| آخر commit تمت مراجعته | `5c168578ec8424dbd1bd144d1cb53e8e6db276ee`، 23 أغسطس 2026 |
| License | MIT، مع شرط الاحتفاظ بإشعار copyright وMIT عند النسخ أو التوزيع [1] |
| طبيعة المشروع | Skills نصية لوكلاء AI، وليست SDK أو حزمة تشغيل لـDeno/Node |
| الـSkill المناسب | `skills/youtube-playlist/SKILL.md` فقط، لا تثبيت الحزمة كلها |
| الاعتمادات المحلية | لا توجد runtime dependencies إضافية حسب Compatibility في الـSkill؛ الاعتماد الحقيقي هو خدمة TranscriptAPI والإنترنت |
| التشغيل المناسب | REST `fetch` من Edge Function؛ MCP مناسب لعميل Agent تفاعلي، وليس ضرورياً لمسار الخادم |

## طريقة Playlist وPagination

يوثق الـSkill endpoint التالي: `GET https://transcriptapi.com/api/v2/youtube/playlist/videos`. يقبل `playlist` كرابط أو معرف Playlist في الطلب الأول، ثم `continuation` وحده للصفحات التالية. الصفحة تقارب 100 فيديو، والاستجابة تتضمن `results` و`playlist_info` و`continuation_token` و`has_more`؛ يجب التكرار حتى انتهاء `has_more` أو بلوغ حد أمان يحدده النظام [2] [3]. هذا يطابق الهدف الوظيفي الأساسي أفضل من HTML العام الحالي.

الحقول الموثقة في نتيجة الفيديو تشمل `videoId` و`title` و`channelId` و`channelTitle` و`channelHandle` و`lengthText` و`viewCountText` و`thumbnails` و`index`. وتشمل `playlist_info` العنوان والوصف واسم المالك وعدد الفيديوهات عند توفرها. يجب تحويل الحقول غير الموجودة إلى `null`، وعدم استخدام عدد `numVideos` وحده بديلاً عن عدّ العناصر المستخرجة فعلياً.

## المصادقة والأسرار

يحتاج REST API إلى Bearer API key في `Authorization`، وتوضح الوثائق أن المفتاح يبدأ عادةً بـ`sk_`، كما يتطلب الـSkill ترويسة `User-Agent` باسم الوكيل لأن غيابها قد يؤدي إلى حظر Cloudflare برمز 403/1010 [2] [3]. لا يوجد مفتاح في المستودع الذي تمت مراجعته، لكن الاستدعاء يتطلب حساب TranscriptAPI أو مفتاحاً من لوحة الخدمة. لذلك يجب أن يُحفظ المفتاح server-side في Secret خاص بـSupabase Edge Function، ولا يصل إلى Admin Web أو OpenRouter أو GitHub أو logs.

استخدام MCP لا يلغي الحاجة إلى الاعتماد؛ توثيق MCP يذكر OAuth أو API key بحسب العميل. وبالنسبة إلى Admin AI الحالي، REST server-to-server أوضح وأقل تعقيداً من جعل Edge Function عميلاً لـMCP. لا ينبغي استخدام OAuth الخاص بالمستخدم أو تخزين جلسة TranscriptAPI في الواجهة.

## Free Tier وCredits وRate Limits

يذكر README للمستودع والصفحة الرسمية وجود **100 credit عند التسجيل، بلا بطاقة ائتمان**، وسعر Playlist هو **1 credit لكل صفحة**، مع حد معلن قدره **300 طلب في الدقيقة** [2] [3]. الصفحة الرسمية تذكر أيضاً أن الخطط المدفوعة والرصيد تتم إدارتهما عبر TranscriptAPI. لا ينبغي تفسير المجاني على أنه غير محدود؛ Playlist من 250 فيديو قد تستهلك عدة credits بحسب عدد الصفحات، وإعادة الجلب قد تضاعف الاستهلاك.

يجب تسجيل `provider` ونجاح/فشل الطلب وlatency وstatus code، وتسجيل credits فقط إذا أعادها المزود أو أمكن حسابها من عدد الصفحات، دون تسجيل المفتاح أو Authorization أو محتوى كامل. ينبغي تنفيذ cache أثناء إنشاء Draft، وحد أقصى لعدد الصفحات والعناصر، وعدم إعادة المحاولة أكثر من مرة في حالات timeout/408 أو 429 مع احترام `Retry-After` إن وُجد.

## الأخطاء والقيود

الـSkill يوثق 400 للمعاملات غير الصحيحة، و401 للمفتاح المفقود أو غير الصحيح، و402 لانعدام الرصيد، و403/1010 لحظر Cloudflare عند غياب User-Agent، و404 للقائمة غير الموجودة أو غير العامة، و408 للمهلة، و422 لصيغة Playlist غير صالحة [2]. Adapter المطلوب يجب أن يحول هذه الحالات إلى أخطاء داخلية غير حساسة، ويترك fallback الجماعي للروابط أو CSV/JSON عند فشل Provider، من دون ادعاء أن فشل ingestion يعني فشل كامل Pipeline.

القيمة العملية قوية لاستيراد Playlist، لكن توجد مخاطر يجب إبقاؤها واضحة: الخدمة خارجية وقد تتغير حدودها أو أسعارها أو توافرها؛ البيانات الوصفية قد تكون ناقصة؛ عدد الفيديوهات قد يكون تقريبياً في `playlist_info`؛ والقائمة الخاصة أو المحذوفة قد تفشل. كما أن الوثائق العامة التي تمت مراجعتها لا تمنح ضماناً مستقلاً بأن كل metadata، مثل duration أو description، متاحة لكل فيديو؛ لذا يجب حفظ `null` عند الغياب وعدم جعلها شرطاً للاستيراد.

## ملاءمة Supabase Edge Functions

الملاءمة التقنية **جيدة مبدئياً**: لا يحتاج الـREST Adapter إلى runtime إضافي، ويمكن استدعاء HTTPS عبر `fetch`، مع Secret server-side وحدود timeout وحجم واستمرار. لكن لم يُنفذ اختبار حي في هذه المرحلة لعدم وجود اعتماد Provider في بيئة المشروع وعدم طلب المستخدم دمجاً قبل التقرير. لا يمكن لذلك إثبات أن Playlist حقيقية استُخرجت أو أن quota استُهلكت.

التصميم المقترح هو واجهة `YouTubePlaylistProvider` مستقلة تضم `getPlaylistMetadata` و`getPlaylistVideos` و`getVideoMetadata` و`getTranscript` كوظائف اختيارية. يكون TranscriptAPI Adapter مسؤولاً عن REST والـpagination فقط، بينما يبقى Admin AI مسؤولاً عن Intent وAcademic Target وDraft وApproval وExecute. لا يُرسل HTML إلى OpenRouter؛ تُرسل بيانات منظمة ومحدودة فقط.

## التوصية قبل الاعتماد

أوصي باعتماد TranscriptAPI كـ**Provider أول قابل للاستبدال**، لكن لا أوصي بعد بدمجه في هذه اللحظة قبل قرارين: أولاً، قبول أن TranscriptAPI خدمة خارجية تحتاج API key وحساباً، حتى مع وجود Free Tier؛ وثانياً، تحديد Playlist عامة اختبارية صغيرة وأخرى متعددة الصفحات. بعد الاعتماد، ينبغي تنفيذ REST Adapter server-side فقط، وترك HTML fallback ثانوياً، وإضافة cache داخل Draft، ثم اختبار مصدر 3 فيديوهات ومصدر متعدد الصفحات و429 و404 وfallback الجماعي قبل أي Execute.

لم يتم في هذا التقرير إنشاء Course أو Lesson أو Draft محتوى جديد، ولم تُجرَ أي عملية كتابة أو حذف أو تعديل في Supabase.

## المراجع

[1] [ZeroPointRepo/youtube-skills — MIT License](https://github.com/ZeroPointRepo/youtube-skills/blob/main/LICENSE)

[2] [ZeroPointRepo/youtube-skills — README](https://github.com/ZeroPointRepo/youtube-skills/blob/main/README.md)

[3] [TranscriptAPI — API Reference](https://transcriptapi.com/docs/api/)

[4] [TranscriptAPI — Getting Started](https://transcriptapi.com/docs/getting-started/)

[5] [TranscriptAPI — MCP Documentation](https://transcriptapi.com/docs/mcp/)

**حالة القرار:** Provider مرشح موصى بتصميم Adapter له، لكنه غير مدمج وغير مُعتمد تشغيلـياً حتى الآن.


## تدقيق إضافي للتوثيق الرسمي

تمت مراجعة `skills/youtube-playlist/SKILL.md` في commit `5c168578ec8424dbd1bd144d1cb53e8e6db276ee`. يحدد الملف أن endpoint Playlist هو `GET /api/v2/youtube/playlist/videos`، وأن الاستدعاء الأول يستخدم `playlist` والطلبات اللاحقة تستخدم `continuation` فقط، بحد تقريبي 100 عنصر للصفحة و1 credit لكل صفحة. كما يطلب User-Agent غير افتراضي لتجنب 403/1010، ويذكر 100 credit مجانية و300 طلب/دقيقة [6].

تؤكد وثائق API الرسمية أن response يتضمن `results` و`playlist_info` و`continuation_token` و`has_more`، وأن `playlist_info` قد يتضمن title وdescription وownerName وnumVideos، بينما تتضمن العناصر videoId وtitle وchannelTitle وthumbnails وlengthText وindex [7]. وتؤكد وثائق MCP أن MCP يدعم OAuth أو API key للعميل، لكنه ليس ضرورياً لمسار Server-to-Server المقترح [8].

[6] [youtube-playlist/SKILL.md في المستودع](https://raw.githubusercontent.com/ZeroPointRepo/youtube-skills/main/skills/youtube-playlist/SKILL.md)

[7] [TranscriptAPI API Reference](https://transcriptapi.com/docs/api/)

[8] [TranscriptAPI MCP Documentation](https://transcriptapi.com/docs/mcp/)


## نتيجة الاختبار الحي المحدود

استُخدم الرابط العام الذي قدمه المستخدم: `PLFvZG69HOWk99ZYlqD7qPkhzFVdvjGsQs`. أُرسل الطلب إلى `admin-ai` عبر جلسة Admin موثقة وبـ`action: test_playlist_provider` فقط. أعاد endpoint حالة HTTP 200 من Edge Function، وكانت النتيجة Structured JSON نظيفة من Provider `transcriptapi`.

| الحقل | النتيجة |
|---|---|
| playlist_id | `PLFvZG69HOWk99ZYlqD7qPkhzFVdvjGsQs` |
| playlist_title | الفصل الرابع -خامس علمي ~دوال دائريه |
| playlist_description | غير متاح (`null`) ولم يتم اختلاقه |
| channel_name | الاستاذ عباس علي الدراجي |
| video_count | 9 |
| الفيديوهات المستخرجة | 9 |
| pages | 1 |
| credits_used | 1 |
| truncated | false |

كانت Video IDs بالترتيب: `3cL-OoKrELQ`, `NfCo2LdZRew`, `IjXI7LSyLH8`, `7v8qgRbcGVI`, `340V2-icktk`, `uVlgdxFgTM8`, `7NCpbPEKd1E`, `KpnXOH8VdrQ`, `PydX3DGyWJQ`. لكل عنصر title وposition وURL صحيحان، وكانت positions من 1 إلى 9 بلا فجوات أو تكرار. الوصف الفردي غير متاح، لذلك بقي `null` ولم يُستبدل بتخمين. كما تم منع قيمة `channelTitle` غير الموثوقة من الظهور كاسم قناة للفيديو.

لم يُستدعَ OpenRouter، ولم يُنشأ Draft أو Course أو Lesson، ولم يتغير Supabase content أو Schema أو Student App. لم تكن هذه Playlist أكبر من صفحة، لذلك بقي إثبات pagination عبر اختبار الوحدة المحاكى: continuation token أدى إلى طلب صفحتين وcredits_used=2، بينما الاختبار الحي أثبت ingestion الحقيقي لPlaylist من 9 فيديوهات فقط.


## تدقيق السجلات والأمان

أظهر تدقيق Supabase Logs أن الطلب الحي مر عبر `auth/v1/user` بحالة 200 ثم فحص `admin_profiles` بحالة 200، وبعده سُجلت أحداث `TRANSCRIPTAPI_REQUEST` و`TRANSCRIPTAPI_SUCCESS` مع `pages: 1` و`item_count: 9` و`credits_used: 1`، ثم عاد طلب Edge Function بحالة 200. لم تتضمن الأحداث المسجلة مفتاح API أو Authorization أو JWT أو محتوى Playlist الخام. الاستعلام الأول المقيّد بمصدر `function_edge_logs` لم يُرجع صفوفاً لأن أحداث التطبيق محفوظة في `function_logs`، أما الاستعلام الموسع فأظهر التسلسل المطلوب.

الاختبار الحي أثبت عمل Provider داخل Supabase Edge Function فعلياً. أما pagination وأكواد 401/402/403/404/408/422/429 فتم اختبارها حتمياً بالمحاكاة لتفادي استهلاك credits بلا داعٍ؛ و429 يحفظ `Retry-After` ولا يعيد الطلب تلقائياً بلا حدود.
