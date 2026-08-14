// Domain Types and Fallback Datasets for Care India Healthcare Navigator

export type TabId = "scan" | "match" | "ready";

export interface LedgerItem {
  description: string;
  charged_amount: number;
  reference_amount: number | null;
  status: "normal" | "questionable" | "inflated";
}

export interface RefPrice {
  keyword: string;
  reference_amount: number;
}

export interface SchemeRule {
  id?: number;
  diagnosis: string;
  income_bracket: "low" | "mid";
  scheme_name: string;
  coverage_amount: number;
  note: string;
  state: string | null;
}

export interface GenericSwap {
  id?: number;
  diagnosis: string;
  branded_name: string;
  branded_price: number;
  generic_name: string;
  generic_price: number;
}

export interface ChecklistItem {
  id?: number;
  item_key: string;
  item_text: string;
  detail_text: string;
  weight: number;
  display_order: number;
}

export const FALLBACK_SCHEME_RULES: SchemeRule[] = [
  // Cardiac
  {
    diagnosis: "cardiac",
    income_bracket: "low",
    scheme_name: "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)",
    coverage_amount: 500000,
    note: "Cashless cardiac interventions, valve replacements, and pacemaker implantations at network hospitals across Maharashtra.",
    state: "Maharashtra"
  },
  {
    diagnosis: "cardiac",
    income_bracket: "mid",
    scheme_name: "MJPJAY Universal Health Scheme",
    coverage_amount: 500000,
    note: "Universal health protection for all Maharashtra ration-card holder families for secondary and tertiary cardiac procedures.",
    state: "Maharashtra"
  },
  {
    diagnosis: "cardiac",
    income_bracket: "low",
    scheme_name: "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)",
    coverage_amount: 500000,
    note: "Full cashless cardiac procedures and ICU packages at empanelled government and private healthcare centres in Tamil Nadu.",
    state: "Tamil Nadu"
  },
  {
    diagnosis: "cardiac",
    income_bracket: "low",
    scheme_name: "Ayushman Bharat - Arogya Karnataka (AB-ArK)",
    coverage_amount: 500000,
    note: "Cashless treatment for complex cardiovascular conditions and surgical interventions in Karnataka.",
    state: "Karnataka"
  },
  {
    diagnosis: "cardiac",
    income_bracket: "low",
    scheme_name: "Dr. YSR Aarogyasri Health Scheme",
    coverage_amount: 500000,
    note: "End-to-end cashless tertiary cardiac care and post-operative financial support in Andhra Pradesh.",
    state: "Andhra Pradesh"
  },
  {
    diagnosis: "cardiac",
    income_bracket: "low",
    scheme_name: "Ayushman Bharat PM-JAY (National)",
    coverage_amount: 500000,
    note: "100% cashless coverage for cardiology & cardiothoracic surgeries including angioplasty, stenting, and bypass (CABG) across all empanelled hospitals nationwide.",
    state: null
  },
  {
    diagnosis: "cardiac",
    income_bracket: "mid",
    scheme_name: "State Universal Health Assurance & Trust Care",
    coverage_amount: 200000,
    note: "Subsidized packages for cardiac diagnostics and interventions available at empanelled public and charitable trust hospitals.",
    state: null
  },

  // Maternity
  {
    diagnosis: "maternity",
    income_bracket: "low",
    scheme_name: "MJPJAY Maternity & Neonatal Package",
    coverage_amount: 100000,
    note: "Comprehensive high-risk pregnancy, C-section delivery, and sick newborn care coverage across Maharashtra network hospitals.",
    state: "Maharashtra"
  },
  {
    diagnosis: "maternity",
    income_bracket: "low",
    scheme_name: "Dr. Muthulakshmi Reddy Maternity Benefit Scheme",
    coverage_amount: 18000,
    note: "Financial assistance and maternal nutrition kit support for pregnant mothers in Tamil Nadu.",
    state: "Tamil Nadu"
  },
  {
    diagnosis: "maternity",
    income_bracket: "low",
    scheme_name: "Janani Shishu Suraksha Karyakram (JSSK) & PM-JAY",
    coverage_amount: 50000,
    note: "Completely free and cashless normal/C-section delivery, drugs, diagnostics, and diet, plus direct cash transfer via PMMVY.",
    state: null
  },
  {
    diagnosis: "maternity",
    income_bracket: "mid",
    scheme_name: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    coverage_amount: 6000,
    note: "Direct Benefit Transfer (DBT) wage-loss compensation and maternal nutrition assistance for institutional delivery.",
    state: null
  },

  // Diabetes
  {
    diagnosis: "diabetes",
    income_bracket: "low",
    scheme_name: "Delhi Arogya Kosh & Free Diagnostic Scheme",
    coverage_amount: 50000,
    note: "Free essential diabetic medicines, insulin vials, and 450+ lab tests at Mohalla Clinics and Delhi government facilities.",
    state: "Delhi"
  },
  {
    diagnosis: "diabetes",
    income_bracket: "low",
    scheme_name: "National Programme for Prevention of NCDs (NP-NCD) & PM-JAY",
    coverage_amount: 500000,
    note: "Free regular insulin and HbA1c screening at health & wellness centres; secondary/tertiary diabetic hospitalization covered under PM-JAY.",
    state: null
  },
  {
    diagnosis: "diabetes",
    income_bracket: "mid",
    scheme_name: "National NCD Care & Jan Aushadhi Scheme",
    coverage_amount: 25000,
    note: "Free essential anti-diabetic medications (Metformin, Glimepiride) and subsidized lab testing at district hospitals and Jan Aushadhi Kendras.",
    state: null
  },

  // Orthopedic
  {
    diagnosis: "orthopedic",
    income_bracket: "low",
    scheme_name: "MJPJAY Polytrauma & Joint Replacement Package",
    coverage_amount: 250000,
    note: "Cashless orthopedic joint replacement and trauma surgery coverage in Maharashtra.",
    state: "Maharashtra"
  },
  {
    diagnosis: "orthopedic",
    income_bracket: "low",
    scheme_name: "CMCHIS Orthopedic Reconstruction Scheme",
    coverage_amount: 500000,
    note: "Cashless orthopedic surgeries, spinal instrumentation, and joint reconstruction in Tamil Nadu.",
    state: "Tamil Nadu"
  },
  {
    diagnosis: "orthopedic",
    income_bracket: "low",
    scheme_name: "Ayushman Bharat PM-JAY Joint Replacement & Trauma",
    coverage_amount: 500000,
    note: "100% cashless hip/knee replacement, fracture fixation, and trauma care with NPPA-capped implant pricing.",
    state: null
  },
  {
    diagnosis: "orthopedic",
    income_bracket: "mid",
    scheme_name: "State Orthopedic Care & NPPA Ceiling Rate Assurance",
    coverage_amount: 150000,
    note: "Capped knee and hip implant pricing under National Pharmaceutical Pricing Authority (NPPA) directives with subsidized trust hospital surgery rates.",
    state: null
  }
];

