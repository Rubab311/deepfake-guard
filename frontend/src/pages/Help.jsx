import React, { useState } from "react";
import {
  HeartHandshake, PhoneCall, Globe, ChevronRight, CheckCircle2,
  Camera, Download, MessageSquareWarning, UserCheck, ShieldAlert,
  ExternalLink, Laptop, AlertCircle,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    icon: Camera,
    title: "Document Everything",
    color: "text-brand-400",
    bg: "bg-brand-600/20",
    tips: [
      "Take timestamped screenshots of all harmful content",
      "Record the full URL / page address",
      "Note the username, profile link, and date of each post",
      "Save any threatening messages — do not delete them",
      "Use archive.ph or web.archive.org to freeze page snapshots",
    ],
  },
  {
    num: "02",
    icon: MessageSquareWarning,
    title: "Report to the Platform",
    color: "text-warn-400",
    bg: "bg-warn-500/20",
    tips: [
      'Use the platform\'s built-in "Report" button on the content',
      "Select the most specific category (e.g. 'Non-consensual intimate image')",
      "Most platforms respond within 24–48 hours for urgent cases",
      "If ignored, escalate to their Trust & Safety team via email",
      "Note the platform's report reference number for future use",
    ],
  },
  {
    num: "03",
    icon: ShieldAlert,
    title: "File a Cyber Crime Complaint",
    color: "text-danger-400",
    bg: "bg-danger-500/20",
    tips: [
      "In Pakistan: Visit fia.gov.pk or call 9911 (FIA Cyber Crime Wing)",
      "In India: Visit cybercrime.gov.in or call 1930",
      "In the UK: Report to Action Fraud at actionfraud.police.uk",
      "In the US: File with IC3 at ic3.gov and local police",
      "Bring all screenshots and evidence to your first report",
    ],
  },
  {
    num: "04",
    icon: UserCheck,
    title: "Seek Legal Advice",
    color: "text-safe-400",
    bg: "bg-safe-500/20",
    tips: [
      "Many NGOs offer free legal aid for cyber abuse victims",
      "A lawyer can file for an injunction to remove content faster",
      "Civil suits can result in financial compensation",
      "Keep all communication with the perpetrator as evidence",
      "Legal aid organizations often prioritize minors and women",
    ],
  },
  {
    num: "05",
    icon: HeartHandshake,
    title: "Get Emotional Support",
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    tips: [
      "Talk to a trusted person — you are not alone and not at fault",
      "Contact a mental health helpline (see resources below)",
      "Organizations like the Cyber Civil Rights Initiative offer peer support",
      "Consider counseling — many organizations provide it free of charge",
      "Limit social media exposure while the case is being resolved",
    ],
  },
];

