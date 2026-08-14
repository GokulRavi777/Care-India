/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const benchmarkData = [
  // Accommodation / Room Rents
  { keyword: "icu room rent", reference_amount: 10000 },
  { keyword: "icu charges", reference_amount: 10000 },
  { keyword: "icu bed", reference_amount: 10000 },
  { keyword: "ventilator", reference_amount: 5000 },
  { keyword: "general ward", reference_amount: 2500 },
  { keyword: "ward rent", reference_amount: 2500 },
  { keyword: "ward charges", reference_amount: 2500 },
  { keyword: "semi-private room", reference_amount: 5000 },
  { keyword: "semi private room", reference_amount: 5000 },
  { keyword: "twin sharing room", reference_amount: 5000 },
  { keyword: "private room", reference_amount: 8000 },
  { keyword: "single private room", reference_amount: 8000 },
  { keyword: "deluxe room", reference_amount: 12000 },
  { keyword: "super deluxe room", reference_amount: 15000 },
  { keyword: "suite room", reference_amount: 20000 },
  
  // Consultations & Visits
  { keyword: "consultation fee", reference_amount: 1000 },
  { keyword: "specialist visit", reference_amount: 1000 },
  { keyword: "general consultation", reference_amount: 500 },
  { keyword: "opd consultation", reference_amount: 500 },
  { keyword: "emergency charges", reference_amount: 1500 },
  { keyword: "casualty visit", reference_amount: 1500 },
  { keyword: "dietician charge", reference_amount: 400 },
  { keyword: "physiotherapy session", reference_amount: 600 },
  
  // Laboratory Investigations
  { keyword: "cbc", reference_amount: 350 },
  { keyword: "complete blood count", reference_amount: 350 },
  { keyword: "lipid profile", reference_amount: 800 },
  { keyword: "cholesterol test", reference_amount: 800 },
  { keyword: "liver function", reference_amount: 900 },
  { keyword: "lft", reference_amount: 900 },
  { keyword: "kidney function", reference_amount: 800 },
  { keyword: "kft", reference_amount: 800 },
  { keyword: "renal function", reference_amount: 800 },
  { keyword: "rft", reference_amount: 800 },
  { keyword: "hba1c", reference_amount: 500 },
  { keyword: "glycated hemoglobin", reference_amount: 500 },
  { keyword: "thyroid", reference_amount: 600 },
  { keyword: "tsh", reference_amount: 600 },
  { keyword: "urine routine", reference_amount: 200 },
  { keyword: "urinalysis", reference_amount: 200 },
  { keyword: "blood culture", reference_amount: 1200 },
  { keyword: "d-dimer", reference_amount: 1000 },
  { keyword: "crp", reference_amount: 400 },
  { keyword: "blood sugar", reference_amount: 100 },
  { keyword: "creatinine", reference_amount: 200 },
  
  // Imaging & Diagnostics
  { keyword: "x-ray", reference_amount: 500 },
  { keyword: "xray", reference_amount: 500 },
  { keyword: "ultrasound", reference_amount: 1200 },
  { keyword: "usg", reference_amount: 1200 },
  { keyword: "ct scan brain", reference_amount: 3500 },
  { keyword: "ct brain", reference_amount: 3500 },
  { keyword: "ct scan chest", reference_amount: 5000 },
  { keyword: "ct chest", reference_amount: 5000 },
  { keyword: "mri brain", reference_amount: 7000 },
  { keyword: "mri head", reference_amount: 7000 },
  { keyword: "mri spine", reference_amount: 8000 },
  { keyword: "pet scan", reference_amount: 15000 },
  { keyword: "mammography", reference_amount: 2000 },
  { keyword: "mammogram", reference_amount: 2000 },
  { keyword: "ecg", reference_amount: 300 },
  { keyword: "electrocardiogram", reference_amount: 300 },
  { keyword: "echo", reference_amount: 2000 },
  { keyword: "echocardiography", reference_amount: 2000 },
  { keyword: "tmt", reference_amount: 1500 },
  
  // Major Procedures & Surgeries
  { keyword: "cataract surgery", reference_amount: 25000 },
  { keyword: "lens implantation", reference_amount: 25000 },
  { keyword: "appendectomy", reference_amount: 45000 },
  { keyword: "appendix surgery", reference_amount: 45000 },
  { keyword: "cholecystectomy", reference_amount: 55000 },
  { keyword: "gallbladder surgery", reference_amount: 55000 },
  { keyword: "hernia repair", reference_amount: 40000 },
  { keyword: "hernioplasty", reference_amount: 40000 },
  { keyword: "angioplasty", reference_amount: 120000 },
  { keyword: "stent implantation", reference_amount: 120000 },
  { keyword: "cabg", reference_amount: 250000 },
  { keyword: "bypass surgery", reference_amount: 250000 },
  { keyword: "knee replacement", reference_amount: 150000 },
  { keyword: "hip replacement", reference_amount: 180000 },
  { keyword: "maternity normal", reference_amount: 40000 },
  { keyword: "normal delivery", reference_amount: 40000 },
  { keyword: "maternity c-section", reference_amount: 70000 },
  { keyword: "caesarean delivery", reference_amount: 70000 },
  { keyword: "c-section", reference_amount: 70000 },
  { keyword: "tonsillectomy", reference_amount: 25000 },
  { keyword: "hysterectomy", reference_amount: 60000 },
  { keyword: "dialysis", reference_amount: 2500 },
  { keyword: "chemotherapy session", reference_amount: 15000 },
  { keyword: "angiography", reference_amount: 15000 },
  { keyword: "pacemaker surgery", reference_amount: 150000 },
  
  // Common Medicines (Branded vs. Generic benchmarks)
  { keyword: "paracetamol", reference_amount: 20 },
  { keyword: "crocin", reference_amount: 20 },
  { keyword: "dolo", reference_amount: 20 },
  { keyword: "metformin", reference_amount: 30 },
  { keyword: "atorvastatin", reference_amount: 70 },
  { keyword: "lipitor", reference_amount: 70 },
  { keyword: "amoxicillin", reference_amount: 60 },
  { keyword: "pantoprazole", reference_amount: 80 },
  { keyword: "pantocid", reference_amount: 80 },
  { keyword: "clopidogrel", reference_amount: 50 },
  { keyword: "losartan", reference_amount: 40 },
  { keyword: "azithromycin", reference_amount: 100 },
  { keyword: "amlodipine", reference_amount: 30 },
  { keyword: "montelukast", reference_amount: 80 }
];

async function seed() {
  console.log(`Starting to seed ${benchmarkData.length} reference price items...`);
  
  // Clear any existing reference prices first to avoid constraint conflicts on unique keyword
  const { error: deleteError } = await supabase
    .from('reference_prices')
    .delete()
    .neq('id', 0); // Delete all rows
    
  if (deleteError) {
    console.error("Warning: Error clearing existing reference prices:", deleteError.message);
  } else {
    console.log("Cleared existing records in 'reference_prices'.");
  }

  // Insert the benchmark data
  const { data, error } = await supabase
    .from('reference_prices')
    .insert(benchmarkData)
    .select();

  if (error) {
    console.error("Error seeding reference prices:", error.message);
    process.exit(1);
  } else {
    console.log(`Successfully seeded ${data.length} reference prices!`);
    process.exit(0);
  }
}

seed();