export const FALLBACK_GENERIC_SWAPS: GenericSwap[] = [
  // Cardiac
  {
    diagnosis: "cardiac",
    branded_name: "Atorva 20mg (Atorvastatin) - 10 Tablets",
    branded_price: 240,
    generic_name: "Jan Aushadhi Atorvastatin 20mg - 10 Tablets",
    generic_price: 35
  },
  {
    diagnosis: "cardiac",
    branded_name: "Telma 40 (Telmisartan 40mg) - 15 Tablets",
    branded_price: 210,
    generic_name: "Jan Aushadhi Telmisartan 40mg - 10 Tablets",
    generic_price: 28
  },
  {
    diagnosis: "cardiac",
    branded_name: "Clopilet 75 (Clopidogrel 75mg) - 10 Tablets",
    branded_price: 145,
    generic_name: "Jan Aushadhi Clopidogrel 75mg - 10 Tablets",
    generic_price: 22
  },

  // Maternity
  {
    diagnosis: "maternity",
    branded_name: "Orofer-XT (Ferrous Ascorbate + Folic Acid) - 30 Tabs",
    branded_price: 340,
    generic_name: "Jan Aushadhi Iron & Folic Acid - 30 Tablets",
    generic_price: 45
  },
  {
    diagnosis: "maternity",
    branded_name: "Shelcal 500 (Calcium 500mg + Vit D3) - 15 Tablets",
    branded_price: 145,
    generic_name: "Jan Aushadhi Calcium 500mg + D3 - 10 Tablets",
    generic_price: 22
  },
  {
    diagnosis: "maternity",
    branded_name: "Folvite 5mg (Folic Acid 5mg) - 30 Tablets",
    branded_price: 85,
    generic_name: "Jan Aushadhi Folic Acid 5mg - 30 Tablets",
    generic_price: 12
  },

  // Diabetes
  {
    diagnosis: "diabetes",
    branded_name: "Glycomet GP 1 (Metformin 500mg + Glimepiride 1mg) - 15 Tabs",
    branded_price: 165,
    generic_name: "Jan Aushadhi Metformin 500mg + Glimepiride 1mg - 10 Tabs",
    generic_price: 24
  },
  {
    diagnosis: "diabetes",
    branded_name: "Januvia 100mg (Sitagliptin) - 7 Tablets",
    branded_price: 390,
    generic_name: "Jan Aushadhi Sitagliptin 100mg - 10 Tablets",
    generic_price: 65
  },
  {
    diagnosis: "diabetes",
    branded_name: "Galvus 50mg (Vildagliptin) - 14 Tablets",
    branded_price: 280,
    generic_name: "Jan Aushadhi Vildagliptin 50mg - 10 Tablets",
    generic_price: 52
  },

  // Orthopedic
  {
    diagnosis: "orthopedic",
    branded_name: "Zerodol-SP (Aceclofenac + Paracetamol + Serratiopeptidase) - 10 Tabs",
    branded_price: 135,
    generic_name: "Jan Aushadhi Aceclofenac + Paracetamol + Serratiopeptidase - 10 Tabs",
    generic_price: 30
  },
  {
    diagnosis: "orthopedic",
    branded_name: "Cartigen 1500 (Glucosamine Sulfate 1500mg) - 15 Tablets",
    branded_price: 420,
    generic_name: "Jan Aushadhi Glucosamine Sulfate 1500mg - 10 Tablets",
    generic_price: 75
  },
  {
    diagnosis: "orthopedic",
    branded_name: "Ultra-D3 60K (Cholecalciferol 60,000 IU) - 4 Capsules",
    branded_price: 150,
    generic_name: "Jan Aushadhi Vitamin D3 60K - 4 Capsules",
    generic_price: 25
  }
];

