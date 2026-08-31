"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n";

const GROUPS = [
  {
    title: "Learn",
    links: [
      { href: "/", key: "dashboard" },
      { href: "/syllabus", key: "hub" },
      { href: "/roadmap", key: "path" },
      { href: "/quiz", key: "practice" },
      { href: "/revision", key: "revision" },
    ],
  },
  {
    title: "Grow",
    links: [
      { href: "/twin", key: "twin" },
      { href: "/intelligence", key: "gaps" },
      { href: "/impact", key: "progress" },
      { href: "/profile", key: "profile" },
    ],
  },
  {
    title: "AI & tools",
    links: [
      { href: "/assistant", key: "coach" },
      { href: "/assessment", key: "assessment" },
      { href: "/simulator", key: "simulator" },
      { href: "/detective", key: "detective" },
      { href: "/graph", key: "graph" },
    ],
  },
  {
    title: "Scale & governance",
    links: [
      { href: "/admin", key: "admin" },
      { href: "/igot", key: "igot" },
      { href: "/architecture", key: "architecture" },
    ],
  },
  {
    title: "SIH innovation lab",
    links: [
      { href: "/judge", key: "judge" },
      { href: "/loop", key: "trace" },
      { href: "/india", key: "india" },
      { href: "/future", key: "future" },
      { href: "/faq", key: "faq" },
    ],
  },
];

const FALLBACK: Record<string, string> = {
  dashboard: "Dashboard",
  hub: "Learning hub",
  path: "Learning path",
  practice: "Practice arena",
  profile: "My learning profile",
  gaps: "Skill gap center",
  progress: "My progress",
  coach: "AI coach",
  trace: "AI decision trace",
  twin: "Digital Twin",
  loop: "Closed loop",
  impact: "What changed",
  assessment: "Assessment",
  quiz: "Quiz",
  simulator: "Simulator",
  detective: "Data detective",
  india: "Why India",
  admin: "Organisation",
  graph: "Knowledge graph",
  architecture: "Architecture",
  future: "Future",
  judge: "Judge mode",
  faq: "Judge FAQ",
  igot: "iGOT layer",
};

export function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div>
      <div className="h-1.5 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />
      <div className="flex min-h-screen">
        {menuOpen ? <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-[#102033]/35 md:hidden" onClick={() => setMenuOpen(false)} /> : null}
        <aside className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col overflow-y-auto bg-[#0c2744] p-4 text-[#e8eef5] shadow-xl transition-transform md:sticky md:z-0 md:translate-x-0 md:shadow-none ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e07a2f] font-serif text-lg text-white">स</div>
            <div>
              <div className="text-sm font-semibold leading-tight">STAT KARMAYOGI AI</div>
              <div className="text-[11px] text-white/55">Competency intelligence</div>
            </div>
          </div>
          {GROUPS.map((group) => (
            <div key={group.title} className="mb-4">
              <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">{group.title}</div>
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-3 py-1.5 text-sm hover:bg-white/10 ${path === link.href ? "bg-white/15" : ""}`}
                >
                  {t(link.key) === link.key ? FALLBACK[link.key] : t(link.key)}
                </Link>
              ))}
            </div>
          ))}
          <p className="mt-auto pt-4 text-[11px] leading-relaxed text-white/45">
            Don&apos;t just train the workforce. Measure, personalise and improve its competency.
          </p>
        </aside>
        <div className="flex-1">
          <header className="flex items-center justify-between border-b border-[#d9d0c0] px-4 py-4 md:px-8">
            <div>
              <div className="text-xs font-semibold tracking-wide text-[#c45c14]">MoSPI · NSO · NSSTA · Mission Karmayogi</div>
              <div className="text-sm text-[#3d4f63]">AI-Powered Competency Intelligence & Capacity-Building Platform</div>
            </div>
            <div className="flex items-center gap-4 text-right text-sm">
              <button type="button" aria-label="Open navigation" className="rounded-lg border border-[#d9d0c0] px-2 py-1 text-lg md:hidden" onClick={() => setMenuOpen(true)}>☰</button>
              <LanguageSwitcher />
              <div>
                <div className="font-semibold text-[#102033]">Demo session</div>
                <div className="text-[#3d4f63]">Browser-local evidence</div>
              </div>
            </div>
          </header>
          <main className="px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
