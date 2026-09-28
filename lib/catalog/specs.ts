import type { FrameMaterial, FrameMaterialSpec, LensOption, LensOptionInfo } from './types';

// Static reference content tied to the FrameMaterial/LensOption enums — not
// admin-editable business data, so this stays in code rather than the DB.
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
