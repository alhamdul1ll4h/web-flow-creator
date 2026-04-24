import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "เข้าสู่ระบบ — EduCore" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: fullName } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">EduCore</span>
        </Link>
        <div className="rounded-2xl border border-border p-8" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
          <h1 className="text-2xl font-bold mb-1">{mode === "signin" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</h1>
          <p className="text-sm text-muted-foreground mb-6">สำหรับครูและผู้ดูแลระบบ</p>
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm mb-1">ชื่อ-นามสกุล</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full px-3 py-2 rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            )}
            <div>
              <label className="block text-sm mb-1">อีเมล</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm mb-1">รหัสผ่าน</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2 rounded-md bg-input border border-border focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-md font-medium text-primary-foreground disabled:opacity-50 transition hover:opacity-90" style={{ background: "var(--gradient-primary)" }}>
              {loading ? "กำลังดำเนินการ..." : mode === "signin" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>
          </form>
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }} className="mt-4 text-sm text-muted-foreground hover:text-foreground w-full text-center">
            {mode === "signin" ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
          </button>
        </div>
      </div>
    </div>
  );
}
