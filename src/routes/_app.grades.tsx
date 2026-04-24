import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_app/grades")({
  head: () => ({ meta: [{ title: "ผลการเรียน — EduCore" }] }),
  component: GradesPage,
});

type Row = { id: string; term: string; score: number; grade: string | null; students: { full_name: string; student_code: string } | null; subjects: { name: string; code: string } | null };

function GradesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [students, setStudents] = useState<{ id: string; full_name: string; student_code: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ student_id: "", subject_id: "", term: "1/2567", score: "", grade: "" });
  const [newSubject, setNewSubject] = useState({ code: "", name: "" });

  async function load() {
    const { data } = await supabase.from("grades").select("id, term, score, grade, students(full_name, student_code), subjects(name, code)").order("created_at", { ascending: false });
    setRows((data as unknown as Row[]) ?? []);
    const [s, sub] = await Promise.all([
      supabase.from("students").select("id, full_name, student_code"),
      supabase.from("subjects").select("id, name, code"),
    ]);
    setStudents(s.data ?? []);
    setSubjects(sub.data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("grades").insert({ ...form, score: Number(form.score) });
    setForm({ student_id: "", subject_id: "", term: "1/2567", score: "", grade: "" });
    setOpen(false);
    load();
  }
  async function addSubject(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("subjects").insert(newSubject);
    setNewSubject({ code: "", name: "" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">ผลการเรียน</h1>
          <p className="text-muted-foreground">บันทึกคะแนนและเกรดของนักเรียน</p>
        </div>
        <button onClick={() => setOpen(!open)} className="px-4 py-2 rounded-md font-medium text-primary-foreground inline-flex items-center gap-2" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4" /> บันทึกคะแนน
        </button>
      </div>

      <form onSubmit={addSubject} className="flex gap-2 mb-4 p-3 rounded-lg bg-card border border-border">
        <span className="text-sm text-muted-foreground self-center mr-2">เพิ่มวิชาใหม่:</span>
        <input required placeholder="รหัสวิชา" value={newSubject.code} onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })} className="px-3 py-1.5 rounded-md bg-input border border-border text-sm" />
        <input required placeholder="ชื่อวิชา" value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} className="px-3 py-1.5 rounded-md bg-input border border-border text-sm flex-1" />
        <button className="px-3 py-1.5 rounded-md bg-secondary text-sm">เพิ่ม</button>
      </form>

      {open && (
        <form onSubmit={add} className="grid md:grid-cols-5 gap-3 p-4 mb-6 rounded-xl border border-border bg-card">
          <select required value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border">
            <option value="">เลือกนักเรียน</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.student_code} {s.full_name}</option>)}
          </select>
          <select required value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border">
            <option value="">เลือกวิชา</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} {s.name}</option>)}
          </select>
          <input required placeholder="ภาคเรียน" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border" />
          <input required type="number" step="0.01" placeholder="คะแนน" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border" />
          <div className="flex gap-2">
            <input placeholder="เกรด" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="flex-1 px-3 py-2 rounded-md bg-input border border-border" />
            <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground">บันทึก</button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-muted-foreground">
            <tr><th className="text-left px-4 py-3">นักเรียน</th><th className="text-left px-4 py-3">วิชา</th><th className="text-left px-4 py-3">ภาคเรียน</th><th className="text-left px-4 py-3">คะแนน</th><th className="text-left px-4 py-3">เกรด</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3">{r.students?.full_name}</td>
                <td className="px-4 py-3">{r.subjects?.name}</td>
                <td className="px-4 py-3">{r.term}</td>
                <td className="px-4 py-3 font-mono">{r.score}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-primary/15 text-primary">{r.grade ?? "-"}</span></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">ยังไม่มีข้อมูล</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
