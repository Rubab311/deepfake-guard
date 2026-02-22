import React, { useState } from "react";
import { Scale, AlertTriangle, FileText, ExternalLink, ChevronDown, Globe, BookOpen, Gavel, Shield } from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const LAWS = [
  {
    country: "🇵🇰 Pakistan",
    law: "Prevention of Electronic Crimes Act (PECA) 2016",
    sections: [
      {
        id: "Section 21",
        title: "Cyber Harassment",
        desc: "Any person who with intent to harm a person, publishes or transmits any information through an information system is punishable.",
        penalty: "Up to 3 years imprisonment and/or Rs. 1 million fine",
      },
      {
        id: "Section 22",
        title: "Cyberstalking",
        desc: "Monitoring, tracking, following or contacting a person without their consent through any information system.",
        penalty: "Up to 3 years imprisonment and/or Rs. 1 million fine",
      },
      {
        id: "Section 24",
        title: "Unauthorized Access to Information System",
        desc: "Accessing or causing access to any information system without authorization with the intent to harm a person.",
        penalty: "Up to 3 months imprisonment and/or Rs. 50,000 fine",
      },
    ],
    report_url: "https://www.fia.gov.pk/en/complain.html",
    report_label: "Report to FIA Cyber Crime Wing",
  },
  {
    country: "🇺🇸 United States",
    law: "Various Federal & State Laws",
    sections: [
      {
        id: "18 U.S.C. § 2261A",
        title: "Cyberstalking / Harassment",
        desc: "Federal law criminalizing cyberstalking and online harassment that causes substantial emotional distress.",
        penalty: "Up to 5 years federal imprisonment",
      },
      {
        id: "NCVICA",
        title: "Non-Consensual Intimate Image (NCII) Laws",
        desc: "Most US states have laws specifically criminalizing the sharing of intimate images without consent, including AI-generated deepfakes.",
        penalty: "Varies by state — typically 1–5 years imprisonment",
      },
      {
        id: "DEEPFAKES Act",
        title: "DEEPFAKES Accountability Act (proposed)",
        desc: "Proposed federal legislation requiring disclosure labels on AI-generated media and criminalizing malicious deepfakes.",
        penalty: "Pending congressional approval",
      },
    ],
    report_url: "https://www.ic3.gov",
    report_label: "Report to FBI Internet Crime Complaint Center (IC3)",
  },
  {
    country: "🇬🇧 United Kingdom",
    law: "Online Safety Act 2023 & Malicious Communications Act",
    sections: [
      {
        id: "Online Safety Act 2023",
        title: "Sharing Intimate Images Without Consent",
        desc: "The UK Online Safety Act 2023 made sharing intimate deepfakes without consent a specific criminal offence for the first time.",
        penalty: "Up to 2 years imprisonment",
      },
      {
        id: "Malicious Communications Act 1988",
        title: "Sending Menacing / Grossly Offensive Messages",
        desc: "Covers online harassment, threats, and distressing content sent via electronic communications.",
        penalty: "Up to 2 years imprisonment",
      },
    ],
    report_url: "https://www.report-it.org.uk",
    report_label: "Report via Report Harmful Content (UK)",
  },
  {
    country: "🇮🇳 India",
    law: "IT Act 2000 & IPC",
    sections: [
      {
        id: "Section 66E IT Act",
        title: "Violation of Privacy",
        desc: "Intentionally capturing, publishing or transmitting images of a person's private area without consent.",
        penalty: "Up to 3 years imprisonment and/or Rs. 2 lakh fine",
      },
      {
        id: "Section 67A IT Act",
        title: "Publishing Obscene Material",
        desc: "Publishing or transmitting sexually explicit material in electronic form including deepfake pornography.",
        penalty: "Up to 7 years imprisonment and fine",
      },
      {
        id: "Section 354D IPC",
        title: "Stalking (including Cyber Stalking)",
        desc: "Monitoring a woman's use of the internet, email or any other form of electronic communication.",
        penalty: "Up to 3–5 years imprisonment",
      },
    ],
    report_url: "https://cybercrime.gov.in",
    report_label: "Report to National Cyber Crime Reporting Portal",
  },
  {
    country: "🇪🇺 European Union",
    law: "GDPR & Directive on Combating Violence Against Women",
    sections: [
      {
        id: "GDPR Art. 9",
        title: "Special Category Data / Biometrics",
        desc: "Processing facial biometric data to manipulate or create images without consent violates GDPR fundamental rights protections.",
        penalty: "Up to €20 million or 4% of global annual turnover",
      },
      {
        id: "EU AI Act 2024",
        title: "Prohibited AI Practices",
        desc: "The EU AI Act explicitly prohibits AI systems that deploy subliminal manipulation and non-consensual deepfake generation.",
        penalty: "Up to €35 million or 7% of global turnover",
      },
    ],
    report_url: "https://edpb.europa.eu/about-edpb/about-edpb/members_en",
    report_label: "Report to EU Data Protection Board",
  },
];

