export type PropertyCategory = 'buy_house' | 'rent_house' | 'buy_land' | 'buy_plot';

export interface PropertySeller {
  name: string;
  type: 'Owner' | 'Builder' | 'Verified Agent';
  phone: string;
  whatsapp: string;
  verified: boolean;
  avatar?: string;
  responseRate?: string;
}

export interface NearbyLandmark {
  name: string;
  distance: string;
  type: 'school' | 'hospital' | 'transit' | 'market' | 'bank';
}

export interface PropertyDocumentCheck {
  title: string;
  category: string;
  status: 'clear' | 'pending' | 'not_applicable';
  statusLabel: string;
  details: string;
}

export interface PropertyItem {
  id: string;
  category: PropertyCategory;
  propertyType: string;
  title: string;
  price: number;
  priceDisplay: string;
  priceUnit?: string; // '/mo' for rent or '' for buy
  pricePerSqFt?: string;
  emiEstimate?: string;
  securityDeposit?: number;
  maintenancePerMonth?: number;
  locality: string;
  city: string;
  fullAddress: string;
  coordinates?: { lat: number; lng: number };
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  carpetAreaSqFt: number;
  superBuiltUpAreaSqFt: number;
  totalAcres?: number;
  facing: 'East' | 'North' | 'North-East' | 'West' | 'South';
  furnishing: 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
  possessionStatus: 'Ready to Move' | 'Under Construction' | 'Immediate' | 'Under Development';
  ageOfProperty?: string;
  floor?: string;
  parking?: string;
  waterSupply?: string;
  tags: string[];
  description: string;
  amenities: string[];
  nearbyLandmarks: NearbyLandmark[];
  seller: PropertySeller;
  videoUrl?: string;
  youtubeUrl?: string;
  isFavorite?: boolean;
  is_verified?: boolean;
  isVerified?: boolean;
  status?: 'approved' | 'pending_verification' | 'sold' | 'closed' | 'rejected' | string;
  legalChecks?: PropertyDocumentCheck[];
}

