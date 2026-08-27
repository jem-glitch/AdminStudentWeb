alter table public.content_agent_audit_logs
  drop constraint if exists content_agent_audit_logs_outcome_check;

alter table public.content_agent_audit_logs
  add constraint content_agent_audit_logs_outcome_check
  check (outcome in ('analyzed', 'approved', 'executed', 'rejected', 'failed', 'cancelled', 'updated'));
