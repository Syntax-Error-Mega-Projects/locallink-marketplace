import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MapPin, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const dashLink = () => {
    if (!user) return null;
    if (user.role === "worker") return <Link to="/worker" className="text-slate-300 hover:text-orange-400 transition-colors">Dashboard</Link>;
    if (user.role === "supplier") return <Link to="/supplier" className="text-slate-300 hover:text-orange-400 transition-colors">My Prices</Link>;
    if (user.role === "admin") return <Link to="/admin" className="text-slate-300 hover:text-orange-400 transition-colors">Admin</Link>;
    return <Link to="/categories" className="text-slate-300 hover:text-orange-400 transition-colors">Book a Service</Link>;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold gradient-text">LocalLink</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/categories" className="text-slate-300 hover:text-orange-400 transition-colors text-sm">Services</Link>
            <Link to="/labour" className="text-slate-300 hover:text-orange-400 transition-colors text-sm">Labour</Link>
            <Link to="/suppliers/map" className="text-slate-300 hover:text-orange-400 transition-colors text-sm">Suppliers</Link>
            {dashLink()}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">{user.name}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Login</Button>
                <Button size="sm" onClick={() => navigate("/register")}>Sign Up</Button>
              </div>
            )}
          </div>
          <button className="md:hidden text-slate-300" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden py-4 border-t border-slate-800 flex flex-col gap-3">
            <Link to="/categories" className="text-slate-300 text-sm py-1" onClick={() => setOpen(false)}>Services</Link>
            <Link to="/labour" className="text-slate-300 text-sm py-1" onClick={() => setOpen(false)}>Labour</Link>
            <Link to="/suppliers/map" className="text-slate-300 text-sm py-1" onClick={() => setOpen(false)}>Suppliers</Link>
            {user ? (
              <>
                <span className="text-xs text-slate-500">{user.name} ({user.role})</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => { navigate("/login"); setOpen(false); }}>Login</Button>
                <Button size="sm" onClick={() => { navigate("/register"); setOpen(false); }}>Sign Up</Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
