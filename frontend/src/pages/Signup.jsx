import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Eye, EyeOff, UserPlus, Check } from "lucide-react";

const REQUIREMENTS = [
  { test: (p) => p.length >= 8,        label: "At least 8 characters"        },
  { test: (p) => /[A-Z]/.test(p),      label: "One uppercase letter"         },
  { test: (p) => /[0-9]/.test(p),      label: "One number"                   },
];

export default function Signup() {
  const [form, setForm]       = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields."); return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match."); return;
    }
    const failing = REQUIREMENTS.filter((r) => !r.test(form.password));
    if (failing.length) {
      setError(`Password must: ${failing.map((r) => r.label.toLowerCase()).join(", ")}.`); return;
    }
    // ── Frontend-only placeholder ─────────────────────────────────────────
    setError("Registration backend not yet connected. This is a UI preview.");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-bold text-2xl mb-2">
            <Shield className="text-brand-400" size={28} />
            DeepFake<span className="text-brand-400">Guard</span>
          </div>
          <h1 className="text-xl font-semibold mt-2">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start detecting deepfakes today</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input name="name" type="text" autoComplete="name" value={form.name}
                     onChange={handleChange} className="input" placeholder="Jane Doe" />
            </div>

            <div>
              <label className="label">Email</label>
              <input name="email" type="email" autoComplete="email" value={form.email}
                     onChange={handleChange} className="input" placeholder="you@example.com" />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="input pr-10"
                  placeholder="Create a strong password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Live requirements */}
              {form.password && (
                <ul className="mt-2 space-y-1">
                  {REQUIREMENTS.map(({ test, label }) => {
                    const ok = test(form.password);
                    return (
                      <li key={label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-safe-400" : "text-gray-500"}`}>
                        <Check size={11} className={ok ? "opacity-100" : "opacity-30"} />
                        {label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                name="confirm"
                type={showPwd ? "text" : "password"}
                value={form.confirm}
                onChange={handleChange}
                className="input"
                placeholder="Repeat your password"
              />
            </div>

            {error && (
              <p className="text-sm text-warn-400 bg-warn-500/10 border border-warn-500/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full justify-center py-3.5 mt-2">
              <UserPlus size={18} /> Create Account
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
