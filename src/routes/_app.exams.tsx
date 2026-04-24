import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_app/exams")({
  head: () => ({ meta: [{ title: "ตารางสอบ — EduCore" }] }),
  component: ExamsPage,
});

type Row = { id: string; exam_date: string; room: string | null; duration_min: number; subjects: { name: string; code: string } | null };

function ExamsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([]);
  const [form, setForm] = useState({ subject_id: "", exam_date: "", room: "", duration_min: "60" });
  const [open, setOpen] = useState(false);

  async function load() {
    const { data } = await supabase.from("exams").select("id, exam_date, room, duration_min, subjects(name, code)").order("exam_date");
    setRows((data as unknown as Row[]) ?? []);
    const sub = await supabase.from("subjects").select("id, name, code");
    setSubjects(sub.data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("exams").insert({ ...form, duration_min: Number(form.duration_min) });
    setForm({ subject_id: "", exam_date: "", room: "", duration_min: "60" });
    setOpen(false);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">ตารางสอบ</h1>
          <p className="text-muted-foreground">จัดการกำหนดการสอบ</p>
        </div>
        <button onClick={() => setOpen(!open)} className="px-4 py-2 rounded-md font-medium text-primary-foreground inline-flex items-center gap-2" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4" /> เพิ่มตารางสอบ
        </button>
      </div>

      {open && (
        <form onSubmit={add} className="grid md:grid-cols-4 gap-3 p-4 mb-6 rounded-xl border border-border bg-card">
          <select required value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border">
            <option value="">เลือกวิชา</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} {s.name}</option>)}
          </select>
          <input required type="datetime-local" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border" />
          <input placeholder="ห้องสอบ" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border" />
          <div className="flex gap-2">
            <input type="number" placeholder="นาที" value={form.duration_min} onChange={(e) => setForm({ ...form, duration_min: e.target.value })} className="flex-1 px-3 py-2 rounded-md bg-input border border-border" />
            <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground">บันทึก</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((r) => {
          const d = new Date(r.exam_date);
          return (
            <div key={r.id} className="p-5 rounded-xl border border-border" style={{ background: "var(--gradient-card)" }}>
              <div className="text-xs text-primary mb-1">{r.subjects?.code}</div>
              <div className="font-semibold mb-3">{r.subjects?.name}</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>📅 {d.toLocaleDateString("th-TH", { dateStyle: "full" })}</div>
                <div>🕐 {d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} ({r.duration_min} นาที)</div>
                <div>📍 ห้อง: {r.room ?? "-"}</div>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12">ยังไม่มีตารางสอบ</div>}
      </div>
    </div>
  );
}
