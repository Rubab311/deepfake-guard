import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Eye, EyeOff, LogIn } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // ── Frontend-only placeholder ─────────────────────────────────────────
    // In a full-stack implementation, POST to /api/auth/login here.
    // For now, just show a notice.
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("Authentication backend not yet connected. This is a UI preview.");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-bold text-2xl mb-2">
            <Shield className="text-brand-400" size={28} />
            DeepFake<span className="text-brand-400">Guard</span>
          </div>
          <h1 className="text-xl font-semibold mt-2">Sign in to your account</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="label">Password</label>
                <a href="#" className="text-xs text-brand-400 hover:text-brand-300">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-warn-400 bg-warn-500/10 border border-warn-500/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full justify-center py-3.5 mt-2">
              <LogIn size={18} /> Sign In
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{" "}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