const ARTICLES = [
  {
    title: "What is Image-Based Abuse?",
    icon: BookOpen,
    body: `Image-based abuse (IBA) refers to the taking, making, or sharing of intimate or personal images 
    without consent. With the rise of deepfake AI technology, perpetrators can now create hyper-realistic 
    fake images or videos placing a real person's face on someone else's body. This is a form of 
    technology-facilitated abuse and is illegal in most jurisdictions. Victims often experience 
    severe psychological harm, damaged reputations, and professional consequences.`,
  },
  {
    title: "Deepfakes as Cyber Bullying",
    icon: AlertTriangle,
    body: `Deepfake technology is increasingly weaponized for cyber bullying — particularly targeting 
    women, minors, journalists, and public figures. Common misuse patterns include: creating 
    non-consensual intimate images (NCII), superimposing a victim's face onto violent content, 
    impersonating someone to damage their reputation, and using fake media to coerce or extort. 
    Research by Sensity AI found that 96% of deepfake videos online are non-consensual pornographic 
    content, with women disproportionately targeted.`,
  },
  {
    title: "Your Digital Rights",
    icon: Shield,
    body: `You have the right to control how your face and likeness is used online. Key rights include: 
    the right to request removal of harmful content from platforms, the right to file a criminal 
    complaint, the right to civil damages from perpetrators, and in many countries the right to 
    anonymity when reporting. Most social media platforms have dedicated channels for reporting 
    non-consensual intimate images — use them and escalate to law enforcement if the platform 
    does not act within 24–48 hours.`,
  },
  {
    title: "Evidence Preservation",
    icon: FileText,
    body: `Before reporting, preserve evidence carefully. Take timestamped screenshots of all content, 
    URLs, usernames, and messages. Do not delete communications from the perpetrator — these are 
    evidence. Use your browser's "Save as" or a tool like archive.org to capture web pages. Note 
    dates and times of incidents. Store evidence in a secure location separate from the device used 
    to discover it. Most law enforcement agencies now accept digital evidence in cyber crime cases.`,
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function LawCard({ data }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 text-left"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-0.5">Jurisdiction</p>
          <h3 className="font-bold text-white">{data.country}</h3>
          <p className="text-sm text-gray-400 mt-0.5">{data.law}</p>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-gray-800 space-y-4">
          {data.sections.map((s) => (
            <div key={s.id} className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-mono text-brand-400 bg-brand-600/10 px-2 py-0.5 rounded">{s.id}</span>
              </div>
              <h4 className="font-semibold text-white mb-1">{s.title}</h4>
              <p className="text-sm text-gray-400 leading-relaxed mb-2">{s.desc}</p>
              <div className="flex items-center gap-1.5 text-xs text-danger-400">
                <Gavel size={12} />
                <span className="font-medium">Penalty:</span> {s.penalty}
              </div>
            </div>
          ))}

          <a
            href={data.report_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full justify-center text-sm py-3"
          >
            {data.report_label} <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
}

function ArticleCard({ title, icon: Icon, body }) {
  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center shrink-0">
          <Icon size={20} className="text-brand-400" />
        </div>
        <div>
          <h3 className="font-bold mb-2">{title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CyberLaws() {
  const [activeTab, setActiveTab] = useState("laws");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4
                        bg-danger-500/20 border border-danger-500/30 rounded-full text-danger-400 text-sm font-medium">
          <Scale size={14} /> Legal Protection
        </div>
        <h1 className="text-3xl font-extrabold mb-3">Cyber Laws & Your Rights</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Misuse of deepfake technology is a criminal offence. Know the laws that protect you,
          how to document abuse, and where to report it.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 bg-gray-900 border border-gray-800 rounded-2xl p-1.5 mb-8">
        {[
          { key: "laws",     label: "Laws by Country",  icon: Scale     },
          { key: "articles", label: "Know Your Rights",  icon: BookOpen  },
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

      {/* Laws tab */}
      {activeTab === "laws" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 mb-2">
            Click any jurisdiction to expand applicable laws, penalties, and direct complaint links.
          </p>
          {LAWS.map((law) => <LawCard key={law.country} data={law} />)}
        </div>
      )}

      {/* Articles tab */}
      {activeTab === "articles" && (
        <div className="space-y-4">
          {ARTICLES.map((a) => <ArticleCard key={a.title} {...a} />)}
        </div>
      )}

      {/* Emergency banner */}
      <div className="mt-10 card border-danger-500/30 bg-danger-500/10">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-danger-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-danger-400 mb-1">Immediate Threat?</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              If you are being threatened, extorted, or are in immediate danger — contact your local emergency
              services first. Cyber crime units operate 24/7 in most countries.
              Visit the <a href="/help" className="text-brand-400 underline font-medium">Help & Support</a> page
              for crisis hotlines and step-by-step guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
