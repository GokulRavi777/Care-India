"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

import {
  TabId,
  LedgerItem,
  RefPrice,
  SchemeRule,
  GenericSwap,
  ChecklistItem,
  FALLBACK_SCHEME_RULES,
  FALLBACK_GENERIC_SWAPS,
  DEFAULT_CHECKLIST_ITEMS
} from "@/lib/schemeData";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("scan");
  
  // Ledger state
  const [ledgerItems, setLedgerItems] = useState<LedgerItem[]>([]);
  const [refPrices, setRefPrices] = useState<RefPrice[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Manual fallback inputs
  const [manualDesc, setManualDesc] = useState("");
  const [manualAmount, setManualAmount] = useState("");

  // Scheme Matcher state
  const [diagnosis, setDiagnosis] = useState<"cardiac" | "maternity" | "diabetes" | "orthopedic">("cardiac");
  const [income, setIncome] = useState<"low" | "mid" | "high">("low");
  const [stateResidence, setStateResidence] = useState("Maharashtra");
  const [matchingSchemes, setMatchingSchemes] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedScheme, setMatchedScheme] = useState<SchemeRule | null>(null);
  const [genericSwaps, setGenericSwaps] = useState<GenericSwap[]>([]);
  const [schemeError, setSchemeError] = useState<string | null>(null);

  // Claim Readiness state
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [checklistLoading, setChecklistLoading] = useState(true);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [savingClaim, setSavingClaim] = useState(false);
  const [claimSaveStatus, setClaimSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  const tabs = [
    { id: "scan" as TabId, badge: "01 — SCAN & AUDIT", title: "Bill & Prescription Scanner", icon: "🔬" },
    { id: "match" as TabId, badge: "02 — MATCH & SAVE", title: "Scheme & Savings Matcher", icon: "🏛️" },
    { id: "ready" as TabId, badge: "03 — CLAIM READINESS", title: "Claim-Readiness Score", icon: "🛡️" },
  ];

  useEffect(() => {
    const supabase = createClient();
    // Fetch reference prices for client-side matching (manual entries)
    supabase.from("reference_prices").select("keyword, reference_amount").then(({ data, error }) => {
      if (!error && data) setRefPrices(data);
    });
    // Fetch checklist items from Supabase, sorted by display_order
    supabase
      .from("checklist_items")
      .select("*")
      .order("display_order", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setChecklistItems(data);
          const defaultState: Record<string, boolean> = {};
          data.forEach((item: ChecklistItem) => { defaultState[item.item_key] = true; });
          setChecklistState(defaultState);
        } else {
          // Fallback if table not yet seeded
          setChecklistItems(DEFAULT_CHECKLIST_ITEMS);
          const defaultState: Record<string, boolean> = {};
          DEFAULT_CHECKLIST_ITEMS.forEach(item => { defaultState[item.item_key] = true; });
          setChecklistState(defaultState);
        }
        setChecklistLoading(false);
      });
  }, []);

  // Match entitlements using Supabase scheme_rules and generic_swaps
  const handleMatchSchemes = async (e: React.FormEvent) => {
    e.preventDefault();
    setMatchingSchemes(true);
    setSchemeError(null);
    setHasSearched(true);

    const supabase = createClient();
    let foundScheme: SchemeRule | null = null;
    let foundSwaps: GenericSwap[] = [];

    try {
      if (income !== "high") {
        try {
          const { data: dbRules, error: rulesError } = await supabase
            .from("scheme_rules")
            .select("*")
            .eq("diagnosis", diagnosis)
            .eq("income_bracket", income);

          if (!rulesError && dbRules && dbRules.length > 0) {
            const stateMatch = dbRules.find(r => r.state && r.state.toLowerCase() === stateResidence.toLowerCase());
            const generalMatch = dbRules.find(r => !r.state);
            foundScheme = stateMatch || generalMatch || dbRules[0];
          } else {
            const matchingRules = FALLBACK_SCHEME_RULES.filter(
              r => r.diagnosis === diagnosis && r.income_bracket === income
            );
            const stateMatch = matchingRules.find(r => r.state && r.state.toLowerCase() === stateResidence.toLowerCase());
            const generalMatch = matchingRules.find(r => !r.state);
            foundScheme = stateMatch || generalMatch || null;
          }
        } catch {
          const matchingRules = FALLBACK_SCHEME_RULES.filter(
            r => r.diagnosis === diagnosis && r.income_bracket === income
          );
          const stateMatch = matchingRules.find(r => r.state && r.state.toLowerCase() === stateResidence.toLowerCase());
          const generalMatch = matchingRules.find(r => !r.state);
          foundScheme = stateMatch || generalMatch || null;
        }
      } else {
        foundScheme = null;
      }

      // Query Generic Swaps for the diagnosis
      try {
        const { data: dbSwaps, error: swapsError } = await supabase
          .from("generic_swaps")
          .select("*")
          .eq("diagnosis", diagnosis);

        if (!swapsError && dbSwaps && dbSwaps.length > 0) {
          foundSwaps = dbSwaps;
        } else {
          foundSwaps = FALLBACK_GENERIC_SWAPS.filter(s => s.diagnosis === diagnosis);
        }
      } catch {
        foundSwaps = FALLBACK_GENERIC_SWAPS.filter(s => s.diagnosis === diagnosis);
      }

      setMatchedScheme(foundScheme);
      setGenericSwaps(foundSwaps);

      // Save match attempt to scheme_matches table
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("scheme_matches").insert({
          user_id: user?.id ?? null,
          diagnosis,
          income_bracket: income,
          state: stateResidence,
          matched_scheme: foundScheme ? foundScheme.scheme_name : null,
          coverage_amount: foundScheme ? foundScheme.coverage_amount : null,
        });
      } catch (insertErr) {
        console.warn("Could not record match attempt to scheme_matches:", insertErr);
      }
    } catch (err: unknown) {
      console.error("Matching error:", err);
      setSchemeError(err instanceof Error ? err.message : "Error checking schemes");
    } finally {
      setMatchingSchemes(false);
    }
  };

  // Compute readiness score live from checklist state
  const readinessScore = checklistItems.reduce((total, item) => {
    return total + (checklistState[item.item_key] ? item.weight : 0);
  }, 0);

  const readinessStatus = readinessScore >= 90 ? "Optimal Approval Probability" : readinessScore >= 50 ? "Moderate Denial Risk" : "Critical Audit / Rejection Risk";
  const readinessBadgeBg = readinessScore >= 90 ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : readinessScore >= 50 ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : "bg-rose-500/15 border-rose-500/30 text-rose-400";
  const readinessScoreColor = readinessScore >= 90 ? "text-emerald-400" : readinessScore >= 50 ? "text-amber-400" : "text-rose-400";
  const readinessProgressBar = readinessScore >= 90 ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]" : readinessScore >= 50 ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]" : "bg-gradient-to-r from-rose-600 to-red-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]";

  const uncheckedItems = checklistItems.filter(item => !checklistState[item.item_key]);

  // Save claim via server-side API route
  const handleSaveClaim = async () => {
    setSavingClaim(true);
    setClaimSaveStatus(null);
    try {
      const isInsert = !claimId;
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: claimId || undefined,
          checklist_state: checklistState,
          readiness_score: readinessScore,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      }

      const savedId = json.id;
      if (isInsert) {
        setClaimId(savedId);
      }
      setClaimSaveStatus({ success: true, message: isInsert ? "Claim packet verified & saved." : "Claim record updated in database." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setClaimSaveStatus({ success: false, message: `Save failed — ${msg}` });
    } finally {
      setSavingClaim(false);
    }
  };

  // Handle bill scanning via Gemini API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrError(null);
    setSaveStatus(null);
    setScanning(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/bills/scan", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to scan the bill");
      }

      setLedgerItems(data.items);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Couldn't read that bill — try a clearer photo or enter items manually";
      setOcrError(message);
    } finally {
      setScanning(false);
    }
  };

  // Add line item manually
  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDesc || !manualAmount) return;

    const charged = Number(manualAmount) || 0;
    const descLower = manualDesc.toLowerCase();
    const matchedRef = refPrices.find(rp => descLower.includes(rp.keyword.toLowerCase()));

    let itemStatus: "normal" | "questionable" | "inflated" = "normal";
    let refAmt: number | null = null;

    if (matchedRef) {
      refAmt = matchedRef.reference_amount;
      if (charged <= refAmt * 1.08) {
        itemStatus = "normal";
      } else if (charged <= refAmt * 1.30) {
        itemStatus = "questionable";
      } else {
        itemStatus = "inflated";
      }
    }

    const newItem: LedgerItem = {
      description: manualDesc,
      charged_amount: charged,
      reference_amount: refAmt,
      status: itemStatus,
    };

    setLedgerItems(prev => [...prev, newItem]);
    setManualDesc("");
    setManualAmount("");
  };

  // Save bill to Supabase
  const handleSaveBill = async () => {
    if (ledgerItems.length === 0) return;
    setSaving(true);
    setSaveStatus(null);

    const supabase = createClient();
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setSaveStatus({
          success: false,
          message: "Please sign in (or click 'Sign In / Demo Access') to save and secure your audited bill to your account.",
        });
        return;
      }

      const totalCharged = ledgerItems.reduce((sum, item) => sum + item.charged_amount, 0);

      const { data: bill, error: billError } = await supabase
        .from("bills")
        .insert({
          user_id: user.id,
          total_amount: totalCharged,
        })
        .select("id")
        .single();

      if (billError) throw billError;

      const lineItemsPayload = ledgerItems.map(item => ({
        bill_id: bill.id,
        description: item.description,
        charged_amount: item.charged_amount,
        reference_amount: item.reference_amount,
        status: item.status,
      }));

      const { error: linesError } = await supabase
        .from("bill_line_items")
        .insert(lineItemsPayload);

      if (linesError) throw linesError;

      setSaveStatus({ success: true, message: "Bill & audited line items secured to database!" });
      setLedgerItems([]);
      setPreviewUrl(null);
    } catch (err: unknown) {
      console.error("Failed to save bill:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setSaveStatus({ success: false, message: `Failed to save the bill: ${msg}` });
    } finally {
      setSaving(false);
    }
  };

  // Calculations for Summary Strip
  const nonNormalItems = ledgerItems.filter(item => item.status !== "normal" && item.reference_amount !== null);
  const totalOvercharge = nonNormalItems.reduce(
    (sum, item) => sum + (item.charged_amount - (item.reference_amount || 0)), 
    0
  );
  const flaggedCount = nonNormalItems.length;

  return (
    <div className="flex-1 flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full py-16 px-4 sm:px-6 relative overflow-hidden border-b border-white/[0.08]">
        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full"></div>

        <div className="max-w-5xl mx-auto text-center flex flex-col items-center gap-6 relative z-10">
          {/* Tag badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wide uppercase shadow-[0_0_15px_rgba(0,242,254,0.15)]">
            <span>✨</span> Next-Gen Healthcare Financial Intelligence for India
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-white leading-tight">
            Before you pay a rupee, <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,242,254,0.25)]">
              know if it&apos;s fair.
            </span>
          </h1>

          <p className="max-w-3xl text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
            Instantly scan hospital bills against 500+ government &amp; NPPA reference benchmarks, discover eligible central/state healthcare schemes, and test insurance claim approval readiness in one seamless workflow.
          </p>

          {/* Medtech Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-4xl mt-6">
            <div className="bg-[#0D1426]/70 backdrop-blur-md border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl p-6 transition-all shadow-lg text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/15 transition-colors"></div>
              <div className="text-3xl font-mono font-bold text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]">₹45,000+</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">Avg. Identified Overcharges</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">Benchmark audits on surgeries &amp; ICU stays</div>
            </div>

            <div className="bg-[#0D1426]/70 backdrop-blur-md border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl p-6 transition-all shadow-lg text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-colors"></div>
              <div className="text-3xl font-mono font-bold text-cyan-300 drop-shadow-[0_0_12px_rgba(0,242,254,0.4)]">500+ Items</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">NPPA &amp; PM-JAY Reference Engine</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">Procedures, room rents &amp; generic drugs</div>
            </div>

            <div className="bg-[#0D1426]/70 backdrop-blur-md border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl p-6 transition-all shadow-lg text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-colors"></div>
              <div className="text-3xl font-mono font-bold text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">100% Secure</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">Patient Privacy Compliant</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">In-memory OCR extraction &amp; encrypted DB</div>
            </div>
          </div>
        </div>
      </section>

      {/* Futuristic Sticky Module Navigation Tabs */}
      <nav className="sticky top-16 z-30 w-full bg-[#080D1B]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex justify-center">
          <div className="flex w-full divide-x divide-white/[0.08]" role="tablist">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-4 px-2 text-center transition-all cursor-pointer select-none focus:outline-none relative
                    ${isActive 
                      ? "text-cyan-300 bg-cyan-500/[0.07] font-bold" 
                      : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
                    }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-mono tracking-wider uppercase opacity-75">{tab.badge}</span>
                    <span className="text-xs sm:text-sm font-semibold tracking-tight">{tab.title}</span>
                  </div>
                  {isActive && (
                    <div className="absolute bottom-0 inset-x-0 h-[3px] bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.8)]"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="w-full max-w-5xl mx-auto py-12 px-4 sm:px-6 flex-1 flex flex-col">
        {tabs.map((tab) => {
          if (activeTab !== tab.id) return null;

          // ==============================
          // TAB 01 — SCANNER PANEL
          // ==============================
          if (tab.id === "scan") {
            return (
              <div key={tab.id} role="tabpanel" className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
                {/* File Upload / OCR Dropzone */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Dropzone Card */}
                  <div className="md:col-span-2 bg-[#0D1426]/80 backdrop-blur-md border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative transition-all group overflow-hidden shadow-xl">
                    <input
                      type="file"
                      id="bill-upload"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                      disabled={scanning}
                    />
                    
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl mb-4 text-cyan-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all">
                      📄
                    </div>
                    <span className="font-bold text-white text-base sm:text-lg">
                      Upload Hospital Bill or Doctor&apos;s Prescription
                    </span>
                    <span className="text-xs text-slate-400 mt-1 max-w-md">
                      Drag &amp; drop your invoice (JPG, PNG, or PDF). Gemini AI extracts line items &amp; cross-checks benchmark ceilings.
                    </span>

                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-[11px] font-mono bg-white/[0.04] text-slate-300 px-2.5 py-1 rounded-lg border border-white/[0.06]">
                        Supported: Inpatient Bills • Pharmacy Invoices • Discharge Slips
                      </span>
                    </div>

                    {/* Scanning Animation State with Laser Line */}
                    {scanning && (
                      <div className="absolute inset-0 bg-[#070C1A]/95 backdrop-blur-md flex flex-col items-center justify-center z-30">
                        {/* Sweeping Laser Line */}
                        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#00F2FE] animate-laser"></div>

                        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin mb-4"></div>
                        <span className="font-mono font-bold text-cyan-300 text-base tracking-wider uppercase">
                          AI Medical OCR Running
                        </span>
                        <span className="text-xs text-slate-400 mt-1 font-mono">
                          Parsing items &amp; querying 500+ reference tariffs...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Preview Card */}
                  <div className="bg-[#0D1426]/80 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-center items-center shadow-xl">
                    {previewUrl ? (
                      <div className="flex flex-col items-center w-full">
                        <div className="flex items-center justify-between w-full mb-3">
                          <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">Document Preview</span>
                          <span className="text-[10px] font-mono text-slate-400">Ready for Audit</span>
                        </div>
                        <div className="w-full h-44 border border-white/[0.08] rounded-xl overflow-hidden bg-[#070B16] flex items-center justify-center">
                          {previewUrl.startsWith("data:application/pdf") ? (
                            <div className="flex flex-col items-center gap-2 p-4 text-center">
                              <span className="text-4xl">📑</span>
                              <span className="text-xs font-mono font-semibold text-slate-300">PDF Document Loaded</span>
                            </div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={previewUrl} alt="Bill Preview" className="object-contain max-h-44 w-full" />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-slate-400 text-lg">
                          🔍
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">Instant Price Detection</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Our database matches room rents, ICU tariffs, CT/MRI scans, and surgical implants against standard government capped rates.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Manual Line Item Form */}
                <div className="bg-[#0D1426]/80 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-cyan-400 text-sm">✍️</span>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                      Manual Item Entry / Fallback Audit
                    </h3>
                  </div>
                  <form onSubmit={handleManualAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="manual-desc" className="text-xs font-semibold text-slate-400 font-mono">
                        Line Item Description
                      </label>
                      <input
                        id="manual-desc"
                        type="text"
                        required
                        value={manualDesc}
                        onChange={(e) => setManualDesc(e.target.value)}
                        placeholder="e.g. ICU charges, Cardiac Stent, MRI Brain..."
                        className="w-full px-3.5 py-2.5 border border-white/[0.08] focus:border-cyan-400 rounded-xl bg-[#070B16] text-white focus:outline-none text-sm transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="manual-amt" className="text-xs font-semibold text-slate-400 font-mono">
                        Charged Amount (₹)
                      </label>
                      <input
                        id="manual-amt"
                        type="number"
                        required
                        min="0"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        placeholder="e.g. 25000"
                        className="w-full px-3.5 py-2.5 border border-white/[0.08] focus:border-cyan-400 rounded-xl bg-[#070B16] text-white focus:outline-none font-mono text-sm transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="py-2.5 px-5 bg-cyan-500 hover:bg-cyan-400 text-[#070C1A] font-bold rounded-xl transition-all cursor-pointer select-none text-sm shadow-[0_0_15px_rgba(0,242,254,0.2)]"
                    >
                      + Audit Line Item
                    </button>
                  </form>
                </div>

                {/* Status Messages */}
                {ocrError && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm p-4 rounded-xl font-medium flex items-center gap-3">
                    <span className="text-lg">⚠️</span>
                    <span>{ocrError}</span>
                  </div>
                )}

                {saveStatus && (
                  <div className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-3 ${
                    saveStatus.success 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}>
                    <span className="text-lg">{saveStatus.success ? "✨" : "⚠️"}</span>
                    <span>{saveStatus.message}</span>
                  </div>
                )}

                {/* Annotated Bill Ledger Area */}
                {ledgerItems.length > 0 && (
                  <div className="bg-[#0D1426]/90 backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                    <div className="bg-[#080D1A] border-b border-white/[0.08] px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        <h3 className="font-serif font-bold text-white text-base">Audited Item Ledger</h3>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full">
                        {ledgerItems.length} line {ledgerItems.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                    
                    {/* Ledger Rows */}
                    <div className="divide-y divide-white/[0.06]">
                      {ledgerItems.map((item, index) => {
                        const isQuestionable = item.status === "questionable";
                        const isInflated = item.status === "inflated";
                        
                        let statusClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]";
                        if (isQuestionable) statusClass = "text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]";
                        if (isInflated) statusClass = "text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]";

                        return (
                          <div key={index} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                            <div className="flex-1">
                              <div className="font-semibold text-white capitalize text-sm">{item.description}</div>
                              <div className="text-xs text-slate-400 font-mono mt-1">
                                {item.reference_amount !== null ? (
                                  <span>Standard Reference Ceiling: <strong className="text-cyan-300 font-bold">₹{item.reference_amount.toLocaleString("en-IN")}</strong></span>
                                ) : (
                                  <span className="italic text-slate-500">Custom / Uncapped Hospital Item</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-6 justify-between sm:justify-end">
                              <div className="text-right flex flex-col">
                                <span className="font-mono font-bold text-white text-base">
                                  ₹{item.charged_amount.toLocaleString("en-IN")}
                                </span>
                                {item.reference_amount !== null && (
                                  <span className={`text-xs font-mono font-semibold ${item.charged_amount > item.reference_amount ? "text-rose-400" : "text-emerald-400"}`}>
                                    {item.charged_amount > item.reference_amount 
                                      ? `+₹${(item.charged_amount - item.reference_amount).toLocaleString("en-IN")} Above Fair Cap`
                                      : `₹${(item.reference_amount - item.charged_amount).toLocaleString("en-IN")} Within Fair Cap`
                                    }
                                  </span>
                                )}
                              </div>

                              <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${statusClass}`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary Strip */}
                    <div className="bg-[#080D1A] border-t border-white/[0.08] px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Potential Overcharge Detected</div>
                          <div className="text-2xl sm:text-3xl font-mono font-bold text-rose-400 mt-1 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                            ₹{totalOvercharge.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Flagged Charges</div>
                          <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1">
                            {flaggedCount} {flaggedCount === 1 ? "item" : "items"}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleSaveBill}
                        disabled={saving}
                        className="py-3 px-8 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-[#070C1A] font-bold rounded-xl transition-all cursor-pointer select-none text-sm disabled:opacity-50 shadow-[0_0_15px_rgba(0,242,254,0.3)]"
                      >
                        {saving ? "Saving Record..." : "Save Audited Bill"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // ==============================
          // TAB 02 — SCHEME MATCHER PANEL
          // ==============================
          if (tab.id === "match") {
            return (
              <div key={tab.id} role="tabpanel" className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
                {/* Entitlement Search Form */}
                <div className="bg-[#0D1426]/80 backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-cyan-400 text-lg">🔍</span>
                    <h3 className="text-base font-serif font-bold text-white">Patient Healthcare Scheme Eligibility</h3>
                  </div>

                  <form onSubmit={handleMatchSchemes} className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                    {/* Diagnosis */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="match-diagnosis" className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Medical Category / Diagnosis
                      </label>
                      <select
                        id="match-diagnosis"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value as "cardiac" | "maternity" | "diabetes" | "orthopedic")}
                        className="w-full px-4 py-3 border border-white/[0.08] focus:border-cyan-400 rounded-xl bg-[#070B16] text-white focus:outline-none text-sm transition-colors cursor-pointer"
                      >
                        <option value="cardiac">Cardiac Care &amp; Surgery (Bypass, Stents)</option>
                        <option value="maternity">Maternity &amp; Neonatal Delivery</option>
                        <option value="diabetes">Diabetes &amp; Chronic Non-Communicable</option>
                        <option value="orthopedic">Orthopedic &amp; Joint Replacement</option>
                      </select>
                    </div>

                    {/* Income Tier */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="match-income" className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Annual Household Income
                      </label>
                      <select
                        id="match-income"
                        value={income}
                        onChange={(e) => setIncome(e.target.value as "low" | "mid" | "high")}
                        className="w-full px-4 py-3 border border-white/[0.08] focus:border-cyan-400 rounded-xl bg-[#070B16] text-white focus:outline-none text-sm transition-colors cursor-pointer"
                      >
                        <option value="low">Low Income (&lt; ₹1.2 Lakhs / yr)</option>
                        <option value="mid">Middle Income (₹1.2L - ₹8 Lakhs / yr)</option>
                        <option value="high">High Income (&gt; ₹8 Lakhs / yr)</option>
                      </select>
                    </div>

                    {/* State */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="match-state" className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                        State of Residence
                      </label>
                      <select
                        id="match-state"
                        value={stateResidence}
                        onChange={(e) => setStateResidence(e.target.value)}
                        className="w-full px-4 py-3 border border-white/[0.08] focus:border-cyan-400 rounded-xl bg-[#070B16] text-white focus:outline-none text-sm transition-colors cursor-pointer"
                      >
                        <option value="Maharashtra">Maharashtra (MJPJAY)</option>
                        <option value="Tamil Nadu">Tamil Nadu (CMCHIS)</option>
                        <option value="Karnataka">Karnataka (Arogya Karnataka)</option>
                        <option value="Andhra Pradesh">Andhra Pradesh (YSR Aarogyasri)</option>
                        <option value="Delhi">Delhi (Delhi Arogya Kosh)</option>
                        <option value="Gujarat">Gujarat (PM-JAY MAA)</option>
                        <option value="West Bengal">West Bengal (Swasthya Sathi)</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="All India">All India / Other States</option>
                      </select>
                    </div>

                    {/* Submit Button */}
                    <div className="sm:col-span-3 flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={matchingSchemes}
                        className="py-3 px-8 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-[#070C1A] font-bold rounded-xl transition-all cursor-pointer select-none text-sm w-full sm:w-auto shadow-[0_0_15px_rgba(0,242,254,0.3)] disabled:opacity-50"
                      >
                        {matchingSchemes ? "Querying Entitlement Engine..." : "Check Available Schemes & Swaps"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Error Banner */}
                {schemeError && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm p-4 rounded-xl font-medium">
                    ⚠️ {schemeError}
                  </div>
                )}

                {/* Search Results Display */}
                {hasSearched && (
                  <div className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
                    {/* Matched Scheme Card */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                          Eligible Government Health Scheme
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">100% Cashless at Empanelled Hospitals</span>
                      </div>

                      {matchedScheme ? (
                        <div className="bg-[#0D1426]/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 relative z-10">
                            <div>
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h5 className="font-serif font-bold text-white text-xl sm:text-2xl">
                                  {matchedScheme.scheme_name}
                                </h5>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                                  Eligible For Full Benefits
                                </span>
                              </div>
                              <span className="text-xs font-mono font-medium text-slate-400">
                                {matchedScheme.state ? `State Health Entitlement (${matchedScheme.state})` : "National Health Entitlement"}
                              </span>
                            </div>

                            <div className="bg-[#070B16] border border-white/[0.08] rounded-xl px-5 py-3 text-left sm:text-right shrink-0">
                              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                                Maximum Annual Coverage
                              </span>
                              <span className="font-mono font-bold text-2xl sm:text-3xl text-cyan-300 drop-shadow-[0_0_12px_rgba(0,242,254,0.4)]">
                                ₹{matchedScheme.coverage_amount.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-slate-300 leading-relaxed border-t border-white/[0.08] pt-4 mt-2 relative z-10">
                            {matchedScheme.note}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-[#0D1426]/80 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col gap-3 shadow-xl">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">📋</span>
                            <div>
                              <h5 className="font-serif font-bold text-white text-lg">
                                No Direct Government Subsidy Scheme
                              </h5>
                              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-500/15 text-slate-400 inline-block mt-1">
                                Income Tier Above Subsidized Threshold
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-slate-300 leading-relaxed mt-1">
                            Government health coverage schemes (like PM-JAY and State Arogya trusts) are targeted toward low and middle-income families (under ₹8 Lakhs/year).
                          </p>

                          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 mt-2 flex items-start gap-3">
                            <span className="text-cyan-400 text-base shrink-0">💡</span>
                            <p className="text-xs text-slate-200 leading-relaxed">
                              <strong>Unlock Generic Savings:</strong> Even without government scheme subsidies, you can unlock up to 85% out-of-pocket savings on prescribed medications through Jan Aushadhi generic equivalents below.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Generic Drug Swaps Table */}
                    {genericSwaps.length > 0 && (
                      <div className="bg-[#0D1426]/90 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                          <span className="text-2xl">💊</span>
                          <div>
                            <h4 className="font-serif font-bold text-white text-lg">Generic Medicine Savings Navigator</h4>
                            <p className="text-xs text-slate-400 font-mono">
                              Jan Aushadhi generic bio-equivalents vs. branded prescription drugs for {diagnosis.toUpperCase()}
                            </p>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-white/[0.08] text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                                <th className="pb-3">Generic Formulation</th>
                                <th className="pb-3">Common Branded Equivalents</th>
                                <th className="pb-3 text-right">Avg Brand Price</th>
                                <th className="pb-3 text-right">Jan Aushadhi Price</th>
                                <th className="pb-3 text-right">Net Savings</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.06] text-sm text-white">
                              {genericSwaps.map((med, idx) => {
                                const pct = Math.round(((med.branded_price - med.generic_price) / med.branded_price) * 100);
                                return (
                                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="py-4 font-semibold text-cyan-300">{med.generic_name}</td>
                                    <td className="py-4 text-slate-400">{med.branded_name}</td>
                                    <td className="py-4 text-right font-mono text-slate-400">
                                      ₹{med.branded_price.toLocaleString("en-IN")}
                                    </td>
                                    <td className="py-4 text-right font-mono text-emerald-400 font-bold">
                                      ₹{med.generic_price.toLocaleString("en-IN")}
                                    </td>
                                    <td className="py-4 text-right font-mono">
                                      <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                                        {pct}% Savings
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-4 leading-relaxed italic border-t border-white/[0.08] pt-3 font-mono">
                          * Pricing benchmarks based on Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) verified pharmacy rate list.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }

          // ==============================
          // TAB 03 — CLAIM READINESS PANEL
          // ==============================
          if (tab.id === "ready") {
            return (
              <div key={tab.id} role="tabpanel" className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
                {checklistLoading ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="bg-[#0D1426]/80 border border-white/[0.08] rounded-2xl p-5 animate-pulse h-20" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* LEFT COLUMN: Interactive Checklist */}
                    <div className="lg:col-span-3 flex flex-col gap-4">
                      <div className="bg-[#0D1426]/90 backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#080D1A]">
                          <div>
                            <h3 className="font-serif font-bold text-white text-base">Claim Readiness Checklist</h3>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">Toggle each verified item. Your approval score updates live.</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full select-none">
                            {checklistItems.filter(i => checklistState[i.item_key]).length} of {checklistItems.length} Satisfied
                          </span>
                        </div>

                        <div className="divide-y divide-white/[0.06]">
                          {checklistItems.map((item) => {
                            const isChecked = !!checklistState[item.item_key];
                            return (
                              <label
                                key={item.item_key}
                                htmlFor={`checklist-${item.item_key}`}
                                className={`flex items-start gap-4 px-6 py-5 cursor-pointer transition-colors select-none ${
                                  isChecked ? "hover:bg-white/[0.02]" : "bg-rose-500/[0.03] hover:bg-rose-500/[0.06]"
                                }`}
                              >
                                <input
                                  id={`checklist-${item.item_key}`}
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    setChecklistState(prev => ({
                                      ...prev,
                                      [item.item_key]: e.target.checked,
                                    }));
                                    setClaimSaveStatus(null);
                                  }}
                                  className="mt-1 w-4 h-4 rounded accent-cyan-400 flex-shrink-0 cursor-pointer"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className={`text-sm font-semibold ${isChecked ? "text-white" : "text-rose-300"}`}>
                                    {item.item_text}
                                  </div>
                                  <div className="text-xs text-slate-400 leading-relaxed mt-1">
                                    {item.detail_text}
                                  </div>
                                </div>
                                <span className={`flex-shrink-0 text-xs font-mono font-bold px-2.5 py-1 rounded-full mt-1 border ${
                                  isChecked 
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                }`}>
                                  +{item.weight}%
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Score Meter & Actions */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                      {/* Score Meter Card */}
                      <div className="bg-[#0D1426]/90 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                            Approval Probability
                          </h4>
                          <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${readinessBadgeBg}`}>
                            {readinessStatus}
                          </span>
                        </div>

                        {/* Digital LED Score Number */}
                        <div className="text-center py-2">
                          <span className={`text-7xl font-mono font-black ${readinessScoreColor} drop-shadow-[0_0_20px_rgba(0,242,254,0.3)]`}>
                            {readinessScore}
                          </span>
                          <span className={`text-3xl font-mono font-bold ${readinessScoreColor}`}>%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative">
                          <div className="w-full h-3 bg-[#070B16] rounded-full overflow-hidden border border-white/[0.08]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ease-out ${readinessProgressBar}`}
                              style={{ width: `${readinessScore}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1.5 font-mono text-[10px] text-slate-500">
                            <span>0% (High Risk)</span>
                            <span>50% (Partial Audit)</span>
                            <span>90%+ (Instant Preauth)</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Fix-list */}
                      <div className="bg-[#0D1426]/90 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 flex-1">
                        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
                          <span className="text-base">📋</span>
                          <h4 className="font-serif font-bold text-white text-sm">
                            {uncheckedItems.length === 0 ? "All Criteria Satisfied" : "Pre-Submission Action Items"}
                          </h4>
                        </div>

                        {uncheckedItems.length === 0 ? (
                          <div className="flex flex-col items-center justify-center text-center py-6 flex-1">
                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                              <span className="text-3xl">✅</span>
                            </div>
                            <h5 className="font-serif font-bold text-emerald-400 text-sm">Claim Packet Complete</h5>
                            <p className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">
                              All critical documentation is verified. Your claim is ready for cashless hospital submission.
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <p className="text-xs text-slate-400 font-mono">
                              Resolve the following {uncheckedItems.length} gap{uncheckedItems.length > 1 ? "s" : ""} to avoid claim rejections:
                            </p>
                            {uncheckedItems.map((item) => (
                              <div key={item.item_key} className="flex gap-2.5 items-start text-xs leading-relaxed bg-rose-500/[0.05] border border-rose-500/20 p-3 rounded-xl">
                                <span className="text-rose-400 mt-0.5 flex-shrink-0">⚠️</span>
                                <div>
                                  <span className="font-bold text-white">{item.item_text}</span>
                                  <p className="text-slate-400 mt-0.5">{item.detail_text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Save Claim Action */}
                      <div className="flex flex-col gap-3">
                        {claimSaveStatus && (
                          <div className={`text-xs font-medium px-4 py-2.5 rounded-xl border flex items-center gap-2 ${
                            claimSaveStatus.success
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                          }`}>
                            <span>{claimSaveStatus.success ? "✨" : "⚠️"}</span>
                            <span>{claimSaveStatus.message}</span>
                          </div>
                        )}

                        <button
                          id="ready-save-claim-btn"
                          type="button"
                          onClick={handleSaveClaim}
                          disabled={savingClaim}
                          className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-[#070C1A] font-bold rounded-xl transition-all cursor-pointer select-none text-sm disabled:opacity-50 shadow-[0_0_15px_rgba(0,242,254,0.3)]"
                        >
                          {savingClaim ? "Securing Claim Packet..." : claimId ? "Update Saved Claim Record" : "Save Verified Claim Packet"}
                        </button>
                        {claimId && (
                          <p className="text-[11px] text-slate-400 text-center font-mono">
                            Claim Identifier: <span className="text-cyan-300 font-bold">{claimId.slice(0, 13)}…</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
