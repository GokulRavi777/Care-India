// Offline Healthcare & Legal Rights Knowledge Engine for Care India
// Provides immediate, deterministic answers for healthcare finance, bill disputes, schemes, and claims without API calls.

interface KnowledgeTopic {
  id: string;
  keywords: string[];
  intent: string;
  title: string;
  response: string;
}

export const OFFLINE_KNOWLEDGE_BASE: KnowledgeTopic[] = [
  {
    id: "bill_dispute",
    keywords: [
      "dispute", "inflated", "overcharge", "overcharged", "high bill", "costly", "expensive", 
      "reduce bill", "contest", "negotiate", "icu charge", "hidden charge", "billing error", "wrong bill"
    ],
    intent: "Hospital Bill Dispute & Overcharge Negotiation",
    title: "How to Dispute & Negotiate an Inflated Hospital Bill",
    response: `### 🛡️ Step-by-Step Hospital Bill Dispute Protocol (India)

If you believe a hospital bill is inflated or exceeds standard reference rates, follow this legal and administrative procedure:

1. **Demand an Itemized Summary Bill (Breakup)**:
   - Under the **Charter of Patients' Rights (NHRC / Ministry of Health)**, you have the legal right to an itemized bill before final payment.
   - Request specific details on: ICU nursing charges, doctor visitation logs, pharmacy invoices, and consumable breakups.

2. **Verify NPPA Price Capped Devices & Medicines**:
   - The **National Pharmaceutical Pricing Authority (NPPA)** has strictly capped maximum prices for:
     - **Cardiac Stents**: Bare Metal Stents capped at ~₹10,500; Drug-Eluting Stents (DES) capped at ~₹38,000 + GST.
     - **Knee Implants**: Primary Knee Implants capped between ₹54,000 - ₹1,14,000.
     - **Essential Medicines (NLEM)**: 850+ drugs have legally capped MRPs.
   - Hospitals **cannot** charge above the NPPA ceiling.

3. **Check for Duplicate & Undelivered Consumables**:
   - Check if you are billed for PPE kits, gloves, sanitizers, or standard nursing care already included in room rent.

4. **Escalate to Hospital Medical Superintendent / TPA Helpdesk**:
   - Present your Care India audit report highlighting benchmark discrepancies.
   - Request the grievance desk to adjust unjustified charges.

5. **Legal Recourse If Hospital Refuses**:
   - File a complaint on the **National Consumer Helpline (NCH - 1915)** or **e-Daakhil Portal**.
   - Contact your state's **Clinical Establishments Regulatory Authority**.`
  },
  {
    id: "pmjay_eligibility",
    keywords: [
      "ayushman", "pmjay", "pm-jay", "ab-pmjay", "golden card", "5 lakh", "70 years", "senior citizen", "scheme eligibility"
    ],
    intent: "Ayushman Bharat PM-JAY Eligibility & Coverage",
    title: "Ayushman Bharat PM-JAY Benefits & Senior Citizen 70+ Expansion",
    response: `### 🏛️ Ayushman Bharat PM-JAY (Pradhan Mantri Jan Arogya Yojana)

**Key Highlights & Benefits:**
- **Annual Coverage**: Up to **₹5,00,000** per family per year for secondary and tertiary care hospitalization.
- **100% Cashless**: Covers pre-hospitalization (3 days), diagnostics, surgery, OT charges, ICU, medicines, and post-hospitalization (15 days).

**Expanded Eligibility (2024–2026 Expansion):**
1. **Senior Citizens Aged 70+**:
   - Every Indian citizen aged **70 years and above** is now eligible for a dedicated **₹5 Lakh annual top-up cover**, regardless of income or socio-economic status.
2. **SECC 2011 Beneficiaries / Ration Card Holders**:
   - Families identified under Socio-Economic Caste Census (SECC) criteria (D1–D7 deprivation categories).

**How to Check Eligibility & Get Your Ayushman Card:**
1. Visit the official NHA portal: [beneficiary.nha.gov.in](https://beneficiary.nha.gov.in) or download the **Ayushman App**.
2. Authenticate via Aadhaar OTP or Ration Card number.
3. Locate an empanelled public or private network hospital at the **Ayushman Mitra** helpdesk for instant cashless admission.`
  },
  {
    id: "state_schemes",
    keywords: [
      "mjpjay", "maharashtra", "cmchis", "tamil nadu", "aarogyasri", "andhra", "telangana", 
      "swasthya sathi", "west bengal", "arogya karnataka", "delhi arogya kosh", "state scheme"
    ],
    intent: "State-Specific Health Entitlement Schemes",
    title: "Major State Government Health Insurance Schemes in India",
    response: `### 🗺️ State Government Cashless Health Schemes

Many Indian states provide state-specific health assurance programs alongside PM-JAY:

- **Maharashtra (MJPJAY - Mahatma Jyotirao Phule Jan Arogya Yojana)**:
  - **Cover**: ₹5 Lakhs per family across 1,350+ surgical and medical procedures.
  - **Eligibility**: Open universally to yellow, orange, and white ration-card holding families in Maharashtra.

- **Tamil Nadu (CMCHIS - Chief Minister's Comprehensive Health Insurance)**:
  - **Cover**: ₹5 Lakhs per family per year for tertiary surgeries, cardiology, oncology, and polytrauma.

- **Andhra Pradesh / Telangana (Dr. YSR Aarogyasri / Aarogyasri)**:
  - **Cover**: Up to ₹5 Lakhs for low/middle-income families with ration cards at empanelled network hospitals.

- **Karnataka (Ayushman Bharat - Arogya Karnataka / AB-ArK)**:
  - **Cover**: Comprehensive secondary & tertiary packages with simple referral from district hospitals.

- **Delhi (Delhi Arogya Kosh - DAK)**:
  - **Cover**: Free essential surgeries, free high-end radiological tests (MRI/CT scans at private diagnostic centres) if wait times at Delhi Govt hospitals exceed 30 days.`
  },
  {
    id: "irdai_claim_rules",
    keywords: [
      "irdai", "cashless", "preauth", "pre-auth", "claim rejected", "claim denial", "60 minutes", 
      "3 hours", "tpa", "discharge delay", "insurance dispute", "settlement"
    ],
    intent: "IRDAI Health Insurance Claim Settlement Guidelines",
    title: "IRDAI Master Directives for Cashless Claims & Discharge Settlements",
    response: `### 📜 IRDAI Master Directives on Health Insurance Claims

The Insurance Regulatory and Development Authority of India (IRDAI) has mandated strict consumer-protection standards:

1. **60-Minute Pre-Authorization Rule**:
   - Insurers and TPAs must communicate the cashless pre-authorization decision to the network hospital **within 1 hour (60 minutes)** of request submission.

2. **3-Hour Final Discharge Authorization**:
   - On discharge, the final approval for bill settlement must be granted by the insurer **within 3 hours** of receiving the discharge summary. Hospitals cannot retain patients unnecessarily.

3. **No Claim Rejection on Technicalities After 5 Years**:
   - Policies in continuous force for 5 years cannot be contested for pre-existing disease (PED) non-disclosure, except in cases of proven fraud.

4. **Escalation Hierarchy for Denied Claims**:
   - **Step 1**: Write to the Insurance Company's Grievance Redressal Officer (GRO).
   - **Step 2**: If unresolved in 15 days, lodge a grievance on IRDAI's **Bima Bharosa Portal** (toll-free: 155255).
   - **Step 3**: Approach the **Insurance Ombudsman** (free of cost for claims up to ₹50 Lakhs).`
  },
  {
    id: "generic_medicines",
    keywords: [
      "generic", "jan aushadhi", "branded vs generic", "cheap medicine", "medicine cost", 
      "substitute", "atorvastatin", "metformin", "telmisartan", "paracetamol", "dava"
    ],
    intent: "Generic Medicine Savings & PMBJP Jan Aushadhi Kendras",
    title: "How to Save 50% to 85% with Generic Medications",
    response: `### 💊 Generic vs. Branded Medicines in India

Generic medicines contain the **exact same active pharmaceutical ingredient (API)**, potency, dosage, and bioequivalence as high-priced branded drugs, but cost a fraction of the price.

**Typical Price Comparisons (PMBJP Jan Aushadhi vs Top Brands):**
- **Atorvastatin 20mg (Cardiac / Cholesterol)**: Branded ~₹240 ➔ Jan Aushadhi **₹35** (*85% Savings*)
- **Telmisartan 40mg (Blood Pressure)**: Branded ~₹210 ➔ Jan Aushadhi **₹28** (*86% Savings*)
- **Glycomet-GP 1 (Metformin + Glimepiride - Diabetes)**: Branded ~₹165 ➔ Jan Aushadhi **₹24** (*85% Savings*)
- **Shelcal 500 (Calcium + Vit D3)**: Branded ~₹145 ➔ Jan Aushadhi **₹22** (*84% Savings*)

**Where to Find Generic Medicines:**
- Locate your nearest **Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) Kendra** using the **Jan Aushadhi Sugam** mobile app.
- Ask your doctor to prescribe medicines by **Pharmacological Salt / Generic Name** under National Medical Commission (NMC) regulations.`
  },
  {
    id: "checklist_discharge",
    keywords: [
      "discharge", "documents", "checklist", "claim filing", "reimbursement", "icd code", "bills file"
    ],
    intent: "Hospital Discharge & Insurance Claim Filing Checklist",
    title: "Essential Document Checklist for 100% Claim Approval",
    response: `### 📋 Essential Discharge & Claim Filing Checklist

To ensure your cashless or reimbursement claim is approved without deduction queries:

1. **Signed Discharge Summary**:
   - Must clearly state: Admission date/time, chief complaints, final diagnosis with ICD-10 code, treatment given, and recovery condition.
2. **Itemized Final Bill with Receipt**:
   - Breakup of room rent, nursing, ICU, investigation, OT, doctor visits, and pharmacy. Must have payment stamp.
3. **Investigation & Lab Reports**:
   - Original ECG, MRI/CT scan reports, blood tests, and histopathology reports supporting the diagnosis.
4. **Implant / Stent Stickers & Outer Invoices**:
   - For cardiac or orthopedic procedures, the original barcode sticker and invoice with batch number must be attached.
5. **Doctor's Prescription for Pharmacy**:
   - Every billed medication must have a corresponding doctor's prescription note in the indoor case paper.`
  }
];

