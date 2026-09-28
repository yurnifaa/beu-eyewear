import type {
  Category,
  FrameMaterial,
  FrameMaterialSpec,
  LensOption,
  LensOptionInfo,
  Product,
  Subcategory,
} from './types';

export const CATEGORIES: Category[] = [
  {
    slug: 'classic',
    name: 'BeU Classic',
    description: 'Premium TR-90, stainless steel, or handcrafted acetate frames with standard clear UV400 lenses.',
  },
  {
    slug: 'premium',
    name: 'BeU Premium',
    description:
      'Titanium, mixed-material, and handcrafted acetate frames with anti-radiation, polarized, or photochromic lenses.',
  },
  {
    slug: 'smart',
    name: 'BeU Smart',
    description: 'Meta smart glasses with integrated camera, audio, connectivity, and charging accessories.',
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    description: 'Cases, chains, care kits, and pouches to protect and accessorize your eyewear.',
  },
  {
    slug: 'collections',
    name: 'Collections',
    description: 'Curated bundles and seasonal picks across the BeU lineup.',
  },
];

export const SUBCATEGORIES: Subcategory[] = [
  { slug: 'plastic-frames', categorySlug: 'classic', name: 'Plastic Frames' },
  { slug: 'metal-frames', categorySlug: 'classic', name: 'Metal Frames' },
  { slug: 'acetate-frames', categorySlug: 'classic', name: 'Acetate Frames' },

  { slug: 'anti-radiation', categorySlug: 'premium', name: 'Anti-Radiation' },
  { slug: 'polarized', categorySlug: 'premium', name: 'Polarized' },
  { slug: 'photochromic', categorySlug: 'premium', name: 'Photochromic' },

  { slug: 'meta-smart-glasses', categorySlug: 'smart', name: 'Meta Smart Glasses' },

  { slug: 'leather-cases', categorySlug: 'accessories', name: 'Leather Cases' },
  { slug: 'chains-lanyards', categorySlug: 'accessories', name: 'Chains & Lanyards' },
  { slug: 'care-kits', categorySlug: 'accessories', name: 'Care Kits' },
  { slug: 'power-case', categorySlug: 'accessories', name: 'Power-Case' },
  { slug: 'pouches', categorySlug: 'accessories', name: 'Pouches' },

  { slug: 'bundles', categorySlug: 'collections', name: 'Bundles' },
  { slug: 'student-picks', categorySlug: 'collections', name: 'Student Picks' },
];

