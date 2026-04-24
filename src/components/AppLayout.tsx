import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth, signOut } from "@/lib/auth";
import { useEffect } from "react";
import { GraduationCap, Users, BookOpen, CalendarClock, ClipboardCheck, FileText, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "ภาพรวม", icon: LayoutDashboard },
  { to: "/students", label: "นักเรียน", icon: Users },
  { to: "/grades", label: "ผลการเรียน", icon: BookOpen },
  { to: "/exams", label: "ตารางสอบ", icon: CalendarClock },
  { to: "/attendance", label: "เวลาเข้าเรียน", icon: ClipboardCheck },
  { to: "/transcripts", label: "ปพ.1 (n8n)", icon: FileText },
];

export function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">กำลังโหลด...</div>;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur p-4 flex flex-col">
        <div className="flex items-center gap-2 px-2 py-3 mb-4">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold leading-tight">EduCore</div>
            <div className="text-xs text-muted-foreground">ระบบจัดการโรงเรียน</div>
          </div>
        </div>
        <nav className="space-y-1 flex-1">
          {nav.map((n) => {
            const active = location.pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border pt-3 mt-3">
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</div>
          <button onClick={signOut} className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
            <LogOut className="h-4 w-4" /> ออกจากระบบ
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
