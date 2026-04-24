import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/attendance")({
  head: () => ({ meta: [{ title: "เวลาเข้าเรียน — EduCore" }] }),
  component: AttendancePage,
});

type Student = { id: string; student_code: string; full_name: string; class_level: string };
type Status = "present" | "absent" | "late" | "leave";

const statusLabel: Record<Status, string> = { present: "มา", absent: "ขาด", late: "สาย", leave: "ลา" };
const statusColor: Record<Status, string> = {
  present: "bg-emerald-500/20 text-emerald-400",
  absent: "bg-red-500/20 text-red-400",
  late: "bg-amber-500/20 text-amber-400",
  leave: "bg-blue-500/20 text-blue-400",
};

function AttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<string, Status>>({});

  async function load() {
    const { data: ss } = await supabase.from("students").select("id, student_code, full_name, class_level").order("student_code");
    setStudents(ss ?? []);
    const { data: at } = await supabase.from("attendance").select("student_id, status").eq("date", date);
    const m: Record<string, Status> = {};
    (at ?? []).forEach((a: { student_id: string; status: Status }) => (m[a.student_id] = a.status));
    setMarks(m);
  }
  useEffect(() => { load(); }, [date]);

  async function mark(student_id: string, status: Status) {
    setMarks({ ...marks, [student_id]: status });
    await supabase.from("attendance").upsert(
      { student_id, date, status, check_in_time: status === "present" || status === "late" ? new Date().toISOString() : null },
      { onConflict: "student_id,date" }
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">บันทึกเวลาเข้าเรียน</h1>
          <p className="text-muted-foreground">เช็คชื่อนักเรียนรายวัน</p>
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 rounded-md bg-input border border-border" />
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-muted-foreground">
            <tr><th className="text-left px-4 py-3">รหัส</th><th className="text-left px-4 py-3">ชื่อ-นามสกุล</th><th className="text-left px-4 py-3">ชั้น</th><th className="text-left px-4 py-3">สถานะ</th></tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const cur = marks[s.id];
              return (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono">{s.student_code}</td>
                  <td className="px-4 py-3">{s.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.class_level}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {(Object.keys(statusLabel) as Status[]).map((st) => (
                        <button key={st} onClick={() => mark(s.id, st)} className={`px-3 py-1 rounded text-xs font-medium transition ${cur === st ? statusColor[st] + " ring-1 ring-current" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                          {statusLabel[st]}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
            {students.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">ยังไม่มีนักเรียน</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
