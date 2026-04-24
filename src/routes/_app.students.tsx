import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_app/students")({
  head: () => ({ meta: [{ title: "นักเรียน — EduCore" }] }),
  component: StudentsPage,
});

type Student = { id: string; student_code: string; full_name: string; class_level: string; room: string | null };

function StudentsPage() {
  const [list, setList] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ student_code: "", full_name: "", class_level: "", room: "" });

  async function load() {
    const { data } = await supabase.from("students").select("*").order("created_at", { ascending: false });
    setList((data as Student[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("students").insert(form);
    setForm({ student_code: "", full_name: "", class_level: "", room: "" });
    setOpen(false);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">นักเรียน</h1>
          <p className="text-muted-foreground">จัดการข้อมูลนักเรียนทั้งหมด</p>
        </div>
        <button onClick={() => setOpen(!open)} className="px-4 py-2 rounded-md font-medium text-primary-foreground inline-flex items-center gap-2" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4" /> เพิ่มนักเรียน
        </button>
      </div>

      {open && (
        <form onSubmit={add} className="grid md:grid-cols-4 gap-3 p-4 mb-6 rounded-xl border border-border bg-card">
          <input required placeholder="รหัสนักเรียน" value={form.student_code} onChange={(e) => setForm({ ...form, student_code: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border" />
          <input required placeholder="ชื่อ-นามสกุล" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border" />
          <input required placeholder="ระดับชั้น เช่น ม.3" value={form.class_level} onChange={(e) => setForm({ ...form, class_level: e.target.value })} className="px-3 py-2 rounded-md bg-input border border-border" />
          <div className="flex gap-2">
            <input placeholder="ห้อง" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="flex-1 px-3 py-2 rounded-md bg-input border border-border" />
            <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground">บันทึก</button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">รหัส</th>
              <th className="text-left px-4 py-3">ชื่อ-นามสกุล</th>
              <th className="text-left px-4 py-3">ระดับชั้น</th>
              <th className="text-left px-4 py-3">ห้อง</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono">{s.student_code}</td>
                <td className="px-4 py-3">{s.full_name}</td>
                <td className="px-4 py-3">{s.class_level}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.room ?? "-"}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">ยังไม่มีข้อมูลนักเรียน</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
