import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, CalendarClock, ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "ภาพรวม — EduCore" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [stats, setStats] = useState({ students: 0, subjects: 0, exams: 0, attendanceToday: 0 });

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [s, sub, ex, at] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("subjects").select("*", { count: "exact", head: true }),
        supabase.from("exams").select("*", { count: "exact", head: true }),
        supabase.from("attendance").select("*", { count: "exact", head: true }).eq("date", today),
      ]);
      setStats({ students: s.count ?? 0, subjects: sub.count ?? 0, exams: ex.count ?? 0, attendanceToday: at.count ?? 0 });
    })();
  }, []);

  const cards = [
    { label: "นักเรียนทั้งหมด", value: stats.students, icon: Users },
    { label: "วิชา", value: stats.subjects, icon: BookOpen },
    { label: "ตารางสอบ", value: stats.exams, icon: CalendarClock },
    { label: "เช็คชื่อวันนี้", value: stats.attendanceToday, icon: ClipboardCheck },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">ภาพรวมระบบ</h1>
      <p className="text-muted-foreground mb-8">สรุปข้อมูลล่าสุดของโรงเรียน</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="p-6 rounded-xl border border-border" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
            <c.icon className="h-6 w-6 text-primary mb-3" />
            <div className="text-3xl font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
