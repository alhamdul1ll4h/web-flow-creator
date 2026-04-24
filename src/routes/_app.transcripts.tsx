import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Workflow, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_app/transcripts")({
  head: () => ({ meta: [{ title: "ปพ.1 — EduCore" }] }),
  component: TranscriptsPage,
});

type Req = { id: string; status: string; pdf_url: string | null; created_at: string; students: { full_name: string; student_code: string } | null };

const N8N_WEBHOOK_KEY = "n8n_transcript_webhook_url";

function TranscriptsPage() {
  const [students, setStudents] = useState<{ id: string; full_name: string; student_code: string }[]>([]);
  const [reqs, setReqs] = useState<Req[]>([]);
  const [studentId, setStudentId] = useState("");
  const [webhook, setWebhook] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    const [s, r] = await Promise.all([
      supabase.from("students").select("id, full_name, student_code"),
      supabase.from("transcript_requests").select("id, status, pdf_url, created_at, students(full_name, student_code)").order("created_at", { ascending: false }),
    ]);
    setStudents(s.data ?? []);
    setReqs((r.data as unknown as Req[]) ?? []);
  }
  useEffect(() => {
    load();
    setWebhook(localStorage.getItem(N8N_WEBHOOK_KEY) ?? "");
  }, []);

  function saveWebhook() {
    localStorage.setItem(N8N_WEBHOOK_KEY, webhook);
    setMsg("บันทึก webhook URL แล้ว");
    setTimeout(() => setMsg(""), 2000);
  }

  async function request(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data: req, error } = await supabase
        .from("transcript_requests")
        .insert({ student_id: studentId, requested_by: user.user?.id, status: "pending" })
        .select("id")
        .single();
      if (error) throw error;

      // Trigger n8n webhook (no-cors to avoid CORS issues from browser)
      if (webhook) {
        const student = students.find((s) => s.id === studentId);
        await fetch(webhook, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            request_id: req.id,
            student_id: studentId,
            student_code: student?.student_code,
            full_name: student?.full_name,
            triggered_at: new Date().toISOString(),
          }),
        });
        setMsg("ส่งคำขอไปยัง n8n workflow แล้ว");
      } else {
        setMsg("บันทึกคำขอแล้ว (ยังไม่ได้ตั้งค่า n8n webhook)");
      }
      setStudentId("");
      load();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">ออกเอกสาร ปพ.1</h1>
      <p className="text-muted-foreground mb-6">ส่งคำขอไปยัง n8n workflow เพื่อสร้างเอกสาร PDF อัตโนมัติ</p>

      <div className="p-5 rounded-xl border border-border bg-card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Workflow className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">การตั้งค่า n8n Webhook</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">ใส่ Webhook URL จาก n8n workflow ของคุณ (ระบบจะเก็บไว้ในเครื่อง)</p>
        <div className="flex gap-2">
          <input value={webhook} onChange={(e) => setWebhook(e.target.value)} placeholder="https://your-n8n.com/webhook/..." className="flex-1 px-3 py-2 rounded-md bg-input border border-border font-mono text-sm" />
          <button onClick={saveWebhook} className="px-4 py-2 rounded-md bg-secondary">บันทึก</button>
        </div>
      </div>

      <form onSubmit={request} className="p-5 rounded-xl border border-border bg-card mb-6 flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm mb-1">เลือกนักเรียน</label>
          <select required value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full px-3 py-2 rounded-md bg-input border border-border">
            <option value="">-- เลือกนักเรียน --</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.student_code} {s.full_name}</option>)}
          </select>
        </div>
        <button disabled={submitting} className="px-5 py-2 rounded-md font-medium text-primary-foreground inline-flex items-center gap-2 disabled:opacity-50" style={{ background: "var(--gradient-primary)" }}>
          <FileText className="h-4 w-4" /> {submitting ? "กำลังส่ง..." : "ขอเอกสาร ปพ.1"}
        </button>
      </form>

      {msg && <div className="mb-4 p-3 rounded-md bg-primary/15 text-primary text-sm">{msg}</div>}

      <h2 className="text-xl font-semibold mb-3">ประวัติคำขอ</h2>
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-muted-foreground">
            <tr><th className="text-left px-4 py-3">วันที่</th><th className="text-left px-4 py-3">นักเรียน</th><th className="text-left px-4 py-3">สถานะ</th><th className="text-left px-4 py-3">เอกสาร</th></tr>
          </thead>
          <tbody>
            {reqs.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3">{new Date(r.created_at).toLocaleString("th-TH")}</td>
                <td className="px-4 py-3">{r.students?.student_code} {r.students?.full_name}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-primary/15 text-primary text-xs">{r.status}</span></td>
                <td className="px-4 py-3">
                  {r.pdf_url ? (
                    <a href={r.pdf_url} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1 hover:underline">
                      เปิด PDF <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : <span className="text-muted-foreground">รอ n8n ตอบกลับ</span>}
                </td>
              </tr>
            ))}
            {reqs.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">ยังไม่มีคำขอ</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
