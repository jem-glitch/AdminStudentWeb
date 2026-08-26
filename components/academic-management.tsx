import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase, type SupabaseStage, type SupabaseSubject, type SupabaseStageSubject, type SupabaseTeacher, type SupabaseTeacherAssignment } from "@/lib/supabase";

export type AcademicData = {
  stages: SupabaseStage[];
  subjects: SupabaseSubject[];
  stageSubjects: SupabaseStageSubject[];
  teachers: SupabaseTeacher[];
  assignments: SupabaseTeacherAssignment[];
};

type Props = { data: AcademicData; onDataChange: (data: AcademicData) => void; onMessage: (value: string) => void; onError: (value: string) => void };

const initialForm = { name: "", slug: "", sortOrder: "0" };
function slugify(value: string) { return value.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, ""); }
function apiError(error: unknown) { return error instanceof Error ? error.message : "تعذر تنفيذ العملية."; }

export function AcademicManagement({ data, onDataChange, onMessage, onError }: Props) {
  const [stageForm, setStageForm] = useState(initialForm);
  const [subjectForm, setSubjectForm] = useState(initialForm);
  const [teacherForm, setTeacherForm] = useState({ displayName: "", slug: "" });
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [busy, setBusy] = useState(false);

  const linkedSubjectIds = useMemo(() => new Set(data.stageSubjects.filter((item) => item.stage_id === selectedStageId).map((item) => item.subject_id)), [data.stageSubjects, selectedStageId]);
  const stageSubject = data.stageSubjects.find((item) => item.stage_id === selectedStageId && item.subject_id === selectedSubjectId);
  const assignmentExists = data.assignments.some((item) => item.stage_subject_id === stageSubject?.id && item.teacher_id === selectedTeacherId);

  async function saveStage() {
    if (!stageForm.name.trim()) return onError("أدخل اسم الصف.");
    setBusy(true); onError("");
    try {
      const payload = { name: stageForm.name.trim(), slug: stageForm.slug.trim() || slugify(stageForm.name), sort_order: Number(stageForm.sortOrder) || 0 };
      const result = editingStage ? await supabase.from("stages").update(payload).eq("id", editingStage).select().single() : await supabase.from("stages").insert(payload).select().single();
      if (result.error) throw result.error;
      const item = result.data as SupabaseStage;
      onDataChange({ ...data, stages: editingStage ? data.stages.map((row) => row.id === item.id ? item : row) : [...data.stages, item].sort((a, b) => a.sort_order - b.sort_order) });
      setStageForm(initialForm); setEditingStage(null); onMessage("تم حفظ الصف.");
    } catch (error) { onError(apiError(error)); } finally { setBusy(false); }
  }
  async function saveSubject() {
    if (!subjectForm.name.trim()) return onError("أدخل اسم المادة.");
    setBusy(true); onError("");
    try {
      const payload = { name: subjectForm.name.trim(), slug: subjectForm.slug.trim() || slugify(subjectForm.name), sort_order: Number(subjectForm.sortOrder) || 0 };
      const result = editingSubject ? await supabase.from("subjects").update(payload).eq("id", editingSubject).select().single() : await supabase.from("subjects").insert(payload).select().single();
      if (result.error) throw result.error;
      const item = result.data as SupabaseSubject;
      onDataChange({ ...data, subjects: editingSubject ? data.subjects.map((row) => row.id === item.id ? item : row) : [...data.subjects, item].sort((a, b) => a.sort_order - b.sort_order) });
      setSubjectForm(initialForm); setEditingSubject(null); onMessage("تم حفظ المادة.");
    } catch (error) { onError(apiError(error)); } finally { setBusy(false); }
  }
  async function saveTeacher() {
    if (!teacherForm.displayName.trim()) return onError("أدخل اسم المدرس.");
    setBusy(true); onError("");
    try {
      const payload = { display_name: teacherForm.displayName.trim(), slug: teacherForm.slug.trim() || slugify(teacherForm.displayName) };
      const result = editingTeacher ? await supabase.from("teachers").update(payload).eq("id", editingTeacher).select().single() : await supabase.from("teachers").insert(payload).select().single();
      if (result.error) throw result.error;
      const item = result.data as SupabaseTeacher;
      onDataChange({ ...data, teachers: editingTeacher ? data.teachers.map((row) => row.id === item.id ? item : row) : [...data.teachers, item].sort((a, b) => a.display_name.localeCompare(b.display_name, "ar")) });
      setTeacherForm({ displayName: "", slug: "" }); setEditingTeacher(null); onMessage("تم حفظ المدرس.");
    } catch (error) { onError(apiError(error)); } finally { setBusy(false); }
  }
  async function toggleActive(table: "stages" | "subjects" | "teachers", id: string, value: boolean) {
    setBusy(true); onError("");
    try {
      const result = await supabase.from(table).update({ is_active: !value }).eq("id", id).select().single();
      if (result.error) throw result.error;
      if (table === "stages") onDataChange({ ...data, stages: data.stages.map((row) => row.id === id ? result.data as SupabaseStage : row) });
      if (table === "subjects") onDataChange({ ...data, subjects: data.subjects.map((row) => row.id === id ? result.data as SupabaseSubject : row) });
      if (table === "teachers") onDataChange({ ...data, teachers: data.teachers.map((row) => row.id === id ? result.data as SupabaseTeacher : row) });
    } catch (error) { onError(apiError(error)); } finally { setBusy(false); }
  }
  async function linkSubject() {
    if (!selectedStageId || !selectedSubjectId) return onError("اختر صفاً ومادة أولاً.");
    if (linkedSubjectIds.has(selectedSubjectId)) return onError("هذه المادة مرتبطة بهذا الصف مسبقاً.");
    setBusy(true); onError("");
    try {
      const result = await supabase.from("stage_subjects").insert({ stage_id: selectedStageId, subject_id: selectedSubjectId }).select().single();
      if (result.error) throw result.error;
      onDataChange({ ...data, stageSubjects: [...data.stageSubjects, result.data as SupabaseStageSubject] }); onMessage("تم ربط المادة بالصف.");
    } catch (error) { onError(apiError(error)); } finally { setBusy(false); }
  }
  async function createAssignment() {
    if (!stageSubject || !selectedTeacherId) return onError("اختر الصف والمادة والمدرس أولاً.");
    if (assignmentExists) return onError("هذا المدرس مرتبط بالصف والمادة مسبقاً.");
    setBusy(true); onError("");
    try {
      const result = await supabase.from("teacher_assignments").insert({ stage_subject_id: stageSubject.id, teacher_id: selectedTeacherId }).select().single();
      if (result.error) throw result.error;
      onDataChange({ ...data, assignments: [...data.assignments, result.data as SupabaseTeacherAssignment] }); onMessage("تم إنشاء ارتباط المدرس.");
    } catch (error) { onError(apiError(error)); } finally { setBusy(false); }
  }

  return <View style={styles.wrapper}>
    <View style={styles.header}><View><Text style={styles.title}>البنية الأكاديمية</Text><Text style={styles.muted}>إدارة الصفوف والمواد والمدرسين والارتباطات من Supabase.</Text></View>{busy ? <ActivityIndicator color="#176B87" /> : null}</View>
    <View style={styles.grid}>
      <Section title="الصفوف" subtitle="Stages"><Field label="اسم الصف" value={stageForm.name} onChangeText={(value) => setStageForm({ ...stageForm, name: value })} placeholder="مثال: الخامس العلمي" /><Field label="Slug اختياري" value={stageForm.slug} onChangeText={(value) => setStageForm({ ...stageForm, slug: value })} placeholder="يُنشأ تلقائياً" /><Field label="الترتيب" value={stageForm.sortOrder} onChangeText={(value) => setStageForm({ ...stageForm, sortOrder: value })} placeholder="0" /><Action title={editingStage ? "حفظ تعديل الصف" : "إضافة صف"} onPress={() => void saveStage()} /><List>{data.stages.map((item) => <Row key={item.id} title={item.name} meta={`الترتيب: ${item.sort_order}`} active={item.is_active} onEdit={() => { setEditingStage(item.id); setStageForm({ name: item.name, slug: item.slug, sortOrder: String(item.sort_order) }); }} onToggle={() => void toggleActive("stages", item.id, item.is_active)} />)}</List></Section>
      <Section title="المواد" subtitle="Subjects"><Field label="اسم المادة" value={subjectForm.name} onChangeText={(value) => setSubjectForm({ ...subjectForm, name: value })} placeholder="مثال: رياضيات" /><Field label="Slug اختياري" value={subjectForm.slug} onChangeText={(value) => setSubjectForm({ ...subjectForm, slug: value })} placeholder="يُنشأ تلقائياً" /><Field label="الترتيب" value={subjectForm.sortOrder} onChangeText={(value) => setSubjectForm({ ...subjectForm, sortOrder: value })} placeholder="0" /><Action title={editingSubject ? "حفظ تعديل المادة" : "إضافة مادة"} onPress={() => void saveSubject()} /><List>{data.subjects.map((item) => <Row key={item.id} title={item.name} meta={`الترتيب: ${item.sort_order}`} active={item.is_active} onEdit={() => { setEditingSubject(item.id); setSubjectForm({ name: item.name, slug: item.slug, sortOrder: String(item.sort_order) }); }} onToggle={() => void toggleActive("subjects", item.id, item.is_active)} />)}</List></Section>
      <Section title="المدرسون" subtitle="Teachers"><Field label="اسم المدرس" value={teacherForm.displayName} onChangeText={(value) => setTeacherForm({ ...teacherForm, displayName: value })} placeholder="مثال: الأستاذ أحمد" /><Field label="Slug اختياري" value={teacherForm.slug} onChangeText={(value) => setTeacherForm({ ...teacherForm, slug: value })} placeholder="يُنشأ تلقائياً" /><Action title={editingTeacher ? "حفظ تعديل المدرس" : "إضافة مدرس"} onPress={() => void saveTeacher()} /><List>{data.teachers.map((item) => <Row key={item.id} title={item.display_name} meta={item.slug} active={item.is_active} onEdit={() => { setEditingTeacher(item.id); setTeacherForm({ displayName: item.display_name, slug: item.slug }); }} onToggle={() => void toggleActive("teachers", item.id, item.is_active)} />)}</List></Section>
    </View>
    <Section title="ربط المادة بالصف والمدرس" subtitle="Stage Subjects & Teacher Assignments"><Text style={styles.label}>الصف</Text><SelectList items={data.stages.filter((item) => item.is_active)} value={selectedStageId} onChange={(value) => { setSelectedStageId(value); setSelectedSubjectId(""); }} placeholder="اختر الصف" /><Text style={styles.label}>المادة</Text><SelectList items={data.subjects.filter((item) => item.is_active)} value={selectedSubjectId} onChange={setSelectedSubjectId} placeholder="اختر المادة" /><Action title="ربط المادة بالصف" onPress={() => void linkSubject()} /><Text style={styles.label}>المدرس</Text><SelectList items={data.teachers.filter((item) => item.is_active)} value={selectedTeacherId} onChange={setSelectedTeacherId} placeholder="اختر المدرس" /><Action title="إنشاء Teacher Assignment" onPress={() => void createAssignment()} /><Text style={styles.muted}>بعد إنشاء الارتباط، سيظهر في اختيار الكورس ويمكن ربطه بالكورس الحالي أو أي كورس جديد.</Text></Section>
  </View>;
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <View style={styles.section}><View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.muted}>{subtitle}</Text></View></View>{children}</View>; }
function List({ children }: { children: React.ReactNode }) { return <ScrollView style={styles.list} nestedScrollEnabled>{children}</ScrollView>; }
function Field({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string }) { return <View><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#8A96A3" style={styles.input} /></View>; }
function Action({ title, onPress }: { title: string; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><Text style={styles.actionText}>{title}</Text></Pressable>; }
function Row({ title, meta, active, onEdit, onToggle }: { title: string; meta: string; active: boolean; onEdit: () => void; onToggle: () => void }) { return <View style={styles.row}><View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.muted}>{meta}</Text></View><Pressable onPress={onEdit}><Text style={styles.link}>تعديل</Text></Pressable><Pressable onPress={onToggle}><Text style={[styles.link, { color: active ? "#C94B4B" : "#2E9B68" }]}>{active ? "تعطيل" : "تفعيل"}</Text></Pressable></View>; }
function SelectList({ items, value, onChange, placeholder }: { items: { id: string; name?: string; display_name?: string }[]; value: string; onChange: (value: string) => void; placeholder: string }) { return <View style={styles.selectList}>{items.length ? items.map((item) => <Pressable key={item.id} onPress={() => onChange(item.id)} style={[styles.selectItem, value === item.id && styles.selectSelected]}><Text style={[styles.selectText, value === item.id && styles.selectSelectedText]}>{item.name ?? item.display_name}</Text></Pressable>) : <Text style={styles.muted}>{placeholder}: لا توجد خيارات بعد.</Text>}</View>; }

const styles = StyleSheet.create({
  wrapper: { backgroundColor: "#F0F7F9", borderRadius: 17, borderWidth: 1, borderColor: "#B8DCE4", padding: 18, marginBottom: 18 },
  header: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  title: { color: "#17212B", fontSize: 19, fontWeight: "800", textAlign: "right" },
  grid: { flexDirection: "row-reverse", gap: 14, flexWrap: "wrap" },
  section: { flex: 1, minWidth: 260, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#DDE2E6", padding: 14, marginBottom: 14 },
  sectionHeader: { flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 9 },
  sectionTitle: { color: "#17212B", fontSize: 16, fontWeight: "800", textAlign: "right" },
  label: { color: "#17212B", fontSize: 11, fontWeight: "800", textAlign: "right", marginTop: 7, marginBottom: 5 },
  input: { minHeight: 42, borderWidth: 1, borderColor: "#DDE2E6", borderRadius: 10, paddingHorizontal: 10, color: "#17212B", fontSize: 12, textAlign: "right", marginBottom: 5 },
  action: { minHeight: 40, borderRadius: 10, backgroundColor: "#176B87", alignItems: "center", justifyContent: "center", paddingHorizontal: 12, marginTop: 8 },
  actionText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  list: { maxHeight: 190, marginTop: 8 },
  row: { flexDirection: "row-reverse", alignItems: "center", gap: 9, borderTopWidth: 1, borderColor: "#EEF0F2", paddingVertical: 9 },
  rowCopy: { flex: 1 },
  rowTitle: { color: "#17212B", fontSize: 12, fontWeight: "800", textAlign: "right" },
  link: { color: "#176B87", fontSize: 10, fontWeight: "800" },
  selectList: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 7, minHeight: 35 },
  selectItem: { borderWidth: 1, borderColor: "#DDE2E6", borderRadius: 18, paddingHorizontal: 11, paddingVertical: 8 },
  selectSelected: { backgroundColor: "#176B87", borderColor: "#176B87" },
  selectText: { color: "#17212B", fontSize: 11, fontWeight: "700" },
  selectSelectedText: { color: "#FFFFFF" },
  muted: { color: "#697586", fontSize: 11, lineHeight: 18, textAlign: "right" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
