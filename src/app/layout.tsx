import type { Metadata } from "next";
import { Roboto_Slab, Inter, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import HeaderAuth from "@/components/HeaderAuth";
import HealthcareChatbot from "@/components/HealthcareChatbot";

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Care India — AI Healthcare Affordability & Claims Navigator",
  description: "Real-time AI hospital bill auditor, government scheme eligibility engine, and insurance claim readiness auditor for India.",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" }
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

const HEALTHCARE_NEWS = [
  { tag: "BREAKING", text: "Ayushman Bharat PM-JAY: ₹5 Lakh annual health cover officially expanded to all senior citizens aged 70+ regardless of income." },
  { tag: "REGULATORY", text: "IRDAI Master Directive: All health insurers mandated to decide cashless claim pre-authorizations within 60 minutes." },
  { tag: "SAVINGS", text: "Pradhan Mantri Jan Aushadhi Kendras surpass 2,040 generic formulations — reducing patient medicine bills by 50% to 85%." },
  { tag: "BENCHMARKS", text: "NPPA updates price ceilings on 850+ essential drugs and cardiac stent implants across Indian hospitals." },
  { tag: "DIGITAL HEALTH", text: "National Health Authority rolls out 100% digital OPD claims settlement via Ayushman Bharat Digital Mission (ABDM)." },
  { tag: "POLICY UPDATE", text: "MJPJAY Maharashtra & CMCHIS Tamil Nadu universal health assurance packages cover over 1,350 secondary & tertiary surgical packages." }
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${robotoSlab.variable} ${inter.variable} ${ibmPlexMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#060913] text-[#F8FAFC] font-sans selection:bg-[#00F2FE]/30 selection:text-[#00F2FE]">
        {/* Top Moving Healthcare News Marquee Bar */}
        <div className="w-full bg-[#0B132B]/90 border-b border-cyan-500/20 py-2 px-3 overflow-hidden select-none z-50 backdrop-blur-md">
          <div className="flex items-center gap-3 max-w-7xl mx-auto text-xs">
            {/* Live Indicator Chip */}
            <div className="flex items-center gap-1.5 shrink-0 bg-red-500/10 border border-red-500/30 text-red-400 px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(239,68,68,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
              <span>LIVE HEALTH NEWS</span>
            </div>

            {/* Marquee Content with Edge Masking */}
            <div className="overflow-hidden relative w-full flex-1 marquee-mask">
              <div className="animate-marquee flex items-center font-medium text-slate-300 text-xs">
                {/* News Items rendered in two equal sets for a seamless infinite loop */}
                {[...HEALTHCARE_NEWS, ...HEALTHCARE_NEWS].map((news, index) => (
                  <div key={index} className="inline-flex items-center gap-2.5 pr-12 hover:text-cyan-300 transition-colors cursor-default shrink-0">
                    <span className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm">
                      {news.tag}
                    </span>
                    <span className="tracking-normal text-slate-200">{news.text}</span>
                    <span className="text-slate-600 pl-4">✦</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Glass Navigation Header */}
        <header className="sticky top-0 z-40 w-full bg-[#090E1D]/80 backdrop-blur-xl border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo & Tagline */}
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative w-10 h-10 bg-white/95 rounded-xl p-1 flex items-center justify-center border border-cyan-500/40 shadow-inner group-hover:scale-105 transition-transform">
                  <Image
                    src="/logo.png"
                    alt="Care India Logo"
                    width={40}
                    height={40}
                    className="object-contain w-full h-full"
                    priority
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-lg leading-none tracking-tight text-white group-hover:text-cyan-300 transition-colors">Care India</span>
                  <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
                    AI MEDTECH
                  </span>
                </div>
                <span className="font-mono text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-1">
                  Healthcare Affordability &amp; Claims Navigator
                </span>
              </div>
            </Link>

            {/* Right Header Navigation & Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>System Status: Fully Operational</span>
              </div>

              {/* Dynamic Authentication component */}
              <HeaderAuth />
            </div>
          </div>
        </header>

        {/* Main Application Content */}
        <main className="flex-1 flex flex-col relative z-10">
          {children}
        </main>

        {/* AI Healthcare Financial & Rights Navigator Chatbot */}
        <HealthcareChatbot />

        {/* High-Tech Medtech Footer */}
        <footer className="w-full bg-[#050811] border-t border-white/[0.06] py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-slate-300">Care India Medtech</span>
              <span>— Intelligent Healthcare Financial Navigation</span>
            </div>
            <div className="flex items-center gap-6 font-mono text-[11px]">
              <span className="text-slate-400">NPPA &amp; PM-JAY Reference Engine v2.4</span>
              <span className="text-emerald-400/90 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 256-Bit Encrypted
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
