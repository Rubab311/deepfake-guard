import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Shield, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/",           label: "Home"       },
  { to: "/analyze",    label: "Analyze"    },
  { to: "/cyber-laws", label: "Cyber Laws" },
  { to: "/help",       label: "Help"       },
  { to: "/about",      label: "About"      },
  { to: "/faq",        label: "FAQ"        },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <Shield className="text-brand-400" size={26} />
          <span>DeepFake<span className="text-brand-400">Guard</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-600/20 text-brand-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login"  className="btn-outline text-sm py-2 px-4">Login</Link>
          <Link to="/signup" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-1 border-t border-gray-800 bg-gray-950">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-600/20 text-brand-400" : "text-gray-300 hover:bg-gray-800"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="flex gap-3 pt-2">
            <Link to="/login"  onClick={() => setOpen(false)} className="btn-outline text-sm py-2 flex-1 justify-center">Login</Link>
            <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary text-sm py-2 flex-1 justify-center">Sign Up</Link>
          </div>
        </div>
      )}
    </header>
  );
}