export const PRODUCTS: Product[] = [
  // Classic — Plastic Frames
  {
    slug: 'horizon-plastic-round',
    name: 'Horizon Round Frame',
    description: 'A lightweight TR-90 round frame with memory-flex shape recovery for everyday wear.',
    price: 9990,
    categorySlug: 'classic',
    subcategorySlug: 'plastic-frames',
    frameMaterial: 'Plastic',
    frameShape: 'Round',
    colors: ['Matte Black', 'Tortoiseshell'],
    warrantyYears: 1,
  },
  {
    slug: 'drift-plastic-square',
    name: 'Drift Square Frame',
    description: 'A crisp square silhouette in impact-resistant polycarbonate.',
    price: 10990,
    categorySlug: 'classic',
    subcategorySlug: 'plastic-frames',
    frameMaterial: 'Plastic',
    frameShape: 'Square',
    colors: ['Jet Black', 'Crystal Clear'],
    warrantyYears: 1,
  },
  // Classic — Metal Frames
  {
    slug: 'aria-metal-aviator',
    name: 'Aria Aviator Frame',
    description: 'A classic aviator in marine-grade stainless steel with anodized aluminum accents.',
    price: 11990,
    categorySlug: 'classic',
    subcategorySlug: 'metal-frames',
    frameMaterial: 'Metal',
    frameShape: 'Aviator',
    colors: ['Gunmetal', 'Gold'],
    warrantyYears: 1,
  },
  {
    slug: 'nova-metal-rectangle',
    name: 'Nova Rectangle Frame',
    description: 'A refined rectangular frame with an ultra-lightweight aluminum alloy build.',
    price: 12990,
    categorySlug: 'classic',
    subcategorySlug: 'metal-frames',
    frameMaterial: 'Metal',
    frameShape: 'Rectangle',
    colors: ['Silver', 'Rose Gold'],
    warrantyYears: 1,
  },
  // Classic — Acetate Frames
  {
    slug: 'luna-acetate-cateye',
    name: 'Luna Cat-Eye Frame',
    description: 'A handcrafted cat-eye silhouette with a custom thermo-adjusted fit.',
    price: 12490,
    categorySlug: 'classic',
    subcategorySlug: 'acetate-frames',
    frameMaterial: 'Acetate',
    frameShape: 'Cat-Eye',
    colors: ['Amber Tortoise', 'Onyx'],
    warrantyYears: 1,
  },
  {
    slug: 'reyes-acetate-round',
    name: 'Reyes Round Frame',
    description: 'A high-density cellulose acetate round frame with a warm, tactile finish.',
    price: 11490,
    categorySlug: 'classic',
    subcategorySlug: 'acetate-frames',
    frameMaterial: 'Acetate',
    frameShape: 'Round',
    colors: ['Honey Fleck', 'Black Matte'],
    warrantyYears: 1,
  },

  // Premium — Anti-Radiation
  {
    slug: 'titan-drift-anti-radiation',
    name: 'Titan Drift Anti-Radiation Frame',
    description: 'Aerospace-grade titanium paired with a multilayer anti-radiation coating for all-day screen work.',
    price: 16990,
    categorySlug: 'premium',
    subcategorySlug: 'anti-radiation',
    frameMaterial: 'Titanium',
    lensOption: 'Anti-Radiation',
    frameShape: 'Rectangle',
    colors: ['Brushed Titanium', 'Matte Black'],
    warrantyYears: 1,
  },
  {
    slug: 'clarity-mixed-anti-radiation',
    name: 'Clarity Mixed-Frame Anti-Radiation',
    description: 'A hybrid metal-core, acetate-rimmed frame with HEV blue-light filtering.',
    price: 15990,
    categorySlug: 'premium',
    subcategorySlug: 'anti-radiation',
    frameMaterial: 'Mixed',
    lensOption: 'Anti-Radiation',
    frameShape: 'Square',
    colors: ['Black/Gunmetal', 'Tortoise/Gold'],
    warrantyYears: 1,
  },
  // Premium — Polarized
  {
    slug: 'solstice-titanium-polarized',
    name: 'Solstice Polarized Aviator',
    description: 'A titanium aviator with a polarized film that cuts surface glare on the road or water.',
    price: 17990,
    categorySlug: 'premium',
    subcategorySlug: 'polarized',
    frameMaterial: 'Titanium',
    lensOption: 'Polarized',
    frameShape: 'Aviator',
    colors: ['Gunmetal', 'Silver'],
    warrantyYears: 1,
  },
  {
    slug: 'meridian-acetate-polarized',
    name: 'Meridian Polarized Cat-Eye',
    description: 'A handcrafted acetate cat-eye frame with a polarized lens for enhanced outdoor contrast.',
    price: 16490,
    categorySlug: 'premium',
    subcategorySlug: 'polarized',
    frameMaterial: 'Acetate',
    lensOption: 'Polarized',
    frameShape: 'Cat-Eye',
    colors: ['Tortoise', 'Black'],
    warrantyYears: 1,
  },
  // Premium — Photochromic
  {
    slug: 'eclipse-titanium-photochromic',
    name: 'Eclipse Photochromic Round',
    description: 'A titanium round frame with a lens that adapts tint automatically between indoor and outdoor light.',
    price: 18990,
    categorySlug: 'premium',
    subcategorySlug: 'photochromic',
    frameMaterial: 'Titanium',
    lensOption: 'Photochromic',
    frameShape: 'Round',
    colors: ['Matte Black', 'Champagne'],
    warrantyYears: 1,
  },
  {
    slug: 'halo-mixed-photochromic',
    name: 'Halo Photochromic Square',
    description: 'A mixed-material square frame with fast-transitioning photochromic lenses.',
    price: 17490,
    categorySlug: 'premium',
    subcategorySlug: 'photochromic',
    frameMaterial: 'Mixed',
    lensOption: 'Photochromic',
    frameShape: 'Square',
    colors: ['Black/Silver', 'Brown/Gold'],
    warrantyYears: 1,
  },

  // Smart
  {
    slug: 'beu-smart-classic',
    name: 'BeU Smart Glasses — Classic Build',
    description: 'Hands-free photo, video, and audio in a frame that still reads as a normal pair of glasses.',
    price: 34990,
    categorySlug: 'smart',
    subcategorySlug: 'meta-smart-glasses',
    frameMaterial: 'Mixed',
    frameShape: 'Square',
    colors: ['Black', 'Tortoise'],
    warrantyYears: 5,
  },
  {
    slug: 'beu-smart-aviator',
    name: 'BeU Smart Glasses — Aviator Build',
    description: 'The full BeU Smart feature set in a metal aviator silhouette.',
    price: 39990,
    categorySlug: 'smart',
    subcategorySlug: 'meta-smart-glasses',
    frameMaterial: 'Metal',
    frameShape: 'Aviator',
    colors: ['Gunmetal'],
    warrantyYears: 5,
  },

  // Accessories
  {
    slug: 'premium-leather-hard-case',
    name: 'Premium Leather Hard Case',
    description: 'A crush-proof aluminum-core case wrapped in high-density vegan leather with a micro-velvet lining.',
    price: 2999,
    categorySlug: 'accessories',
    subcategorySlug: 'leather-cases',
    colors: ['Black', 'Cognac'],
    warrantyYears: 1,
  },
  {
    slug: 'fashion-chain-gold',
    name: 'Fashion Chain & Lanyard',
    description: 'High-tensile metallic links with adjustable silicone loop anchors that grip temple arms securely.',
    price: 1999,
    categorySlug: 'accessories',
    subcategorySlug: 'chains-lanyards',
    colors: ['Gold', 'Silver'],
    warrantyYears: 1,
  },
  {
    slug: 'beu-lens-care-kit',
    name: 'BeU Lens Care Kit',
    description: 'An alcohol-free, anti-static cleaning spray with a suede microfiber cloth, safe for AR coatings.',
    price: 1099,
    categorySlug: 'accessories',
    subcategorySlug: 'care-kits',
    colors: [],
    warrantyYears: 1,
  },
  {
    slug: 'beu-power-case',
    name: 'BeU Power-Case',
    description: 'A 2000mAh charging case for BeU Smart Glasses with rapid USB-C input and LED telemetry.',
    price: 7990,
    categorySlug: 'accessories',
    subcategorySlug: 'power-case',
    colors: ['Black'],
    warrantyYears: 1,
  },
  {
    slug: 'active-lifestyle-pouch',
    name: 'Active-Lifestyle Pouch',
    description: 'A shock-absorbing, water-resistant neoprene pouch with a matte metal carabiner.',
    price: 1999,
    categorySlug: 'accessories',
    subcategorySlug: 'pouches',
    colors: ['Black', 'Navy'],
    warrantyYears: 1,
  },

  // Collections
  {
    slug: 'classic-care-bundle',
    name: 'BeU Classic + Care Bundle',
    description: 'Any Classic frame paired with the BeU Lens Care Kit.',
    price: 9799,
    categorySlug: 'collections',
    subcategorySlug: 'bundles',
    colors: [],
    warrantyYears: 1,
  },
  {
    slug: 'premium-care-bundle',
    name: 'BeU Premium + Care Bundle',
    description: 'Any Premium frame paired with the BeU Lens Care Kit.',
    price: 15799,
    categorySlug: 'collections',
    subcategorySlug: 'bundles',
    colors: [],
    warrantyYears: 1,
  },
  {
    slug: 'student-classic-pick',
    name: 'Student Pick — Horizon Round Frame',
    description: '5% off the Horizon Round Frame with a valid student ID.',
    price: 9490,
    categorySlug: 'collections',
    subcategorySlug: 'student-picks',
    frameMaterial: 'Plastic',
    frameShape: 'Round',
    colors: ['Matte Black'],
    warrantyYears: 1,
  },
];

