import React from "react";
import { Link } from "react-router-dom";
import { Shield, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 font-bold text-lg mb-3">
            <Shield className="text-brand-400" size={22} />
            <span>DeepFake<span className="text-brand-400">Guard</span></span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            AI-powered deepfake detection. Protecting trust in digital media.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Navigate</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            {["/","analyze","cyber-laws","help","about","faq"].map((p) => (
              <li key={p}>
                <Link to={`/${p === "/" ? "" : p}`} className="hover:text-white transition-colors capitalize">
                  {p === "/" ? "Home" : p === "cyber-laws" ? "Cyber Laws" : p}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Connect</h4>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
               className="text-gray-400 hover:text-white transition-colors">
              <Github size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
               className="text-gray-400 hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-600">
        © {new Date().getFullYear()} DeepFake Guard. For research and awareness purposes.
      </div>
    </footer>
  );
}
