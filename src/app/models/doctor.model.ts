// models/doctor.model.ts

export interface DoctorCategory {
  id: string;
  name: string;
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  badge?: string;
  consultCount?: string;
}

export interface DoctorSlot {
  time: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
  available: boolean;
}

export interface DoctorDaySchedule {
  date: string;
  dayName: string;
  isAvailable: boolean;
  slots: DoctorSlot[];
}

export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  specialization: string;
  categoryId: string;
  experienceYears: string;
  hospitalOrClinic: string;
  consultationFee: number;
  discountFee: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  image: string;
  about?: string;
  availableToday: boolean;
  nextAvailableSlot: string;
  languages: string[];
  consultationModes: ('In-Clinic' | 'Video Call')[];
  location: string;
  isTopDoctor: boolean;
  isActive: boolean;
  schedule?: DoctorDaySchedule[];
}

export interface DoctorAppointment {
  id: string;
  userId?: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  hospitalOrClinic?: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  consultationType: 'In-Clinic' | 'Video Call';
  appointmentDate: string;
  timeSlot: string;
  symptomsOrReason?: string;
  consultationFee: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: string;
  createdAt?: string;
}

export const DUMMY_DOCTOR_CATEGORIES: DoctorCategory[] = [
  {
    id: 'gynecologist',
    name: 'Gynecologist',
    title: 'Gynecologist & Obstetrician',
    icon: 'female-outline',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    borderColor: '#fbcfe8',
    description: "Women's Health, Pregnancy & Period Care",
    badge: 'Popular',
    consultCount: '1,200+ consults',
  },
  {
    id: 'general_physician',
    name: 'General Physician',
    title: 'General Physician & Diabetologist',
    icon: 'medkit-outline',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    description: 'Fever, Cough, Cold, BP & Routine Checkups',
    badge: 'Essential',
    consultCount: '3,400+ consults',
  },
  {
    id: 'pediatrician',
    name: 'Pediatrician',
    title: 'Pediatrician & Child Health',
    icon: 'happy-outline',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    description: 'Infant, Child Care, Growth & Vaccinations',
    badge: 'Top Rated',
    consultCount: '1,800+ consults',
  },
  {
    id: 'dermatologist',
    name: 'Dermatologist',
    title: 'Dermatologist & Hair Specialist',
    icon: 'sparkles-outline',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    description: 'Acne, Skin Glow, Hair Fall & Rashes',
    badge: 'Trending',
    consultCount: '1,500+ consults',
  },
  {
    id: 'cardiologist',
    name: 'Cardiologist',
    title: 'Cardiologist & Heart Specialist',
    icon: 'heart-outline',
    color: '#ef4444',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    description: 'Heart Health, Chest Pain & Blood Pressure',
    badge: 'Specialist',
    consultCount: '950+ consults',
  },
  {
    id: 'orthopedic',
    name: 'Orthopedic',
    title: 'Orthopedic & Joint Surgeon',
    icon: 'body-outline',
    color: '#10b981',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    description: 'Back, Knee Pain, Fractures & Arthritis',
    badge: 'Verified',
    consultCount: '1,100+ consults',
  },
  {
    id: 'ent',
    name: 'ENT Specialist',
    title: 'ENT Specialist (Ear, Nose, Throat)',
    icon: 'ear-outline',
    color: '#06b6d4',
    bgColor: '#ecfeff',
    borderColor: '#a5f3fc',
    description: 'Sinus, Ear Pain, Sore Throat & Hearing',
    badge: 'Verified',
    consultCount: '850+ consults',
  },
  {
    id: 'dentist',
    name: 'Dentist',
    title: 'Dental Surgeon & Smile Care',
    icon: 'shield-outline',
    color: '#14b8a6',
    bgColor: '#f0fdfa',
    borderColor: '#99f6e4',
    description: 'Teeth Cleaning, Toothache & Root Canal',
    badge: 'Popular',
    consultCount: '1,300+ consults',
  },
  {
    id: 'psychiatrist',
    name: 'Psychiatrist',
    title: 'Psychiatrist & Mental Wellness',
    icon: 'heart-half-outline',
    color: '#6366f1',
    bgColor: '#eef2ff',
    borderColor: '#c7d2fe',
    description: 'Anxiety, Stress, Depression & Sleep Care',
    badge: 'Confidential',
    consultCount: '700+ consults',
  },
  {
    id: 'ophthalmologist',
    name: 'Eye Specialist',
    title: 'Eye Specialist / Ophthalmologist',
    icon: 'eye-outline',
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
    description: 'Vision Test, Eye Strain & Cataract Care',
    badge: 'Specialist',
    consultCount: '620+ consults',
  },
];