export const DUMMY_PROPERTIES: PropertyItem[] = [
  // ─── BUY HOUSE ────────────────────────────────────────────────────────────
  {
    id: 'prop-bh-01',
    category: 'buy_house',
    propertyType: 'Independent Villa',
    title: '3 BHK Modern Luxury Villa in Girinagar',
    price: 6850000,
    priceDisplay: '₹68.5 L',
    pricePerSqFt: '₹3,700 / sq.ft',
    emiEstimate: '₹38,200/mo',
    locality: 'Girinagar, Mudhol Road',
    city: 'Jamkhandi',
    fullAddress: 'Plot #42, Girinagar Layout, Near Royal Palace, Mudhol Road, Jamkhandi - 587301',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    carpetAreaSqFt: 1650,
    superBuiltUpAreaSqFt: 1850,
    facing: 'East',
    furnishing: 'Semi-Furnished',
    possessionStatus: 'Ready to Move',
    ageOfProperty: '1 Year (Brand New)',
    floor: 'G+1 Duplex',
    parking: '1 Covered + 1 Open',
    waterSupply: '24/7 Municipal & Borewell',
    tags: ['Verified', 'Zero Brokerage', 'Ready to Move', 'Vastu Compliant'],
    description: 'Beautifully crafted contemporary 3 BHK duplex independent villa with natural lighting, modular kitchen, teak wood doors, Italian marble flooring, and private terrace garden. Peaceful residential colony with wide 40ft tar road.',
    amenities: ['Gated Security', 'CCTV Surveillance', 'Solar Water Heater', 'Private Garden', 'Power Backup', 'Rainwater Harvesting'],
    nearbyLandmarks: [
      { name: 'Kittur Rani Chennamma School', distance: '650 m', type: 'school' },
      { name: 'Jamkhandi General Hospital', distance: '1.4 km', type: 'hospital' },
      { name: 'Central Bus Stand', distance: '1.8 km', type: 'transit' },
      { name: 'Daily Grocery Bazaar', distance: '500 m', type: 'market' }
    ],
    seller: {
      name: 'Mallikarjun Patil',
      type: 'Owner',
      phone: '+91 94801 23456',
      whatsapp: '919480123456',
      verified: true,
      responseRate: 'Under 15 mins'
    },
    status: 'approved'
  },
  {
    id: 'prop-bh-02',
    category: 'buy_house',
    propertyType: 'Apartment Flat',
    title: '2 BHK Premium Apartment in Sai Heritage',
    price: 4200000,
    priceDisplay: '₹42.0 L',
    pricePerSqFt: '₹3,500 / sq.ft',
    emiEstimate: '₹23,400/mo',
    locality: 'Kadarolli Galli, Station Road',
    city: 'Jamkhandi',
    fullAddress: 'Flat 302, 3rd Floor, Sai Heritage Tower, Station Road, Jamkhandi - 587301',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'
    ],
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    carpetAreaSqFt: 1050,
    superBuiltUpAreaSqFt: 1200,
    facing: 'North',
    furnishing: 'Unfurnished',
    possessionStatus: 'Ready to Move',
    ageOfProperty: 'Under 2 Years',
    floor: '3rd of 5 Floors',
    parking: '1 Reserved Stilt Parking',
    waterSupply: '24x7 Corporation Water',
    tags: ['Verified', 'RERA Approved', 'Lift Available'],
    description: 'Spacious, well-ventilated 2 BHK flat with modern amenities, automatic elevator with generator backup, secure gated entry, and dedicated children play area. Prime central location with easy access to banks, schools, and markets.',
    amenities: ['Automatic Lift', '24x7 Security', 'Children Play Area', 'Covered Parking', 'Intercom'],
    nearbyLandmarks: [
      { name: 'State Bank of India', distance: '300 m', type: 'bank' },
      { name: 'Town Hall Market', distance: '400 m', type: 'market' },
      { name: 'District Civil Hospital', distance: '1.1 km', type: 'hospital' }
    ],
    seller: {
      name: 'Sai Developers',
      type: 'Builder',
      phone: '+91 98452 34567',
      whatsapp: '919845234567',
      verified: true,
      responseRate: 'Within 30 mins'
    },
    status: 'sold'
  },
  {
    id: 'prop-bh-03',
    category: 'buy_house',
    propertyType: 'Independent House',
    title: '4 BHK Grand Independent Bungalow',
    price: 9500000,
    priceDisplay: '₹95.0 L',
    pricePerSqFt: '₹3,950 / sq.ft',
    emiEstimate: '₹53,000/mo',
    locality: 'Vidyanagar, Bilagi Road',
    city: 'Jamkhandi',
    fullAddress: 'House #18, Vidyanagar Colony, Near Government PU College, Jamkhandi - 587301',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'
    ],
    bedrooms: 4,
    bathrooms: 4,
    balconies: 3,
    carpetAreaSqFt: 2100,
    superBuiltUpAreaSqFt: 2400,
    facing: 'North-East',
    furnishing: 'Furnished',
    possessionStatus: 'Ready to Move',
    ageOfProperty: '3 Years',
    floor: 'Ground + 1 Floor',
    parking: '2 Covered Car Parks',
    waterSupply: '24/7 Kaveri Connection & Deep Borewell',
    tags: ['Luxury', 'Verified', '100% Vastu', 'Garden'],
    description: 'Exquisite 4 BHK independent bungalow built on a 40x60 plot. Includes large hall, modular kitchen with chimney, puja room, study, manicured lawn, and CCTV surveillance all around. High-end wood work in all bedrooms.',
    amenities: ['Private Lawn', 'Servant Room', 'Solar Inverter', 'Security System', 'Water Storage Tanks'],
    nearbyLandmarks: [
      { name: 'BGM College', distance: '500 m', type: 'school' },
      { name: 'APMC Yard', distance: '1.2 km', type: 'market' },
      { name: 'City Hospital', distance: '1.5 km', type: 'hospital' }
    ],
    seller: {
      name: 'Anand Kulkarni',
      type: 'Owner',
      phone: '+91 97413 45678',
      whatsapp: '919741345678',
      verified: true,
      responseRate: 'Under 10 mins'
    }
  },

  // ─── RENT HOUSE ───────────────────────────────────────────────────────────
  {
    id: 'prop-rh-01',
    category: 'rent_house',
    propertyType: 'Apartment Flat',
    title: '2 BHK Airy Flat for Family in Royal Greens',
    price: 13500,
    priceDisplay: '₹13,500',
    priceUnit: '/month',
    pricePerSqFt: 'Deposit: ₹50,000',
    emiEstimate: 'Zero Brokerage',
    locality: 'Teacher Colony, Bagalkot Road',
    city: 'Jamkhandi',
    fullAddress: 'A-204, Royal Greens Apartments, Teachers Colony, Bagalkot Road, Jamkhandi - 587301',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    carpetAreaSqFt: 980,
    superBuiltUpAreaSqFt: 1100,
    facing: 'East',
    furnishing: 'Semi-Furnished',
    possessionStatus: 'Immediate',
    ageOfProperty: '2 Years',
    floor: '2nd of 4 Floors',
    parking: '1 Covered Bike & Car Parking',
    waterSupply: '24/7 Water Supply',
    tags: ['Family Preferred', 'Zero Brokerage', 'Gated Community', 'Immediate'],
    description: 'Bright and airy 2 BHK apartment with built-in wardrobes, kitchen cabinets, ceiling fans, and utility balcony. Safe family-friendly society with 24-hr security guard and lift.',
    amenities: ['Lift', '24x7 Security', 'Covered Parking', 'Borewell & Kaveri Water'],
    nearbyLandmarks: [
      { name: 'Teachers Colony Park', distance: '150 m', type: 'transit' },
      { name: 'St. Joseph High School', distance: '800 m', type: 'school' },
      { name: 'Supermarket Store', distance: '300 m', type: 'market' }
    ],
    seller: {
      name: 'Suresh Hiremath',
      type: 'Owner',
      phone: '+91 96324 56789',
      whatsapp: '919632456789',
      verified: true,
      responseRate: 'Under 30 mins'
    }
  },
  {
    id: 'prop-rh-02',
    category: 'rent_house',
    propertyType: 'Independent Floor',
    title: '1 BHK Independent House First Floor',
    price: 7500,
    priceDisplay: '₹7,500',
    priceUnit: '/month',
    pricePerSqFt: 'Deposit: ₹25,000',
    emiEstimate: 'Bachelors / Small Family',
    locality: 'Basaveshwar Circle, Main Market',
    city: 'Jamkhandi',
    fullAddress: 'Plot 7, 1st Floor, Near Basaveshwar Temple, Main Market Road, Jamkhandi - 587301',
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
    ],
    bedrooms: 1,
    bathrooms: 1,
    balconies: 1,
    carpetAreaSqFt: 550,
    superBuiltUpAreaSqFt: 620,
    facing: 'North',
    furnishing: 'Unfurnished',
    possessionStatus: 'Immediate',
    ageOfProperty: '4 Years',
    floor: '1st of 2 Floors',
    parking: 'Two-Wheeler Covered Parking',
    waterSupply: '24 Hours Water Connection',
    tags: ['Affordable', 'Central Location', 'Low Deposit'],
    description: 'Cosy 1 BHK house on first floor with separate entrance, separate electric meter, kitchen platform with sink, western bathroom, and terrace access. Prime market spot.',
    amenities: ['Separate Electricity Meter', 'Terrace Access', 'Two-wheeler Parking'],
    nearbyLandmarks: [
      { name: 'Basaveshwar Circle', distance: '100 m', type: 'transit' },
      { name: 'Vegetable Market', distance: '200 m', type: 'market' },
      { name: 'City Bus Stop', distance: '250 m', type: 'transit' }
    ],
    seller: {
      name: 'Ramesh Badiger',
      type: 'Owner',
      phone: '+91 99015 67890',
      whatsapp: '919901567890',
      verified: true,
      responseRate: 'Under 1 hour'
    }
  },
  {
    id: 'prop-rh-03',
    category: 'rent_house',
    propertyType: 'Independent Villa',
    title: '3 BHK Fully Furnished Luxury Independent House',
    price: 22000,
    priceDisplay: '₹22,000',
    priceUnit: '/month',
    pricePerSqFt: 'Deposit: ₹1,00,000',
    emiEstimate: 'High Executive / Doctors',
    locality: 'KHB Colony, Behind Court Complex',
    city: 'Jamkhandi',
    fullAddress: 'House 88, KHB Colony Phase 2, Behind Court Complex, Jamkhandi - 587301',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'
    ],
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    carpetAreaSqFt: 1700,
    superBuiltUpAreaSqFt: 1950,
    facing: 'East',
    furnishing: 'Furnished',
    possessionStatus: 'Immediate',
    ageOfProperty: '2 Years',
    floor: 'Independent Full House',
    parking: '2 Car Covered Garage',
    waterSupply: 'Continuous Kaveri & Borewell',
    tags: ['Fully Furnished', 'Luxury Living', 'Air Conditioned'],
    description: 'Fully furnished with sofa, 6-seater dining table, king-sized beds with mattresses, 2 Split ACs, refrigerator, washing machine, and 55" Smart TV. Ideal for government officers, doctors, or corporate executives.',
    amenities: ['Furnished AC Bedrooms', 'Private Garage', 'Inverter Power Backup', 'Water Purifier', 'Private Garden'],
    nearbyLandmarks: [
      { name: 'District Court Complex', distance: '300 m', type: 'transit' },
      { name: 'Mini Vidhana Soudha', distance: '500 m', type: 'transit' },
      { name: 'Government Hospital', distance: '900 m', type: 'hospital' }
    ],
    seller: {
      name: 'Dr. Praveen Desai',
      type: 'Owner',
      phone: '+91 98440 12345',
      whatsapp: '919844012345',
      verified: true,
      responseRate: 'Under 15 mins'
    }
  },

  // ─── BUY LAND ─────────────────────────────────────────────────────────────
  {
    id: 'prop-bl-01',
    category: 'buy_land',
    propertyType: 'Agricultural / Farm Land',
    title: '3.5 Acres Fertile Krishna River Basin Farm Land',
    price: 4900000,
    priceDisplay: '₹49.0 L',
    pricePerSqFt: '₹14 L / Acre',
    emiEstimate: 'Full Clear Title',
    locality: 'Asangi / Hipparagi Road',
    city: 'Jamkhandi Rural',
    fullAddress: 'Survey #114/2, Hipparagi Road, Near Krishna Left Canal, Jamkhandi Taluk - 587301',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=80'
    ],
    carpetAreaSqFt: 152460, // 3.5 acres
    superBuiltUpAreaSqFt: 152460,
    facing: 'North',
    furnishing: 'Unfurnished',
    possessionStatus: 'Immediate',
    parking: 'Tractor / Vehicle Road Approach',
    waterSupply: 'Perennial River Canal & High Yield Borewell',
    tags: ['Clear Title', 'River Irrigation', 'Sugarcane Soil', 'Single Owner'],
    description: 'Black cotton fertile sugarcane land with perennial river canal water facility and installed 10HP pump set. Directly attached to 24-ft wide village approach road. 100% single owner with clear RTC and no bank hypothecation.',
    amenities: ['10 HP Pump Connection', 'Canal Water Access', 'Electricity Transformer', 'Farm Shed'],
    nearbyLandmarks: [
      { name: 'Hipparagi Barrage', distance: '2.5 km', type: 'transit' },
      { name: 'Jamkhandi Sugar Factory', distance: '4.0 km', type: 'market' }
    ],
    seller: {
      name: 'Basavaraj Kadapatti',
      type: 'Owner',
      phone: '+91 97312 98765',
      whatsapp: '919731298765',
      verified: true,
      responseRate: 'Under 20 mins'
    }
  },
  {
    id: 'prop-bl-02',
    category: 'buy_land',
    propertyType: 'Commercial Land',
    title: '15,000 sq.ft Prime Commercial Highway Frontage Land',
    price: 12500000,
    priceDisplay: '₹1.25 Cr',
    pricePerSqFt: '₹833 / sq.ft',
    emiEstimate: 'Highway Facing',
    locality: 'Bijapur - Jamkhandi State Highway',
    city: 'Jamkhandi',
    fullAddress: 'SH-34 Highway Bypass Junction, Near RTO Checkpost, Jamkhandi - 587301',
    images: [
      'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
    ],
    carpetAreaSqFt: 15000,
    superBuiltUpAreaSqFt: 15000,
    facing: 'East',
    furnishing: 'Unfurnished',
    possessionStatus: 'Immediate',
    parking: 'Heavy Commercial Vehicle Parking',
    waterSupply: 'Borewell & Road Drainage',
    tags: ['Highway Touch', 'Commercial Approved', 'Direct Owner'],
    description: 'Superb 150-ft frontage commercial plot directly on the State Highway. Excellent for fuel pump, automobile showroom, warehouse, cold storage, or highway restaurant/dhabha. Fully converted NA non-agricultural land.',
    amenities: ['150ft Highway Frontage', 'NA Converted', 'HT Power Line Nearby', 'Street Lights'],
    nearbyLandmarks: [
      { name: 'Jamkhandi Ring Road Junction', distance: '800 m', type: 'transit' },
      { name: 'Industrial Area', distance: '1.5 km', type: 'transit' }
    ],
    seller: {
      name: 'Veeresh Bilagi',
      type: 'Owner',
      phone: '+91 98455 11223',
      whatsapp: '919845511223',
      verified: true,
      responseRate: 'Under 15 mins'
    }
  },

  // ─── BUY PLOT ─────────────────────────────────────────────────────────────
  {
    id: 'prop-bp-01',
    category: 'buy_plot',
    propertyType: 'Gated Layout Plot',
    title: '30x50 (1,500 sq.ft) East Facing DTCP Approved Plot',
    price: 2450000,
    priceDisplay: '₹24.5 L',
    pricePerSqFt: '₹1,633 / sq.ft',
    emiEstimate: 'Bank Loan Available',
    locality: 'Shri Ram Gated Layout, Girinagar',
    city: 'Jamkhandi',
    fullAddress: 'Plot #28, Shri Ram Green City Layout, Girinagar Extn, Jamkhandi - 587301',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
    ],
    carpetAreaSqFt: 1500,
    superBuiltUpAreaSqFt: 1500,
    facing: 'East',
    furnishing: 'Unfurnished',
    possessionStatus: 'Ready to Move',
    parking: 'Wide 30ft CC Road',
    waterSupply: 'Individual Plot Water Line Connected',
    tags: ['DTCP Approved', 'Bank Loan 80%', 'Gated Township', 'Clear Title'],
    description: 'Ready-to-construct residential plot with underground drainage, bitumen roads, streetlights, overhead water tank, avenue plantations, and entrance arch. Approved by major nationalized banks for up to 80% construction loan.',
    amenities: ['30ft Asphalt Roads', 'Underground Drainage', 'LED Street Lights', 'Children Park', 'Compound Wall'],
    nearbyLandmarks: [
      { name: 'Royal Palace Grounds', distance: '1.2 km', type: 'transit' },
      { name: 'CBSE Public School', distance: '700 m', type: 'school' },
      { name: 'Girinagar Supermarket', distance: '400 m', type: 'market' }
    ],
    seller: {
      name: 'Shri Ram Developers',
      type: 'Builder',
      phone: '+91 94480 33445',
      whatsapp: '919448033445',
      verified: true,
      responseRate: 'Under 10 mins'
    }
  },
  {
    id: 'prop-bp-02',
    category: 'buy_plot',
    propertyType: 'Residential Corner Plot',
    title: '40x60 (2,400 sq.ft) Corner Villa Plot in Green Meadows',
    price: 3600000,
    priceDisplay: '₹36.0 L',
    pricePerSqFt: '₹1,500 / sq.ft',
    emiEstimate: 'Dual Road Access',
    locality: 'Kalyan Nagar, Near Stadium',
    city: 'Jamkhandi',
    fullAddress: 'Corner Plot #1, Green Meadows Phase 1, Kalyan Nagar, Jamkhandi - 587301',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=80'
    ],
    carpetAreaSqFt: 2400,
    superBuiltUpAreaSqFt: 2400,
    facing: 'North-East',
    furnishing: 'Unfurnished',
    possessionStatus: 'Immediate',
    parking: '40ft & 30ft Corner Roads',
    waterSupply: 'Borewell & Municipal Water Lines',
    tags: ['Corner Plot', 'North-East Facing', 'Vastu Prime', 'High ROI'],
    description: 'Rare North-East corner plot with dual 40ft and 30ft road frontage. Highly sought-after location surrounded by premium bungalows. Ideal for constructing a grand duplex villa or residential apartments.',
    amenities: ['Dual Road Frontage', 'Underground Electricity', 'Water Supply Line', 'Security Cabin'],
    nearbyLandmarks: [
      { name: 'District Sports Stadium', distance: '450 m', type: 'transit' },
      { name: 'Kalyan Nagar Park', distance: '200 m', type: 'transit' },
      { name: 'Civil Hospital', distance: '1.0 km', type: 'hospital' }
    ],
    seller: {
      name: 'Ravi Meti',
      type: 'Owner',
      phone: '+91 97400 55667',
      whatsapp: '919740055667',
      verified: true,
      responseRate: 'Within 20 mins'
    }
  }
];