export const FRAME_MATERIAL_SPECS: Record<FrameMaterial, FrameMaterialSpec> = {
  Plastic: {
    dimensions: '48-54 mm / 16-18 mm / 135-140 mm',
    weight: '12-18 g',
    composition: 'TR-90 & Polycarbonate',
    performance:
      'TR-90 thermoplastic yields memory-flex shape recovery, high impact resistance, and 350°C thermal stability.',
    nosePad: 'Fixed',
  },
  Metal: {
    dimensions: '46-52 mm / 18-20 mm / 140-145 mm',
    weight: '15-22 g',
    composition: 'Marine-Grade Stainless Steel & Aluminum Alloy',
    performance:
      'Grade 316 steel provides superior chloride resistance, while anodized aluminum delivers ultra-lightweight rigidity.',
    nosePad: 'Adjustable Silicone',
  },
  Acetate: {
    dimensions: '48-54 mm / 16-22 mm / 140-150 mm',
    weight: '20-30 g',
    composition: 'Handcrafted Cellulose Acetate',
    performance:
      'High-density cellulose matrix enables precise thermo-adjustability for a permanent, custom anatomical fit.',
    nosePad: 'Fixed',
  },
  Mixed: {
    dimensions: '48–52 mm / 18–22 mm / 140–145 mm',
    weight: '18–24 g',
    composition: 'Metal Core Chassis + Acetate/Plastic Rims',
    performance:
      'Hybrid architecture integrates a high-tensile metal core with thermally adaptable polymer rims for balanced rigidity.',
    nosePad: 'Adjustable Silicone',
  },
  Titanium: {
    dimensions: '46–54 mm / 18–22 mm / 140–145 mm',
    weight: '9–14 g',
    composition: 'Pure Titanium & Beta Titanium Alloy',
    performance:
      'Aerospace-grade titanium maximizes strength-to-weight ratio, ensuring 100% hypoallergenic, anti-corrosive durability.',
    nosePad: 'Adjustable Silicone',
  },
};

export const LENS_OPTION_INFO: Record<LensOption, LensOptionInfo> = {
  Photochromic: {
    description:
      'Embedded with UV-reactive, photosensitive molecules in a high-index polymer substrate. Transitions from 0% to 80% tint opacity within 30–60 seconds of active UV exposure.',
  },
  Polarized: {
    description:
      'Uses a vertically aligned micro-crystal chemical film to neutralize horizontal light waves, delivering 99.9% surface glare reduction while enhancing visual contrast and depth perception.',
  },
  'Anti-Radiation': {
    description:
      'Features a multilayer, vacuum-deposited interference filter that targets high-energy visible (HEV) blue light, attenuating wavelengths between 380nm–450nm to reduce digital eye strain.',
  },
  'Anti-Fog': {
    description:
      'Applied as a permanent hydrophilic surface layer that decreases the contact angle of water droplets, rapidly dispersing moisture to prevent vapor condensation.',
  },
  'UV Protection': {
    description:
      'Formulated with a UV400 blocking agent embedded directly into the lens matrix, guaranteeing 100% absorption of hazardous UVA and UVB radiation up to the 400nm line.',
  },
};
