import type { AgentAction, DraftIntent } from "./types.ts";

export function parseAgentAction(value: unknown): AgentAction { return value === "approve" || value === "execute" || value === "cancel" || value === "update_draft" ? value : "analyze"; }
export function isDraftIntent(value: unknown): value is DraftIntent { return value === "course_import" || value === "course_update" || value === "course_delete" || value === "publish_course" || value === "unpublish_course"; }
export function safeDraftStatus(value: unknown) { return value === "draft" || value === "approved" || value === "executed" || value === "cancelled" || value === "failed" || value === "expired" ? value : "failed"; }
export function approvalError(status: string, action: AgentAction) {
  if (status === "executed") return "هذه المسودة نُفذت سابقاً ولا يمكن تنفيذها مرة أخرى.";
  if (action === "approve" && status !== "draft") return "لا يمكن اعتماد هذه المسودة في حالتها الحالية.";
  if (action === "execute" && status !== "approved") return "يجب اعتماد المسودة صراحةً قبل تنفيذها.";
  return null;
}
