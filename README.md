# Care India

> **"Before you pay a rupee, know if it's fair — and if there's a cheaper way."**
> AI-powered healthcare affordability navigator for the Indian market.

---

## Overview

Care India helps patients navigate out-of-pocket medical expenses, discover government entitlements, and verify insurance claims in one unified workflow across three core modules:

1. **01 — Bill & Prescription Scanner**
   - Scans hospital bills and prescriptions against standard benchmark reference price lists.
2. **02 — Scheme & Savings Matcher**
   - Matches patient diagnosis, income bracket, and state of residence against eligible government health entitlement schemes.
3. **03 — Claim-Readiness Score**
   - Evaluates insurance claim approval probability prior to submission using a weighted checklist.

---

## Technical Stack & Architecture

- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 (design system tokens configured in `src/app/globals.css`)
- **Database & Auth**: Supabase (to be integrated in a later phase)
- **AI Engine**: Gemini API (to be integrated in a later phase)
- **Fonts**:
  - *Roboto Slab* (headings)
  - *Inter* (body/UI)
  - *IBM Plex Mono* (numbers/currency)

---

## Setup & Running Locally

### 1. Install Dependencies
Run npm install to install Next.js, React, TypeScript, and Tailwind CSS dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

### 3. Run Development Server
Start the local Next.js development server:
```bash
npm run dev
```

Then navigate to `http://localhost:3000` in your web browser.
