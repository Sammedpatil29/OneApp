export interface MedicineItem {
  id: string;
  name: string;
  brand: string;
  dosageForm: string; // 'Tablet' | 'Capsule' | 'Syrup' | 'Gel' | 'Spray' | 'Powder' | 'Drops'
  packSize: string; // e.g. '15 Tablets', '100 ml', '50 g'
  price: number;
  mrp: number;
  discountPercent: number;
  image: string;
  prescriptionRequired: boolean;
  category: string;
  inStock: boolean;
  description: string;
  uses?: string[];
  composition?: string;
  manufacturer?: string;
  seller?: { type: string; name: string };
  benefits?: string[];
  sideEffects?: string[];
  directionsForUse?: string;
  safetyAdvice?: { topic: string; detail: string; warning?: boolean }[];
}

export interface LabTestPackage {
  id: string;
  name: string;
  category: string; // 'Full Body' | 'Fever' | 'Diabetes' | 'Thyroid' | 'Heart' | 'Women Health'
  testCount: number;
  fastingRequirement: string; // '10-12 hrs fasting required' | 'No fasting required' | '8 hrs fasting'
  sampleType: string; // 'Blood' | 'Blood & Urine' | 'Urine'
  reportTimeHours: number; // e.g. 24, 12, 6
  price: number;
  mrp: number;
  discountPercent: number;
  tags: string[];
  parameters: string[];
  description: string;
  recommendedFor?: string;
  labPartner?: { type: string; name: string };
  overview?: string;
  preparation?: string[];
  parameterGroups?: { groupName: string; parameters: string[] }[];
}

export interface MedicineCategory {
  id: string;
  name: string;
  icon: string;
  badge?: string;
  color: string;
}

export interface LabCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CartMedicineItem {
  item: MedicineItem;
  quantity: number;
}

export interface CartLabItem {
  test: LabTestPackage;
  patientName?: string;
  quantity: number;
}

export interface PrescriptionUpload {
  id: string;
  fileName: string;
  fileUrl?: string;
  uploadedAt: Date;
  notes?: string;
  type: 'medicine' | 'lab';
}

export const DUMMY_MEDICINE_CATEGORIES: MedicineCategory[] = [
  { id: 'pain', name: 'Pain Relief', icon: 'fitness-outline', color: '#ef4444' },
  { id: 'fever_cold', name: 'Fever & Cold', icon: 'thermometer-outline', color: '#3b82f6' },
  { id: 'digestion', name: 'Digestive Care', icon: 'nutrition-outline', color: '#10b981' },
  { id: 'vitamins', name: 'Vitamins & Supplements', icon: 'sparkles-outline', color: '#f59e0b' },
  { id: 'first_aid', name: 'First Aid & Antiseptics', icon: 'bandage-outline', color: '#8b5cf6' },
  { id: 'diabetes', name: 'Diabetes Care', icon: 'water-outline', color: '#06b6d4' },
  { id: 'skin', name: 'Skin & Hair', icon: 'heart-outline', color: '#ec4899' },
  { id: 'baby', name: 'Baby & Mother', icon: 'happy-outline', color: '#f97316' },
];

