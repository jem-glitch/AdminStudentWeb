import { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { supabase } from "@/lib/supabase";

type ChatMessage = { id: string; role: "admin" | "ai"; text: string };

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "ai",
  text: "مرحبًا، أنا مساعد الإدارة. يمكنني في هذه المرحلة الإجابة عن الأسئلة وتحليل الطلبات، لكنني لا أنفذ أي تغيير على بيانات المنصة.",
};

export function AdminAiChat() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage() {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    setError("");
    setBusy(true);
    setMessages((current) => [...current, { id: `${Date.now()}-admin`, role: "admin", text }]);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("admin-ai", { body: { message: text } });
      if (invokeError) throw invokeError;
      const reply = typeof data?.data?.text === "string" ? data.data.text.trim() : "";
      if (!reply) throw new Error("empty_response");
      setMessages((current) => [...current, { id: `${Date.now()}-ai`, role: "ai", text: reply }]);
    } catch {
      setError("تعذر الاتصال بالمساعد، حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  function handleKeyPress(event: { nativeEvent: { key?: string; shiftKey?: boolean } }) {
    if (Platform.OS === "web" && event.nativeEvent.key === "Enter" && !event.nativeEvent.shiftKey) {
      void sendMessage();
    }
  }

  function startNewChat() {
    setMessages([{ ...welcomeMessage, id: `welcome-${Date.now()}` }]);
    setDraft("");
    setError("");
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>مساعد الإدارة</Text>
          <Text style={styles.subtitle}>إجابات وتحليل فقط، بدون تنفيذ تغييرات على البيانات.</Text>
        </View>
        <Pressable onPress={() => setOpen((current) => !current)} style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}>
          <Text style={styles.toggleText}>{open ? "إخفاء المساعد" : "فتح المساعد"}</Text>
        </Pressable>
      </View>
      {open ? (
        <View style={styles.chatPanel}>
          <View style={styles.chatToolbar}>
            <Text style={styles.toolbarHint}>المحادثة محلية لهذه الجلسة فقط</Text>
            <Pressable onPress={startNewChat} disabled={busy} style={({ pressed }) => [styles.newChat, pressed && styles.pressed]}>
              <Text style={styles.newChatText}>محادثة جديدة</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
            {messages.map((message) => (
              <View key={message.id} style={[styles.messageRow, message.role === "admin" ? styles.adminRow : styles.aiRow]}>
                <View style={[styles.bubble, message.role === "admin" ? styles.adminBubble : styles.aiBubble]}>
                  <Text style={[styles.role, message.role === "admin" && styles.adminRole]}>{message.role === "admin" ? "أنت" : "AI Assistant"}</Text>
                  <Text style={[styles.messageText, message.role === "admin" && styles.adminMessageText]}>{message.text}</Text>
                </View>
              </View>
            ))}
            {busy ? <View style={[styles.messageRow, styles.aiRow]}><View style={[styles.bubble, styles.aiBubble]}><Text style={styles.role}>AI Assistant</Text><Text style={styles.thinking}>جاري التفكير...</Text></View></View> : null}
          </ScrollView>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.composer}>
            <TextInput value={draft} onChangeText={setDraft} onKeyPress={handleKeyPress} onSubmitEditing={() => void sendMessage()} returnKeyType="send" blurOnSubmit={false} multiline placeholder="اكتب رسالة للمساعد..." placeholderTextColor="#8A96A3" style={styles.input} editable={!busy} />
            <Pressable onPress={() => void sendMessage()} disabled={busy || !draft.trim()} style={({ pressed }) => [styles.send, pressed && styles.pressed, (busy || !draft.trim()) && styles.disabled]}>
              <Text style={styles.sendText}>{busy ? "..." : "إرسال"}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: "#F0F7F9", borderRadius: 17, borderWidth: 1, borderColor: "#B8DCE4", padding: 18, marginBottom: 18 },
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: 14 },
  headerCopy: { flex: 1 },
  title: { color: "#17212B", fontSize: 18, fontWeight: "800", textAlign: "right" },
  subtitle: { color: "#697586", fontSize: 12, lineHeight: 19, textAlign: "right", marginTop: 4 },
  toggle: { backgroundColor: "#176B87", borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10 },
  toggleText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  chatPanel: { backgroundColor: "#FFFFFF", borderRadius: 14, marginTop: 16, padding: 13, borderWidth: 1, borderColor: "#DDE2E6" },
  chatToolbar: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 },
  toolbarHint: { color: "#8A96A3", fontSize: 11, textAlign: "right" },
  newChat: { borderWidth: 1, borderColor: "#DDE2E6", borderRadius: 9, paddingHorizontal: 10, paddingVertical: 7 },
  newChatText: { color: "#176B87", fontSize: 11, fontWeight: "800" },
  messages: { maxHeight: 330, minHeight: 160 },
  messagesContent: { gap: 9, paddingVertical: 5 },
  messageRow: { flexDirection: "row", width: "100%" },
  adminRow: { justifyContent: "flex-start" },
  aiRow: { justifyContent: "flex-end" },
  bubble: { maxWidth: "88%", borderRadius: 13, padding: 11 },
  adminBubble: { backgroundColor: "#176B87", borderBottomLeftRadius: 4 },
  aiBubble: { backgroundColor: "#F5F7F8", borderWidth: 1, borderColor: "#E4E8EB", borderBottomRightRadius: 4 },
  role: { color: "#697586", fontSize: 10, fontWeight: "800", textAlign: "right", marginBottom: 3 },
  adminRole: { color: "#DCEFF3" },
  messageText: { color: "#17212B", fontSize: 13, lineHeight: 21, textAlign: "right" },
  adminMessageText: { color: "#FFFFFF" },
  thinking: { color: "#697586", fontSize: 12, textAlign: "right" },
  composer: { flexDirection: "row-reverse", alignItems: "flex-end", gap: 8, marginTop: 10 },
  input: { flex: 1, minHeight: 44, maxHeight: 100, borderWidth: 1, borderColor: "#DDE2E6", borderRadius: 11, paddingHorizontal: 11, paddingTop: 10, color: "#17212B", fontSize: 13, textAlign: "right", textAlignVertical: "top" },
  send: { minHeight: 44, borderRadius: 11, backgroundColor: "#176B87", paddingHorizontal: 15, alignItems: "center", justifyContent: "center" },
  sendText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  error: { color: "#C94B4B", fontSize: 12, lineHeight: 19, textAlign: "right", marginTop: 8 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