export function getOfflineHealthcareAnswer(userQuery: string): { title: string; answer: string; matchedTopic: string } {
  const queryLower = userQuery.toLowerCase().trim();

  // Score each topic by keyword matches
  let bestTopic: KnowledgeTopic | null = null;
  let maxScore = 0;

  for (const topic of OFFLINE_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (queryLower.includes(kw.toLowerCase())) {
        score += kw.length > 5 ? 3 : 2; // Longer specific keywords have higher weight
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestTopic = topic;
    }
  }

  if (bestTopic && maxScore >= 2) {
    return {
      title: bestTopic.title,
      answer: bestTopic.response,
      matchedTopic: bestTopic.intent
    };
  }

  // Default general medical navigation guidance if no specific keyword matched
  return {
    title: "Care India Healthcare Financial Navigation Guide",
    matchedTopic: "General Healthcare Guidance",
    answer: `### 🏥 Care India Smart Healthcare Financial Navigation

I am your Care India Assistant. I can help you with:

- **Audit & Dispute Hospital Bills**: Learn your rights under NPPA price ceilings, consumer helplines, and itemized billing requirements.
- **Government Healthcare Schemes**: Check eligibility and benefits for **Ayushman Bharat PM-JAY**, **MJPJAY** (Maharashtra), **CMCHIS** (Tamil Nadu), **Aarogyasri** (AP/Telangana), and **Delhi Arogya Kosh**.
- **Insurance & IRDAI Guidelines**: Understand 60-minute cashless pre-auth, 3-hour discharge mandates, and claim rejection escalation.
- **Generic Medicines (Jan Aushadhi)**: Compare branded vs. generic salt prices to save up to 85% on chronic prescriptions.

*Try asking: "How do I dispute an inflated ICU bill?", "Am I eligible for PM-JAY?", "What are the IRDAI 60-minute rules?", or "How much can I save on cardiac generic medicines?"*`
  };
}