export const DUMMY_MEDICINES: MedicineItem[] = [
  {
    id: 'med-01',
    name: 'Dolo 650mg Tablet',
    brand: 'Micro Labs',
    dosageForm: 'Tablet',
    packSize: '15 Tablets',
    price: 31,
    mrp: 35,
    discountPercent: 11,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    prescriptionRequired: false,
    category: 'fever_cold',
    inStock: true,
    description: 'Relief from body ache, headache, fever, and common cold symptoms.',
    uses: ['Fever', 'Headache', 'Muscle Pain'],
    seller: { type: 'Pharmacy Partner', name: 'MedPlus Pharmacy' }
  },
  {
    id: 'med-02',
    name: 'Crocin 500mg Advanced',
    brand: 'GlaxoSmithKline',
    dosageForm: 'Tablet',
    packSize: '20 Tablets',
    price: 24,
    mrp: 28,
    discountPercent: 14,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60',
    prescriptionRequired: false,
    category: 'fever_cold',
    inStock: true,
    description: 'Fast acting paracetamol for fever reduction and mild to moderate pain.',
    uses: ['Fever', 'Toothache', 'Backache'],
    seller: { type: 'Pharmacy Partner', name: 'Apollo Pharmacy' }
  },
  {
    id: 'med-03',
    name: 'Digene Antacid Gel Mint',
    brand: 'Abbott',
    dosageForm: 'Syrup',
    packSize: '200 ml Bottle',
    price: 135,
    mrp: 155,
    discountPercent: 13,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&auto=format&fit=crop&q=60',
    prescriptionRequired: false,
    category: 'digestion',
    inStock: true,
    description: 'Effective relief from acidity, heartburn, and stomach gas discomfort.',
    uses: ['Acidity', 'Gas', 'Indigestion'],
    seller: { type: 'Pharmacy Partner', name: 'Netmeds Store' }
  },
  {
    id: 'med-04',
    name: 'Volini Pain Relief Spray',
    brand: 'Sun Pharma',
    dosageForm: 'Spray',
    packSize: '100 g Can',
    price: 235,
    mrp: 275,
    discountPercent: 15,
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500&auto=format&fit=crop&q=60',
    prescriptionRequired: false,
    category: 'pain',
    inStock: true,
    description: 'Instant and long-lasting relief from back pain, joint stiffness and muscle sprains.',
    uses: ['Joint Pain', 'Sprain', 'Back Pain'],
    seller: { type: 'Pharmacy Partner', name: 'MedPlus Pharmacy' }
  },
  {
    id: 'med-05',
    name: 'Electral ORS Powder',
    brand: 'FDC Limited',
    dosageForm: 'Powder',
    packSize: '4x 21.8g Sachet',
    price: 88,
    mrp: 96,
    discountPercent: 8,
    image: 'https://images.unsplash.com/photo-1550572017-ed240d4f20e8?w=500&auto=format&fit=crop&q=60',
    prescriptionRequired: false,
    category: 'digestion',
    inStock: true,
    description: 'WHO recommended formula for dehydration, diarrhea, and electrolyte replenishment.',
    uses: ['Dehydration', 'Electrolytes', 'Energy'],
    seller: { type: 'Pharmacy Partner', name: 'PharmEasy Hub' }
  },
  {
    id: 'med-06',
    name: 'Shelcal 500 Calcium & Vit D3',
    brand: 'Torrent Pharma',
    dosageForm: 'Tablet',
    packSize: '15 Tablets',
    price: 118,
    mrp: 138,
    discountPercent: 14,
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500&auto=format&fit=crop&q=60',
    prescriptionRequired: false,
    category: 'vitamins',
    inStock: true,
    description: 'Supports bone strength, calcium absorption, and joint flexibility.',
    uses: ['Bone Strength', 'Calcium Deficiency', 'Joints'],
    seller: { type: 'Pharmacy Partner', name: 'Apollo Pharmacy' }
  },
  {
    id: 'med-07',
    name: 'Evion 400 Vitamin E Capsules',
    brand: 'Merck Healthcare',
    dosageForm: 'Capsule',
    packSize: '10 Capsules',
    price: 36,
    mrp: 42,
    discountPercent: 14,
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60',
    prescriptionRequired: false,
    category: 'skin',
    inStock: true,
    description: 'Antioxidant boost for glowing skin, healthy hair growth, and cellular health.',
    uses: ['Skin Health', 'Hair Growth', 'Antioxidant'],
    seller: { type: 'Pharmacy Partner', name: 'MedPlus Pharmacy' }
  },
  {
    id: 'med-08',
    name: 'Revital H Daily Multivitamin',
    brand: 'Sun Pharma',
    dosageForm: 'Capsule',
    packSize: '30 Capsules',
    price: 295,
    mrp: 350,
    discountPercent: 16,
    image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=500&auto=format&fit=crop&q=60',
    prescriptionRequired: false,
    category: 'vitamins',
    inStock: true,
    description: 'Ginseng, vitamins and 9 minerals to fight daily fatigue and boost stamina.',
    uses: ['Stamina', 'Immunity', 'Energy'],
    seller: { type: 'Pharmacy Partner', name: 'Netmeds Store' }
  },
  {
    id: 'med-09',
    name: 'Vicks VapoRub Relief Balm',
    brand: 'Procter & Gamble',
    dosageForm: 'Gel',
    packSize: '50 ml Jar',
    price: 148,
    mrp: 165,
    discountPercent: 10,
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=60',
    prescriptionRequired: false,
    category: 'fever_cold',
    inStock: true,
    description: '6-in-1 multi-symptom relief from cold, blocked nose, cough, and body aches.',
    uses: ['Nasal Congestion', 'Cold', 'Cough'],
    seller: { type: 'Pharmacy Partner', name: 'PharmEasy Hub' }
  },
  {
    id: 'med-10',
    name: 'Betadine 10% Antiseptic Ointment',
    brand: 'Win-Medicare',
    dosageForm: 'Gel',
    packSize: '20 g Tube',
    price: 110,
    mrp: 125,
    discountPercent: 12,
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&auto=format&fit=crop&q=60',
    prescriptionRequired: false,
    category: 'first_aid',
    inStock: true,
    description: 'Povidone Iodine ointment for cuts, minor burns, scrapes, and wound infection prevention.',
    uses: ['Cuts', 'Burns', 'Wound Disinfection'],
    seller: { type: 'Pharmacy Partner', name: 'Apollo Pharmacy' }
  },
  {
    id: 'med-11',
    name: 'Azithromycin 500mg (Azithral)',
    brand: 'Alembic Pharma',
    dosageForm: 'Tablet',
    packSize: '5 Tablets',
    price: 115,
    mrp: 132,
    discountPercent: 13,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    prescriptionRequired: true,
    category: 'fever_cold',
    inStock: true,
    description: 'Antibiotic for bacterial respiratory infections, throat, and sinus conditions.',
    uses: ['Bacterial Infections', 'Throat Infection', 'Bronchitis'],
    seller: { type: 'Pharmacy Partner', name: 'MedPlus Pharmacy' }
  },
  {
    id: 'med-12',
    name: 'Metformin 500mg (Glycomet)',
    brand: 'USV Limited',
    dosageForm: 'Tablet',
    packSize: '20 Tablets',
    price: 44,
    mrp: 52,
    discountPercent: 15,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60',
    prescriptionRequired: true,
    category: 'diabetes',
    inStock: true,
    description: 'Oral anti-diabetic medicine that helps control high blood sugar levels in type 2 diabetes.',
    uses: ['Type 2 Diabetes', 'Blood Sugar Control'],
    seller: { type: 'Pharmacy Partner', name: 'Apollo Pharmacy' }
  }
];