export const DUMMY_DOCTORS: Doctor[] = [
  {
    id: 'doc-01',
    name: 'Dr. Sneha Patil',
    qualification: 'MBBS, MS - Obstetrics & Gynaecology, DGO',
    specialization: 'Gynecologist & Obstetrician',
    categoryId: 'gynecologist',
    experienceYears: '14+ years',
    hospitalOrClinic: 'Matruchhaya Maternity & Women Care Hospital',
    consultationFee: 400,
    discountFee: 320,
    discountPercent: 20,
    rating: 4.9,
    reviewCount: 230,
    image: 'https://images.unsplash.com/photo-1594824813575-56041c304d94?w=500&auto=format&fit=crop&q=60',
    about: 'Experienced gynecologist dedicated to compassionate pregnancy care, high-risk deliveries, PCOD management, and adolescent healthcare with 14+ years of clinical excellence.',
    availableToday: true,
    nextAvailableSlot: 'Today at 11:00 AM',
    languages: ['Kannada', 'English', 'Marathi', 'Hindi'],
    consultationModes: ['In-Clinic', 'Video Call'],
    location: 'Athani',
    isTopDoctor: true,
    isActive: true,
  },
  {
    id: 'doc-02',
    name: 'Dr. Ananya Kulkarni',
    qualification: 'MBBS, DNB - Obstetrics & Gynaecology, Fellowship in Laparoscopy',
    specialization: 'Gynecologist & Infertility Specialist',
    categoryId: 'gynecologist',
    experienceYears: '11+ years',
    hospitalOrClinic: 'Sanjeevani Multispeciality Hospital',
    consultationFee: 500,
    discountFee: 400,
    discountPercent: 20,
    rating: 4.8,
    reviewCount: 175,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=60',
    about: 'Specialist in fertility evaluation, laparoscopic gynecology surgeries, and comprehensive reproductive wellness for women.',
    availableToday: true,
    nextAvailableSlot: 'Today at 04:30 PM',
    languages: ['Kannada', 'English', 'Hindi'],
    consultationModes: ['In-Clinic', 'Video Call'],
    location: 'Athani',
    isTopDoctor: true,
    isActive: true,
  },
  {
    id: 'doc-03',
    name: 'Dr. Rajeshwar Hiremath',
    qualification: 'MBBS, MD - General Medicine',
    specialization: 'Senior General Physician & Diabetologist',
    categoryId: 'general_physician',
    experienceYears: '18+ years',
    hospitalOrClinic: 'Athani City Care Clinic, Main Market',
    consultationFee: 350,
    discountFee: 280,
    discountPercent: 20,
    rating: 4.9,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=60',
    about: 'Trusted family physician specializing in seasonal fevers, hypertension, chronic diabetes management, and geriatric care.',
    availableToday: true,
    nextAvailableSlot: 'Today at 10:15 AM',
    languages: ['Kannada', 'Hindi', 'English'],
    consultationModes: ['In-Clinic', 'Video Call'],
    location: 'Athani',
    isTopDoctor: true,
    isActive: true,
  },
  {
    id: 'doc-04',
    name: 'Dr. Pradeep Desai',
    qualification: 'MBBS, DCH, MD - Pediatrics',
    specialization: 'Pediatrician & Child Health Specialist',
    categoryId: 'pediatrician',
    experienceYears: '12+ years',
    hospitalOrClinic: 'Chiguru Children Clinic & Vaccination Center',
    consultationFee: 400,
    discountFee: 320,
    discountPercent: 20,
    rating: 4.9,
    reviewCount: 195,
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=60',
    about: 'Expert pediatrician focused on infant nutrition, timely developmental milestones, asthma in children, and immunization.',
    availableToday: true,
    nextAvailableSlot: 'Today at 12:00 PM',
    languages: ['Kannada', 'English', 'Marathi'],
    consultationModes: ['In-Clinic', 'Video Call'],
    location: 'Athani',
    isTopDoctor: true,
    isActive: true,
  },
  {
    id: 'doc-05',
    name: 'Dr. Meera Nadagouda',
    qualification: 'MBBS, MD - Dermatology, Venereology & Leprosy',
    specialization: 'Dermatologist & Hair Specialist',
    categoryId: 'dermatologist',
    experienceYears: '9+ years',
    hospitalOrClinic: 'Aura Skin & Hair Clinic, Court Road',
    consultationFee: 450,
    discountFee: 360,
    discountPercent: 20,
    rating: 4.8,
    reviewCount: 140,
    image: 'https://images.unsplash.com/photo-1594824813575-56041c304d94?w=500&auto=format&fit=crop&q=60',
    about: 'Specialized in treating cystic acne, pigmentation, psoriasis, scalp disorders, and modern cosmetic skin therapies.',
    availableToday: true,
    nextAvailableSlot: 'Today at 02:00 PM',
    languages: ['Kannada', 'English', 'Hindi'],
    consultationModes: ['In-Clinic', 'Video Call'],
    location: 'Athani',
    isTopDoctor: true,
    isActive: true,
  },
  {
    id: 'doc-06',
    name: 'Dr. Vikram Bellad',
    qualification: 'MBBS, MD - Internal Medicine, DM - Cardiology',
    specialization: 'Consultant Interventional Cardiologist',
    categoryId: 'cardiologist',
    experienceYears: '15+ years',
    hospitalOrClinic: 'Heart & Vascular Specialty Hospital',
    consultationFee: 600,
    discountFee: 480,
    discountPercent: 20,
    rating: 4.9,
    reviewCount: 260,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&auto=format&fit=crop&q=60',
    about: 'Leading cardiologist with expertise in preventive heart health, post-angioplasty recovery, ECG/2D Echo analysis, and arrhythmia management.',
    availableToday: true,
    nextAvailableSlot: 'Today at 03:30 PM',
    languages: ['English', 'Kannada', 'Hindi'],
    consultationModes: ['In-Clinic', 'Video Call'],
    location: 'Athani',
    isTopDoctor: true,
    isActive: true,
  },
  {
    id: 'doc-07',
    name: 'Dr. Santosh Biradar',
    qualification: 'MBBS, MS - Orthopaedics, Fellowship in Joint Replacement',
    specialization: 'Orthopedic Surgeon & Bone Specialist',
    categoryId: 'orthopedic',
    experienceYears: '13+ years',
    hospitalOrClinic: 'Biradar Orthocare & Trauma Center',
    consultationFee: 450,
    discountFee: 360,
    discountPercent: 20,
    rating: 4.8,
    reviewCount: 180,
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=500&auto=format&fit=crop&q=60',
    about: 'Specializing in knee & hip joint replacement, sports injury rehabilitation, spine spondylosis, and fracture fixation.',
    availableToday: true,
    nextAvailableSlot: 'Today at 11:45 AM',
    languages: ['Kannada', 'Hindi', 'English'],
    consultationModes: ['In-Clinic'],
    location: 'Athani',
    isTopDoctor: true,
    isActive: true,
  },
  {
    id: 'doc-08',
    name: 'Dr. Vinay Kolar',
    qualification: 'MBBS, MS - ENT',
    specialization: 'ENT & Head-Neck Specialist',
    categoryId: 'ent',
    experienceYears: '10+ years',
    hospitalOrClinic: 'Kolar ENT Care Center, Station Road',
    consultationFee: 400,
    discountFee: 320,
    discountPercent: 20,
    rating: 4.7,
    reviewCount: 120,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=60',
    about: 'Experienced in endoscopic sinus surgery, tonsillectomy, hearing loss treatment, and allergy-induced breathing issues.',
    availableToday: true,
    nextAvailableSlot: 'Today at 05:00 PM',
    languages: ['Kannada', 'English'],
    consultationModes: ['In-Clinic', 'Video Call'],
    location: 'Athani',
    isTopDoctor: true,
    isActive: true,
  },
  {
    id: 'doc-09',
    name: 'Dr. Pooja Shettar',
    qualification: 'BDS, MDS - Conservative Dentistry & Endodontics',
    specialization: 'Dental Surgeon & Root Canal Specialist',
    categoryId: 'dentist',
    experienceYears: '8+ years',
    hospitalOrClinic: 'DentaCare Advanced Smile Studio',
    consultationFee: 300,
    discountFee: 240,
    discountPercent: 20,
    rating: 4.9,
    reviewCount: 155,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=60',
    about: 'Painless single-sitting root canals, dental crowns, teeth whitening, and complete oral hygiene care.',
    availableToday: true,
    nextAvailableSlot: 'Today at 01:30 PM',
    languages: ['Kannada', 'English', 'Hindi'],
    consultationModes: ['In-Clinic'],
    location: 'Athani',
    isTopDoctor: true,
    isActive: true,
  },
  {
    id: 'doc-10',
    name: 'Dr. Arvind Joshi',
    qualification: 'MBBS, MD - Psychiatry',
    specialization: 'Consultant Psychiatrist & Behavioral Therapist',
    categoryId: 'psychiatrist',
    experienceYears: '14+ years',
    hospitalOrClinic: 'Mind & Wellness Clinic',
    consultationFee: 500,
    discountFee: 400,
    discountPercent: 20,
    rating: 4.9,
    reviewCount: 110,
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=60',
    about: 'Empathic mental health care providing treatment for anxiety, adult ADHD, burnout, depression, and lifestyle counseling.',
    availableToday: true,
    nextAvailableSlot: 'Today at 06:00 PM',
    languages: ['Kannada', 'English', 'Hindi'],
    consultationModes: ['Video Call', 'In-Clinic'],
    location: 'Athani',
    isTopDoctor: true,
    isActive: true,
  },
];

