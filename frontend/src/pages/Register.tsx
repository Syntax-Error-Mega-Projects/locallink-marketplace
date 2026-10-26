import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

const ROLES = [
  { value: "customer", label: "Customer", desc: "Book services" },
  { value: "worker", label: "Worker / Professional", desc: "Accept jobs" },
  { value: "supplier", label: "Supplier", desc: "Sell parts & materials" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/categories");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 gradient-btn rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Join LocalLink today</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">I am a...</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => setForm({...form, role: r.value})}
                  className={`rounded-xl border p-3 text-left transition-all ${form.role === r.value ? "border-orange-500 bg-orange-500/10 text-orange-300" : "border-slate-700 text-slate-400 hover:border-slate-600"}`}>
                  <p className="text-xs font-semibold">{r.label}</p>
                  <p className="text-xs opacity-70">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
            <Input id="reg-name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Amit Sharma" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
            <Input id="reg-phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="9876543210" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <Input id="reg-email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="amit@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <Input id="reg-password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="min. 8 characters" required />
          </div>
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-orange-400 hover:text-orange-300">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