export const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 1,
    item_key: "diag_match",
    item_text: "Diagnosis code matches discharge summary",
    detail_text: "The ICD-10 diagnosis code on your claim form must exactly match the hospital discharge summary. A mismatch triggers manual audit or rejection.",
    weight: 25,
    display_order: 1
  },
  {
    id: 2,
    item_key: "proc_match",
    item_text: "Procedure code matches billed treatment",
    detail_text: "The procedure code billed must correspond precisely to the operation performed. Mismatches between OT notes and the bill will trigger claim denial.",
    weight: 25,
    display_order: 2
  },
  {
    id: 3,
    item_key: "docs_complete",
    item_text: "All discharge documents attached",
    detail_text: "Required: signed discharge summary, itemized bill, payment receipts, prescriptions, and lab/imaging reports. Missing any one document delays settlement by 15-30 days.",
    weight: 20,
    display_order: 3
  },
  {
    id: 4,
    item_key: "preauth",
    item_text: "Pre-authorization obtained (if required)",
    detail_text: "For planned admissions, a TPA pre-auth code is required before admission. Claims without pre-auth are downgraded from cashless to reimbursement or rejected.",
    weight: 20,
    display_order: 4
  },
  {
    id: 5,
    item_key: "policy_active",
    item_text: "Policy active & premium paid to date",
    detail_text: "Confirm your policy is active, has not lapsed, and sum insured is not exhausted for the year. Insurers validate policy status at claim adjudication time.",
    weight: 10,
    display_order: 5
  }
];
