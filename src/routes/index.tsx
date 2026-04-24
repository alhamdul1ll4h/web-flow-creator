import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Database, Workflow, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EduCore — ระบบจัดการโรงเรียนดิจิทัล" },
      { name: "description", content: "ระบบจัดการข้อมูลนักเรียน คะแนน ตารางสอบ และออกเอกสาร ปพ.1 อัตโนมัติด้วย n8n" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold">EduCore</span>
          </div>
          <Link to="/login" className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition">
            เข้าสู่ระบบ
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-block px-3 py-1 rounded-full text-xs bg-primary/15 text-primary mb-6">
          การเปลี่ยนผ่านสู่ระบบดิจิทัล
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
          ระบบจัดการโรงเรียนยุคใหม่
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          จัดการข้อมูลนักเรียน คะแนน ตารางสอบ บันทึกเวลาเข้าเรียน และออกเอกสาร ปพ.1 อัตโนมัติผ่าน n8n บน Web 100%
        </p>
        <Link to="/login" className="inline-block px-6 py-3 rounded-lg font-medium text-primary-foreground hover:opacity-90 transition" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
          เริ่มใช้งาน
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
        {[
          { icon: Database, title: "ข้อมูลรวมศูนย์", desc: "นักเรียน คะแนน ตารางสอบ ในที่เดียว ค้นหารวดเร็ว" },
          { icon: Workflow, title: "ออก ปพ.1 อัตโนมัติ", desc: "ส่งคำขอไปยัง n8n workflow เพื่อสร้างเอกสาร PDF" },
          { icon: ShieldCheck, title: "ปลอดภัย", desc: "ระบบสิทธิ์ครู/ผู้ดูแล พร้อมการเข้ารหัสมาตรฐาน" },
        ].map((f) => (
          <div key={f.title} className="p-6 rounded-xl border border-border" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
            <f.icon className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