export const DUMMY_LAB_CATEGORIES: LabCategory[] = [
  { id: 'full_body', name: 'Full Body Checkup', icon: 'shield-checkmark-outline', color: '#10b981' },
  { id: 'fever', name: 'Fever & Infection', icon: 'thermometer-outline', color: '#ef4444' },
  { id: 'diabetes', name: 'Diabetes Package', icon: 'water-outline', color: '#06b6d4' },
  { id: 'thyroid', name: 'Thyroid Care', icon: 'pulse-outline', color: '#8b5cf6' },
  { id: 'heart', name: 'Heart & Cholesterol', icon: 'heart-outline', color: '#f43f5e' },
  { id: 'women', name: 'Women Wellness', icon: 'rose-outline', color: '#ec4899' },
  { id: 'senior', name: 'Senior Citizen', icon: 'body-outline', color: '#f59e0b' },
];

export const DUMMY_LAB_TESTS: LabTestPackage[] = [
  {
    id: 'lab-01',
    name: 'Complete Full Body Checkup Comprehensive',
    category: 'full_body',
    testCount: 78,
    fastingRequirement: '10-12 hrs fasting required',
    sampleType: 'Blood & Urine',
    reportTimeHours: 24,
    price: 899,
    mrp: 2499,
    discountPercent: 64,
    tags: ['Bestseller', 'NABL Accredited', 'Home Sample Pickup'],
    parameters: [
      'Complete Hemogram (CBC - 24 tests)',
      'Liver Function Test (LFT - 12 tests)',
      'Kidney Function Test (KFT - 8 tests)',
      'Lipid Profile (Cholesterol - 8 tests)',
      'Thyroid Profile (T3, T4, TSH)',
      'Blood Sugar Fasting',
      'Urine Routine & Microscopic (21 tests)'
    ],
    description: 'Comprehensive screening for vital organs, immunity, metabolism, diabetes, liver and heart health.',
    recommendedFor: 'Men & Women above 25 years (Annual Checkup)',
    labPartner: { type: 'Lab Partner', name: 'Dr. Lal PathLabs' }
  },
  {
    id: 'lab-02',
    name: 'Complete Blood Count (CBC) with ESR',
    category: 'fever',
    testCount: 26,
    fastingRequirement: 'No fasting required',
    sampleType: 'Blood',
    reportTimeHours: 8,
    price: 249,
    mrp: 450,
    discountPercent: 45,
    tags: ['Express Report', 'NABL Lab'],
    parameters: [
      'Hemoglobin (Hb)',
      'Total White Blood Cell Count (TLC)',
      'Platelet Count',
      'RBC Count & Indices (MCV, MCH, MCHC)',
      'Differential Leucocyte Count (DLC)',
      'Erythrocyte Sedimentation Rate (ESR)'
    ],
    description: 'Detects anemia, infections, platelet levels, dengue, and underlying inflammation.',
    recommendedFor: 'Fever, fatigue, routine health check',
    labPartner: { type: 'Lab Partner', name: 'SRL Diagnostics' }
  },
  {
    id: 'lab-03',
    name: 'Thyroid Profile Total (T3, T4, TSH)',
    category: 'thyroid',
    testCount: 3,
    fastingRequirement: 'No fasting required',
    sampleType: 'Blood',
    reportTimeHours: 12,
    price: 349,
    mrp: 750,
    discountPercent: 53,
    tags: ['Hormone Check', 'Accredited Lab'],
    parameters: [
      'Total Triiodothyronine (T3)',
      'Total Thyroxine (T4)',
      'Thyroid Stimulating Hormone (TSH)'
    ],
    description: 'Assesses thyroid gland function, metabolism, unexplained weight gain or loss, and energy levels.',
    recommendedFor: 'Weight fluctuation, hair loss, fatigue',
    labPartner: { type: 'Lab Partner', name: 'Thyrocare Labs' }
  },
  {
    id: 'lab-04',
    name: 'Lipid Profile (Heart & Cholesterol Screening)',
    category: 'heart',
    testCount: 8,
    fastingRequirement: '10-12 hrs fasting required',
    sampleType: 'Blood',
    reportTimeHours: 12,
    price: 399,
    mrp: 850,
    discountPercent: 53,
    tags: ['Cardio Health', 'Home Collection'],
    parameters: [
      'Total Cholesterol',
      'HDL Cholesterol (Good Cholesterol)',
      'LDL Cholesterol (Bad Cholesterol)',
      'VLDL Cholesterol',
      'Triglycerides',
      'Total / HDL Cholesterol Ratio'
    ],
    description: 'Essential cardiovascular assessment to measure good and bad cholesterol levels in the blood.',
    recommendedFor: 'Adults above 30, high BP, sedentary lifestyle',
    labPartner: { type: 'Lab Partner', name: 'Dr. Lal PathLabs' }
  },
  {
    id: 'lab-05',
    name: 'Diabetes Care Advanced (HbA1c + Fasting Sugar)',
    category: 'diabetes',
    testCount: 4,
    fastingRequirement: '8-10 hrs fasting required',
    sampleType: 'Blood',
    reportTimeHours: 12,
    price: 389,
    mrp: 800,
    discountPercent: 51,
    tags: ['Quarterly Monitor', 'Certified'],
    parameters: [
      'HbA1c (Glycosylated Hemoglobin - 3 Month Average)',
      'Average Estimated Blood Glucose',
      'Fasting Blood Sugar (FBS)',
      'Urine Glucose'
    ],
    description: 'Gold standard test reflecting average blood sugar levels over the last 90 days.',
    recommendedFor: 'Diabetic patients, family history of diabetes',
    labPartner: { type: 'Lab Partner', name: 'Metropolis Healthcare' }
  },
  {
    id: 'lab-06',
    name: 'Vitamin Deficiency Combo (Vit D & Vit B12)',
    category: 'full_body',
    testCount: 2,
    fastingRequirement: 'No fasting required',
    sampleType: 'Blood',
    reportTimeHours: 24,
    price: 699,
    mrp: 1800,
    discountPercent: 61,
    tags: ['High Demand', 'Immunity & Nerves'],
    parameters: [
      '25-Hydroxy Vitamin D3 Total',
      'Vitamin B12 (Cyanocobalamin)'
    ],
    description: 'Detects bone weakness, nerve tingling, body ache, brain fog, and chronic tiredness.',
    recommendedFor: 'Joint pain, vegetarians, office workers',
    labPartner: { type: 'Lab Partner', name: 'Thyrocare Labs' }
  },
  {
    id: 'lab-07',
    name: 'Liver Function Test (LFT Profile)',
    category: 'full_body',
    testCount: 11,
    fastingRequirement: 'No fasting required',
    sampleType: 'Blood',
    reportTimeHours: 12,
    price: 420,
    mrp: 850,
    discountPercent: 51,
    tags: ['Digestive Health', 'Enzyme Screen'],
    parameters: [
      'Bilirubin Total, Direct & Indirect',
      'SGOT / AST',
      'SGPT / ALT',
      'Alkaline Phosphatase (ALP)',
      'Total Protein & Albumin / Globulin Ratio'
    ],
    description: 'Measures liver enzymes, bilirubin, and proteins to diagnose liver inflammation or fatty liver.',
    recommendedFor: 'Digestive issues, jaundice symptoms, medication monitor',
    labPartner: { type: 'Lab Partner', name: 'SRL Diagnostics' }
  },
  {
    id: 'lab-08',
    name: 'Kidney Function Test (KFT Profile)',
    category: 'full_body',
    testCount: 8,
    fastingRequirement: 'No fasting required',
    sampleType: 'Blood',
    reportTimeHours: 12,
    price: 399,
    mrp: 800,
    discountPercent: 50,
    tags: ['Renal Health', 'Electrolytes'],
    parameters: [
      'Blood Urea Nitrogen (BUN)',
      'Serum Creatinine',
      'Uric Acid',
      'Calcium',
      'Phosphorus',
      'Sodium, Potassium, Chloride Electrolytes'
    ],
    description: 'Evaluates kidney filtration, waste removal, creatinine levels, and body hydration balance.',
    recommendedFor: 'High BP, swelling in feet, routine screening',
    labPartner: { type: 'Lab Partner', name: 'Metropolis Healthcare' }
  }
];

