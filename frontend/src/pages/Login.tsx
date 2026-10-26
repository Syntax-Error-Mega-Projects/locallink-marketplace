import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Eye, EyeOff } from "lucide-react";

const DEMO_LOGINS = [
  { label: "Customer", email: "customer@demo.com" },
  { label: "Worker", email: "worker@demo.com" },
  { label: "Supplier", email: "supplier@demo.com" },
  { label: "Admin", email: "admin@demo.com" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/categories");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally { setLoading(false); }
  };

  const fillDemo = (demoEmail: string) => { setEmail(demoEmail); setPassword("demo1234"); };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 gradient-btn rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your LocalLink account</p>
        </div>

        {/* Demo quick-fill */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-900 p-4">
          <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Demo logins (password: demo1234)</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_LOGINS.map(d => (
              <button key={d.email} onClick={() => fillDemo(d.email)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-orange-500/20 text-slate-300 hover:text-orange-300 border border-slate-700 hover:border-orange-500/30 transition-colors">
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-card space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Input id="login-password" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-center text-sm text-slate-400">
            No account?{" "}
            <Link to="/register" className="text-orange-400 hover:text-orange-300">Sign up free</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
