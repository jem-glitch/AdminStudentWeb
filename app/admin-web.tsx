import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { supabase, supabaseConfigError, extractYoutubeVideoId, isValidYoutubeVideoId, type SupabaseCategory, type SupabaseCourse, type SupabaseLesson } from "@/lib/supabase";
import { AdminAiChat } from "@/components/admin-ai-chat";
import { AcademicManagement, type AcademicData } from "@/components/academic-management";

export default function AdminWebScreen() {
  const [session, setSession] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [courses, setCourses] = useState<SupabaseCourse[]>([]);
  const [lessons, setLessons] = useState<SupabaseLesson[]>([]);
  const [categories, setCategories] = useState<SupabaseCategory[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseInstructor, setCourseInstructor] = useState("");
  const [courseCategory, setCourseCategory] = useState<number | null>(null);
  const [coursePublished, setCoursePublished] = useState(true);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonUrl, setLessonUrl] = useState("");
  const [lessonImage, setLessonImage] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonOrder, setLessonOrder] = useState("0");
  const [lessonPublished, setLessonPublished] = useState(true);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [academic, setAcademic] = useState<AcademicData>({ stages: [], subjects: [], stageSubjects: [], teachers: [], assignments: [] });
  const [selectedStageId, setSelectedStageId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");

  useEffect(() => {
    if (supabaseConfigError) {
      setAuthError(supabaseConfigError);
      setAuthReady(true);
      return;
    }
    let mounted = true;
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) setAuthError(`تعذر الاتصال بخدمة تسجيل الدخول: ${error.message}`);
        setSession(data.session);
        setAuthReady(true);
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        setAuthError(`تعذر الاتصال بخدمة تسجيل الدخول: ${error instanceof Error ? error.message : "فشل الجلب"}`);
        setAuthReady(true);
      });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setAuthReady(true); });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => { if (session?.user?.id) void loadAdminData(session.user.id); else { setIsAdmin(false); setCourses([]); setLessons([]); setCategories([]); } }, [session?.user?.id]);

  async function loadAdminData(userId: string) {
    setBusy(true);
    setAuthError("");
    try {
      const profile = await supabase
        .from("admin_profiles")
        .select("user_id, role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (profile.error) throw new Error(`تعذر التحقق من صلاحية الحساب: ${profile.error.message}`);
      if (!profile.data) {
        setIsAdmin(false);
        setAuthError("تم تسجيل الدخول، لكن هذا الحساب غير موجود في قائمة Admin.");
        return;
      }
      setIsAdmin(true);
      const [courseResult, lessonResult, categoryResult, stageResult, subjectResult, stageSubjectResult, teacherResult, assignmentResult] = await Promise.all([
        supabase.from("courses").select("*").order("updated_at", { ascending: false }),
        supabase.from("lessons").select("*").order("sort_order", { ascending: true }),
        supabase.from("course_categories").select("*").order("name"),
        supabase.from("stages").select("*").order("sort_order"),
        supabase.from("subjects").select("*").order("sort_order"),
        supabase.from("stage_subjects").select("*"),
        supabase.from("teachers").select("*").order("display_name"),
        supabase.from("teacher_assignments").select("*"),
      ]);
      const dataError = courseResult.error || lessonResult.error || categoryResult.error || stageResult.error || subjectResult.error || stageSubjectResult.error || teacherResult.error || assignmentResult.error;
      if (dataError) throw new Error(`تعذر تحميل بيانات الإدارة: ${dataError.message}`);
      setCourses((courseResult.data ?? []) as SupabaseCourse[]);
      setLessons((lessonResult.data ?? []) as SupabaseLesson[]);
      setCategories((categoryResult.data ?? []) as SupabaseCategory[]);
      setAcademic({ stages: (stageResult.data ?? []) as AcademicData["stages"], subjects: (subjectResult.data ?? []) as AcademicData["subjects"], stageSubjects: (stageSubjectResult.data ?? []) as AcademicData["stageSubjects"], teachers: (teacherResult.data ?? []) as AcademicData["teachers"], assignments: (assignmentResult.data ?? []) as AcademicData["assignments"] });
    } catch (error: unknown) {
      setIsAdmin(false);
      setAuthError(error instanceof Error ? error.message : "تعذر إكمال التحقق من حساب Admin.");
    } finally {
      setBusy(false);
    }
  }

  async function signIn() {
    if (supabaseConfigError) { setAuthError(supabaseConfigError); return; }
    setBusy(true);
    setAuthError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        const message = error.message.toLowerCase();
        if (message.includes("email not confirmed")) setAuthError("هذا البريد غير مؤكد. افتح رسالة Supabase واضغط رابط التأكيد، أو عطّل Confirm email مؤقتاً من إعدادات Auth.");
        else if (message.includes("invalid login credentials") || message.includes("user not found")) setAuthError("الحساب غير موجود في مشروع Supabase المرتبط بالموقع، أو أن البريد/كلمة المرور غير صحيحين.");
        else setAuthError(`تعذر تسجيل الدخول: ${error.message}`);
      } else if (data.session) {
        setSession(data.session);
        setAuthError("");
      } else {
        setAuthError("تم قبول بيانات الدخول، لكن لم يتم إنشاء جلسة. أعد المحاولة.");
      }
    } catch (error: unknown) {
      setAuthError(`تعذر الاتصال بخدمة تسجيل الدخول: ${error instanceof Error ? error.message : "فشل الجلب"}`);
    } finally {
      setBusy(false);
    }
  }
  async function signOut() { await supabase.auth.signOut(); setSession(null); }


  const filteredCourses = useMemo(() => courses.filter((course) => `${course.title} ${course.instructor ?? ""}`.toLowerCase().includes(search.trim().toLowerCase())), [courses, search]);
  const selectedCourse = courses.find((course) => course.id === selectedCourseId);
  const selectedLessons = lessons.filter((lesson) => lesson.course_id === selectedCourseId).sort((a, b) => a.sort_order - b.sort_order);
  const linkedSubjectIds = new Set(academic.stageSubjects.filter((item) => item.stage_id === selectedStageId).map((item) => item.subject_id));
  const stageSubjects = academic.stageSubjects.filter((item) => item.stage_id === selectedStageId && item.subject_id === selectedSubjectId);
  const selectedStageSubjectId = stageSubjects[0]?.id ?? "";
  const availableSubjects = academic.subjects.filter((item) => linkedSubjectIds.has(item.id) && item.is_active);
  const availableAssignments = academic.assignments.filter((item) => item.stage_subject_id === selectedStageSubjectId);
  const availableTeacherIds = new Set(availableAssignments.map((item) => item.teacher_id));
  const availableTeachers = academic.teachers.filter((item) => availableTeacherIds.has(item.id) && item.is_active);

  function editCourse(course: SupabaseCourse) { const assignment = academic.assignments.find((item) => item.id === course.teacher_assignment_id); const stageSubject = academic.stageSubjects.find((item) => item.id === assignment?.stage_subject_id); setEditingCourseId(course.id); setSelectedCourseId(course.id); setCourseTitle(course.title); setCourseDescription(course.description ?? ""); setCourseInstructor(course.instructor ?? ""); setCourseCategory(course.category_id); setCoursePublished(course.is_published); setSelectedAssignmentId(course.teacher_assignment_id ?? ""); setSelectedStageId(academic.stages.find((item) => item.id === stageSubject?.stage_id)?.id ?? ""); setSelectedSubjectId(stageSubject?.subject_id ?? ""); setMessage(""); }
  function resetCourseForm() { setEditingCourseId(null); setCourseTitle(""); setCourseDescription(""); setCourseInstructor(""); setCourseCategory(null); setCoursePublished(true); setSelectedStageId(""); setSelectedSubjectId(""); setSelectedAssignmentId(""); }
  function chooseStage(value: string) { setSelectedStageId(value); setSelectedSubjectId(""); setSelectedAssignmentId(""); }
  function chooseSubject(value: string) { setSelectedSubjectId(value); setSelectedAssignmentId(""); }

  async function saveCourse() { if (!courseTitle.trim()) return setAuthError("أدخل اسم الكورس."); if (!editingCourseId && !selectedAssignmentId) return setAuthError("اختر الصف والمادة والمدرس المرتبطين قبل إنشاء الكورس."); if (selectedAssignmentId && !academic.assignments.some((item) => item.id === selectedAssignmentId)) return setAuthError("اختيار Teacher Assignment غير صالح."); setBusy(true); const selectedTeacher = academic.teachers.find((item) => item.id === academic.assignments.find((assignment) => assignment.id === selectedAssignmentId)?.teacher_id); const payload = { title: courseTitle.trim(), slug: `${courseTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`, description: courseDescription.trim() || null, instructor: editingCourseId ? courseInstructor.trim() || null : selectedTeacher?.display_name ?? null, category_id: courseCategory, teacher_assignment_id: selectedAssignmentId || null, is_published: coursePublished }; const result = editingCourseId ? await supabase.from("courses").update(payload).eq("id", editingCourseId).select().single() : await supabase.from("courses").insert(payload).select().single(); if (result.error) setAuthError(result.error.message); else { setCourses((current) => editingCourseId ? current.map((course) => course.id === editingCourseId ? result.data as SupabaseCourse : course) : [result.data as SupabaseCourse, ...current]); setSelectedCourseId((result.data as SupabaseCourse).id); resetCourseForm(); setMessage("تم حفظ الكورس."); } setBusy(false); }
  async function toggleCourse(course: SupabaseCourse) { const next = !course.is_published; const result = await supabase.from("courses").update({ is_published: next }).eq("id", course.id).select().single(); if (!result.error) setCourses((current) => current.map((item) => item.id === course.id ? result.data as SupabaseCourse : item)); }
  async function deleteCourse(courseId: number) { const result = await supabase.from("courses").delete().eq("id", courseId); if (!result.error) { setCourses((current) => current.filter((course) => course.id !== courseId)); setLessons((current) => current.filter((lesson) => lesson.course_id !== courseId)); if (selectedCourseId === courseId) setSelectedCourseId(null); } }
  function editLesson(lesson: SupabaseLesson) { setEditingLessonId(lesson.id); setLessonTitle(lesson.title); setLessonUrl(lesson.youtube_url); setLessonImage(lesson.image_url ?? ""); setLessonDescription(lesson.description ?? ""); setLessonOrder(String(lesson.sort_order)); setLessonPublished(lesson.is_published); }
  function resetLessonForm() { setEditingLessonId(null); setLessonTitle(""); setLessonUrl(""); setLessonImage(""); setLessonDescription(""); setLessonOrder(String(selectedLessons.length)); setLessonPublished(true); }
  async function saveLesson() { const videoId = extractYoutubeVideoId(lessonUrl); if (!selectedCourseId || !lessonTitle.trim() || !isValidYoutubeVideoId(videoId)) { setAuthError("أدخل عنوان الدرس ورابط YouTube صالحاً مثل https://www.youtube.com/watch?v=VIDEO_ID"); return; } setBusy(true); const payload = { course_id: selectedCourseId, title: lessonTitle.trim(), youtube_url: lessonUrl.trim(), youtube_video_id: videoId, image_url: lessonImage.trim() || null, description: lessonDescription.trim() || null, sort_order: Number(lessonOrder) || 0, is_published: lessonPublished }; const result = editingLessonId ? await supabase.from("lessons").update(payload).eq("id", editingLessonId).select().single() : await supabase.from("lessons").insert(payload).select().single(); if (result.error) setAuthError(result.error.message); else { setLessons((current) => editingLessonId ? current.map((lesson) => lesson.id === editingLessonId ? result.data as SupabaseLesson : lesson) : [...current, result.data as SupabaseLesson]); resetLessonForm(); setMessage("تم حفظ الدرس مع استخراج VIDEO_ID محلياً."); } setBusy(false); }
  async function toggleLesson(lesson: SupabaseLesson) { const result = await supabase.from("lessons").update({ is_published: !lesson.is_published }).eq("id", lesson.id).select().single(); if (!result.error) setLessons((current) => current.map((item) => item.id === lesson.id ? result.data as SupabaseLesson : item)); }
  async function deleteLesson(lessonId: number) { const result = await supabase.from("lessons").delete().eq("id", lessonId); if (!result.error) setLessons((current) => current.filter((lesson) => lesson.id !== lessonId)); }

  if (Platform.OS !== "web") return <View style={styles.center}><Text style={styles.title}>لوحة الإدارة متاحة عبر Website</Text><Text style={styles.muted}>افتح مسار /admin-web من متصفح الويب.</Text></View>;
  if (!authReady) return <View style={styles.center}><ActivityIndicator color="#176B87" size="large" /></View>;
  if (!session || !isAdmin) return <View style={styles.page}><View style={styles.loginCard}><Text style={styles.brand}>أكاديمية مسار</Text><Text style={styles.title}>دخول الإدارة</Text><Text style={styles.muted}>أدخل البريد الإلكتروني وكلمة المرور الخاصة بحساب الإدارة.</Text><TextInput value={email} onChangeText={setEmail} placeholder="البريد الإلكتروني" placeholderTextColor="#8A96A3" autoCapitalize="none" keyboardType="email-address" style={styles.input} /><TextInput value={password} onChangeText={setPassword} placeholder="كلمة المرور" placeholderTextColor="#8A96A3" secureTextEntry style={styles.input} /><Pressable disabled={busy || !email.trim() || !password} onPress={() => void signIn()} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, (!email.trim() || !password) && styles.disabledButton]}><Text style={styles.primaryText}>{busy ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}</Text></Pressable>{authError ? <Text style={styles.error}>{authError}</Text> : null}<Text style={styles.loginHint}>يجب إنشاء الحساب في Supabase Auth وإضافة user_id الخاص به إلى جدول admin_profiles.</Text></View></View>;

  return <View style={styles.page}><View style={styles.topbar}><View><Text style={styles.brand}>أكاديمية مسار</Text><Text style={styles.topbarTitle}>لوحة إدارة المحتوى</Text></View><View style={styles.topActions}><Text style={styles.userEmail}>{session.user.email}</Text><Pressable onPress={() => void signOut()} style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}><Text style={styles.outlineText}>خروج</Text></Pressable></View></View><ScrollView contentContainerStyle={styles.dashboard} showsVerticalScrollIndicator={false}>{authError ? <View style={styles.errorBanner}><Text style={styles.error}>{authError}</Text></View> : null}{message ? <View style={styles.successBanner}><Text style={styles.success}>{message}</Text></View> : null}<AdminAiChat /><AcademicManagement data={academic} onDataChange={setAcademic} onMessage={setMessage} onError={setAuthError} /><View style={styles.statsSection}><View style={styles.statsHeader}><View><Text style={styles.panelTitle}>إحصائيات المحتوى</Text><Text style={styles.muted}>ملخص مباشر يساعدك على متابعة ما تمت إضافته وإظهاره للطلاب.</Text></View><Text style={styles.statsUpdated}>محدّث الآن</Text></View><View style={styles.stats}>{[["إجمالي الكورسات", courses.length], ["إجمالي الدروس", lessons.length], ["كورسات ظاهرة", courses.filter((course) => course.is_published).length], ["دروس ظاهرة", lessons.filter((lesson) => lesson.is_published).length]].map(([label, value]) => <View key={String(label)} style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.muted}>{label}</Text></View>)}</View><View style={styles.statsFooter}><Text style={styles.muted}>كورسات مخفية: {courses.filter((course) => !course.is_published).length}</Text><Text style={styles.muted}>دروس مخفية: {lessons.filter((lesson) => !lesson.is_published).length}</Text></View></View><View style={styles.columns}><View style={styles.panel}><View style={styles.panelHeader}><Text style={styles.panelTitle}>الكورسات</Text><Pressable onPress={resetCourseForm} style={({ pressed }) => [styles.primarySmall, pressed && styles.pressed]}><Text style={styles.primaryText}>+ كورس جديد</Text></Pressable></View><TextInput value={search} onChangeText={setSearch} placeholder="بحث في الكورسات" placeholderTextColor="#8A96A3" style={styles.input} />{busy ? <ActivityIndicator color="#176B87" /> : null}{filteredCourses.map((course) => <Pressable key={course.id} onPress={() => editCourse(course)} style={[styles.courseItem, selectedCourseId === course.id && styles.courseSelected]}><View style={styles.courseCopy}><Text style={styles.courseName}>{course.title}</Text><Text style={styles.muted}>{course.instructor ?? "بدون مدرب"} · {lessons.filter((lesson) => lesson.course_id === course.id).length} دروس</Text></View><View style={styles.itemActions}><Text style={[styles.status, { color: course.is_published ? "#2E9B68" : "#8A96A3" }]}>{course.is_published ? "ظاهر" : "مخفي"}</Text><Pressable onPress={() => void toggleCourse(course)}><Text style={styles.actionText}>{course.is_published ? "إخفاء" : "نشر"}</Text></Pressable><Pressable onPress={() => void deleteCourse(course.id)}><Text style={styles.deleteText}>حذف</Text></Pressable></View></Pressable>)}</View><View style={styles.panel}><Text style={styles.panelTitle}>{editingCourseId ? "تعديل الكورس" : "إضافة كورس"}</Text><Text style={styles.label}>الصف الأكاديمي</Text><View style={styles.chips}>{academic.stages.filter((item) => item.is_active).map((item) => <Pressable key={item.id} onPress={() => chooseStage(item.id)} style={[styles.chip, selectedStageId === item.id && styles.chipSelected]}><Text style={[styles.chipText, selectedStageId === item.id && styles.chipSelectedText]}>{item.name}</Text></Pressable>)}</View><Text style={styles.label}>المادة المرتبطة بالصف</Text><View style={styles.chips}>{availableSubjects.length ? availableSubjects.map((item) => <Pressable key={item.id} onPress={() => chooseSubject(item.id)} style={[styles.chip, selectedSubjectId === item.id && styles.chipSelected]}><Text style={[styles.chipText, selectedSubjectId === item.id && styles.chipSelectedText]}>{item.name}</Text></Pressable>) : <Text style={styles.muted}>اختر صفاً مرتبطاً بمواد أولاً.</Text>}</View><Text style={styles.label}>المدرس المرتبط</Text><View style={styles.chips}>{availableTeachers.length ? availableTeachers.map((item) => { const assignment = availableAssignments.find((entry) => entry.teacher_id === item.id); return <Pressable key={item.id} onPress={() => setSelectedAssignmentId(assignment?.id ?? "")} style={[styles.chip, selectedAssignmentId === assignment?.id && styles.chipSelected]}><Text style={[styles.chipText, selectedAssignmentId === assignment?.id && styles.chipSelectedText]}>{item.display_name}</Text></Pressable>; }) : <Text style={styles.muted}>اختر مادة مرتبطة ثم أنشئ Teacher Assignment.</Text>}</View><Field label="اسم الكورس" value={courseTitle} onChangeText={setCourseTitle} placeholder="مثال: أساسيات البرمجة" /><Field label="الوصف" value={courseDescription} onChangeText={setCourseDescription} placeholder="وصف مختصر" multiline /><Field label={editingCourseId ? "المدرس القديم (للتوافق)" : "المدرس الناتج من Assignment"} value={courseInstructor} onChangeText={setCourseInstructor} placeholder={editingCourseId ? "اسم المدرس القديم" : "يُحفظ تلقائياً من الارتباط"} editable={Boolean(editingCourseId)} /><Text style={styles.label}>التصنيف</Text><View style={styles.chips}>{categories.map((category) => <Pressable key={category.id} onPress={() => setCourseCategory(category.id)} style={[styles.chip, courseCategory === category.id && styles.chipSelected]}><Text style={[styles.chipText, courseCategory === category.id && styles.chipSelectedText]}>{category.name}</Text></Pressable>)}</View><View style={styles.switchRow}><Text style={styles.label}>إظهار للطلاب</Text><Switch value={coursePublished} onValueChange={setCoursePublished} trackColor={{ false: "#DDE2E6", true: "#176B87" }} /></View><Pressable onPress={() => void saveCourse()} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>حفظ الكورس</Text></Pressable></View></View>{selectedCourse ? <View style={styles.lessonArea}><View style={styles.lessonPanel}><View style={styles.panelHeader}><View><Text style={styles.panelTitle}>دروس: {selectedCourse.title}</Text><Text style={styles.muted}>يتم حفظ روابط YouTube وVIDEO_ID فقط، بلا تنزيل للفيديو.</Text></View><Pressable onPress={resetLessonForm} style={({ pressed }) => [styles.primarySmall, pressed && styles.pressed]}><Text style={styles.primaryText}>+ درس جديد</Text></Pressable></View>{selectedLessons.map((lesson, index) => <View key={lesson.id} style={styles.lessonItem}><View style={styles.order}><Text style={styles.orderText}>{index + 1}</Text></View><View style={styles.courseCopy}><Text style={styles.courseName}>{lesson.title}</Text><Text style={styles.muted}>{lesson.youtube_video_id} · {lesson.is_published ? "ظاهر" : "مخفي"}</Text></View><View style={styles.itemActions}><Pressable onPress={() => editLesson(lesson)}><Text style={styles.actionText}>تعديل</Text></Pressable><Pressable onPress={() => void toggleLesson(lesson)}><Text style={styles.actionText}>{lesson.is_published ? "إخفاء" : "نشر"}</Text></Pressable><Pressable onPress={() => void deleteLesson(lesson.id)}><Text style={styles.deleteText}>حذف</Text></Pressable></View></View>)}</View><View style={styles.lessonForm}><Text style={styles.panelTitle}>{editingLessonId ? "تعديل الدرس" : "إضافة درس"}</Text><Field label="عنوان الدرس" value={lessonTitle} onChangeText={setLessonTitle} placeholder="عنوان الدرس" /><Field label="رابط YouTube" value={lessonUrl} onChangeText={setLessonUrl} placeholder="https://www.youtube.com/watch?v=VIDEO_ID" autoCapitalize="none" /><Field label="صورة اختيارية" value={lessonImage} onChangeText={setLessonImage} placeholder="https://..." autoCapitalize="none" /><Field label="وصف اختياري" value={lessonDescription} onChangeText={setLessonDescription} placeholder="وصف الدرس" multiline /><Field label="ترتيب الدرس" value={lessonOrder} onChangeText={setLessonOrder} placeholder="0" keyboardType="numeric" autoCapitalize="none" /><View style={styles.switchRow}><Text style={styles.label}>إظهار الدرس</Text><Switch value={lessonPublished} onValueChange={setLessonPublished} trackColor={{ false: "#DDE2E6", true: "#176B87" }} /></View><Pressable onPress={() => void saveLesson()} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>حفظ الدرس</Text></Pressable></View></View> : <View style={styles.empty}><Text style={styles.panelTitle}>اختر كورساً لإدارة دروسه</Text><Text style={styles.muted}>يمكنك إدخال رابط كل فيديو يدوياً دون أي YouTube API Key.</Text></View>}</ScrollView></View>;
}