const RESOURCES = [
  {
    category: "🇵🇰 Pakistan",
    links: [
      { name: "FIA Cyber Crime Wing",               url: "https://www.fia.gov.pk/en/complain.html",      desc: "Official complaint portal for cyber crimes" },
      { name: "Digital Rights Foundation Helpline",  url: "https://digitalrightsfoundation.pk/cyber-harassment-helpline/", desc: "Free support for online harassment victims" },
      { name: "Helpline: 0800-FIA-FIA (342-342)",    url: "tel:0800342342",                               desc: "FIA 24/7 toll-free helpline" },
    ],
  },
  {
    category: "🌍 International",
    links: [
      { name: "Cyber Civil Rights Initiative",       url: "https://cybercivilrights.org",                 desc: "Crisis helpline + removal guide for image abuse" },
      { name: "StopNCII.org",                        url: "https://stopncii.org",                         desc: "Hash intimate images to prevent sharing across platforms" },
      { name: "CCRI Image Removal Guide",            url: "https://cybercivilrights.org/ccri-crisis-helpline/", desc: "Step-by-step guide to removing non-consensual images" },
      { name: "Without My Consent",                  url: "https://withoutmyconsent.org",                 desc: "Legal resources for online privacy violations" },
      { name: "Take It Down (NCMEC)",                url: "https://takeitdown.ncmec.org",                 desc: "Remove intimate images of minors from the internet" },
    ],
  },
  {
    category: "🇺🇸 United States",
    links: [
      { name: "FBI IC3 – Internet Crime Complaint",  url: "https://www.ic3.gov",                          desc: "File federal cyber crime complaints" },
      { name: "National Domestic Violence Hotline",  url: "https://www.thehotline.org",                   desc: "1-800-799-7233 — includes tech abuse support" },
      { name: "Cyber Harassment Helpline",           url: "https://cybercivilrights.org/ccri-crisis-helpline/", desc: "Confidential crisis support" },
    ],
  },
  {
    category: "🇬🇧 United Kingdom",
    links: [
      { name: "Report Harmful Content",             url: "https://reportharmfulcontent.com",              desc: "Helps remove harmful online content" },
      { name: "Revenge Porn Helpline",              url: "https://revengepornhelpline.org.uk",             desc: "0345 6000 459 — free specialist support" },
      { name: "Cyber Helpline",                     url: "https://www.thecyberhelpline.com",               desc: "Free cyber crime support for individuals & businesses" },
    ],
  },
  {
    category: "🇮🇳 India",
    links: [
      { name: "National Cyber Crime Reporting Portal", url: "https://cybercrime.gov.in",                  desc: "Official government complaint portal" },
      { name: "iCall Helpline",                     url: "https://icallhelpline.org",                     desc: "9152987821 — psychosocial support for cyber victims" },
      { name: "Cyber Peace Foundation",             url: "https://cyberpeace.org",                        desc: "Awareness and legal guidance for cyber abuse" },
    ],
  },
  {
    category: "📱 Platform Reporting",
    links: [
      { name: "Facebook / Instagram NCII",          url: "https://www.facebook.com/help/contact/123543801520017", desc: "Remove non-consensual intimate images" },
      { name: "Google Content Removal",             url: "https://support.google.com/legal/troubleshooter/1114905", desc: "Remove images from Google Search" },
      { name: "Twitter / X Intimate Media",         url: "https://help.twitter.com/en/safety-and-security/intimate-media", desc: "Report intimate content on X/Twitter" },
      { name: "TikTok Safety Center",               url: "https://www.tiktok.com/safety/en/",             desc: "Report harmful content on TikTok" },
      { name: "Reddit Legal Removal",               url: "https://www.reddit.com/report",                  desc: "Report privacy violations on Reddit" },
    ],
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StepCard({ num, icon: Icon, title, color, bg, tips }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
          <Icon size={22} className={color} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-mono text-gray-600">Step {num}</span>
          <h3 className="font-bold text-white">{title}</h3>
        </div>
        <ChevronRight
          size={18}
          className={`text-gray-500 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </div>

      {open && (
        <ul className="mt-4 pt-4 border-t border-gray-800 space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle2 size={15} className={`${color} shrink-0 mt-0.5`} />
              {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ResourceSection({ category, links }) {
  return (
    <div>
      <h3 className="font-semibold text-sm text-gray-400 mb-3 flex items-center gap-2">
        {category}
      </h3>
      <div className="space-y-2">
        {links.map(({ name, url, desc }) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/60 hover:bg-gray-800 border border-gray-800 hover:border-brand-600/40 transition-all group"
          >
            <Globe size={16} className="text-brand-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-white group-hover:text-brand-300 transition-colors">{name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <ExternalLink size={13} className="text-gray-600 shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Help() {
  const [activeTab, setActiveTab] = useState("steps");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4
                        bg-safe-500/20 border border-safe-500/30 rounded-full text-safe-400 text-sm font-medium">
          <HeartHandshake size={14} /> Help & Support
        </div>
        <h1 className="text-3xl font-extrabold mb-3">How to Deal With Deepfake Abuse</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          If you or someone you know is a victim of deepfake misuse or cyber bullying,
          here is exactly what to do — step by step.
        </p>
      </div>

      {/* Emergency card */}
      <div className="card border-danger-500/40 bg-danger-500/10 mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle size={22} className="text-danger-400 shrink-0" />
          <div>
            <p className="font-bold text-danger-400 mb-1">In an Emergency</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              If you are being actively threatened or blackmailed — call your local emergency services immediately.
              In Pakistan call <strong className="text-white">9911 (FIA)</strong> or <strong className="text-white">15 (Police)</strong>.
              Then document everything and follow the steps below.
            </p>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 bg-gray-900 border border-gray-800 rounded-2xl p-1.5 mb-8">
        {[
          { key: "steps",     label: "Step-by-Step Guide",   icon: CheckCircle2 },
          { key: "resources", label: "Help Resources",        icon: PhoneCall    },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${activeTab === key ? "bg-brand-600 text-white shadow" : "text-gray-400 hover:text-white"}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Steps tab */}
      {activeTab === "steps" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-4">
            Click any step to expand the detailed checklist.
          </p>
          {STEPS.map((s) => <StepCard key={s.num} {...s} />)}

          {/* Reminder */}
          <div className="card border-brand-600/20 bg-brand-600/5 mt-6">
            <div className="flex items-start gap-3">
              <Laptop size={20} className="text-brand-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Use DeepFake Guard as Evidence</p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Our analysis report (including verdict score and breakdown) can be used to support your
                  cyber crime complaint. Go to the{" "}
                  <a href="/analyze" className="text-brand-400 underline">Analyze page</a>, run the
                  detection, and take a screenshot of the full results to submit with your report.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resources tab */}
      {activeTab === "resources" && (
        <div className="space-y-8">
          {RESOURCES.map((r) => (
            <ResourceSection key={r.category} {...r} />
          ))}

          <div className="card border-warn-500/20 bg-warn-500/10 text-center mt-4">
            <p className="text-sm text-gray-400">
              <span className="text-warn-400 font-semibold">Remember:</span>{" "}
              Being a victim of deepfake abuse is <strong className="text-white">never your fault</strong>.
              Support exists, laws are on your side, and you are not alone.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