function Field({ label, value, onChangeText, placeholder, multiline, autoCapitalize = "sentences", keyboardType = "default", editable = true }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean; autoCapitalize?: "none" | "sentences"; keyboardType?: "default" | "numeric"; editable?: boolean }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#8A96A3" multiline={multiline} autoCapitalize={autoCapitalize} keyboardType={keyboardType} editable={editable} style={[styles.input, multiline && styles.textarea, !editable && { backgroundColor: "#F3F5F6", color: "#697586" }]} /></View>; }

const styles = StyleSheet.create({ page: { flex: 1, minHeight: "100%", backgroundColor: "#F5F7F8", paddingHorizontal: 34 }, topbar: { maxWidth: 1240, width: "100%", alignSelf: "center", paddingVertical: 28, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }, topbarTitle: { fontSize: 25, fontWeight: "800", color: "#17212B", marginTop: 5, textAlign: "right" }, brand: { fontSize: 13, fontWeight: "800", color: "#176B87", textAlign: "right" }, topActions: { flexDirection: "row-reverse", alignItems: "center", gap: 13 }, userEmail: { color: "#697586", fontSize: 12 }, dashboard: { maxWidth: 1240, width: "100%", alignSelf: "center", paddingBottom: 60 }, statsSection: { backgroundColor: "#FFFFFF", borderRadius: 17, borderWidth: 1, borderColor: "#E4E8EB", padding: 18, marginBottom: 18 }, statsHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }, statsUpdated: { color: "#2E9B68", fontSize: 11, fontWeight: "800" }, stats: { flexDirection: "row-reverse", gap: 12 }, statsFooter: { flexDirection: "row-reverse", justifyContent: "space-between", marginTop: 13, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EEF0F2" }, stat: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E4E8EB", padding: 17, alignItems: "flex-end" }, statValue: { fontSize: 28, fontWeight: "800", color: "#176B87" }, muted: { color: "#697586", fontSize: 12, lineHeight: 19, textAlign: "right" }, columns: { flexDirection: "row-reverse", gap: 18 }, panel: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 17, borderWidth: 1, borderColor: "#E4E8EB", padding: 18, marginBottom: 18 }, panelHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }, panelTitle: { color: "#17212B", fontSize: 18, fontWeight: "800", textAlign: "right" }, input: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DDE2E6", borderRadius: 11, minHeight: 44, paddingHorizontal: 12, color: "#17212B", fontSize: 13, marginBottom: 11, textAlign: "right" }, textarea: { minHeight: 82, paddingTop: 11, textAlignVertical: "top" }, primaryButton: { minHeight: 46, borderRadius: 11, backgroundColor: "#176B87", alignItems: "center", justifyContent: "center", paddingHorizontal: 16, marginTop: 10 }, primarySmall: { borderRadius: 10, backgroundColor: "#176B87", paddingHorizontal: 11, paddingVertical: 9 }, primaryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" }, outlineButton: { borderWidth: 1, borderColor: "#DDE2E6", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }, outlineText: { color: "#697586", fontSize: 12, fontWeight: "700" }, courseItem: { flexDirection: "row-reverse", alignItems: "center", gap: 11, borderWidth: 1, borderColor: "#E7E9ED", borderRadius: 13, padding: 11, marginTop: 9 }, courseSelected: { borderColor: "#176B87", backgroundColor: "#F0F7F9" }, courseCopy: { flex: 1 }, courseName: { color: "#17212B", fontSize: 13, fontWeight: "800", textAlign: "right" }, itemActions: { flexDirection: "row-reverse", alignItems: "center", gap: 9 }, status: { fontSize: 10, fontWeight: "800" }, actionText: { color: "#176B87", fontSize: 11, fontWeight: "800" }, deleteText: { color: "#C94B4B", fontSize: 11, fontWeight: "800" }, field: { marginTop: 5 }, label: { color: "#17212B", fontSize: 12, fontWeight: "800", textAlign: "right", marginBottom: 7 }, chips: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 7, marginBottom: 10 }, chip: { borderWidth: 1, borderColor: "#DDE2E6", borderRadius: 20, paddingHorizontal: 11, paddingVertical: 8 }, chipSelected: { backgroundColor: "#176B87", borderColor: "#176B87" }, chipText: { color: "#17212B", fontSize: 11, fontWeight: "700" }, chipSelectedText: { color: "#FFFFFF" }, switchRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", minHeight: 47 }, lessonArea: { flexDirection: "row-reverse", gap: 18 }, lessonPanel: { flex: 1.2, backgroundColor: "#FFFFFF", borderRadius: 17, borderWidth: 1, borderColor: "#E4E8EB", padding: 18 }, lessonForm: { flex: 0.8, backgroundColor: "#FFFFFF", borderRadius: 17, borderWidth: 1, borderColor: "#E4E8EB", padding: 18 }, lessonItem: { flexDirection: "row-reverse", alignItems: "center", gap: 10, borderTopWidth: 1, borderColor: "#EEF0F2", paddingVertical: 12 }, order: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#EAF4F6", alignItems: "center", justifyContent: "center" }, orderText: { color: "#176B87", fontWeight: "800" }, empty: { alignItems: "center", padding: 55 }, loginCard: { width: 430, maxWidth: "100%", alignSelf: "center", marginTop: 90, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 28, borderWidth: 1, borderColor: "#E4E8EB" }, title: { fontSize: 27, fontWeight: "800", color: "#17212B", textAlign: "right", marginTop: 7, marginBottom: 9 }, loginHint: { color: "#8A96A3", fontSize: 11, lineHeight: 18, textAlign: "right", marginTop: 18 }, error: { color: "#C94B4B", fontSize: 12, lineHeight: 19, textAlign: "right", marginTop: 10 }, success: { color: "#2E9B68", fontSize: 12, fontWeight: "700", textAlign: "right" }, errorBanner: { backgroundColor: "#FFF2F2", borderRadius: 11, padding: 12, marginBottom: 12 }, successBanner: { backgroundColor: "#EFFAF4", borderRadius: 11, padding: 12, marginBottom: 12 }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] }, disabledButton: { opacity: 0.5 }, center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 } });
