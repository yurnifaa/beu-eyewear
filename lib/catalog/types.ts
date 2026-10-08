// Categories are admin-editable DB rows now, not a fixed compile-time set —
// this alias just documents intent at call sites.
export type CategorySlug = string;

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
}

export interface Subcategory {
  slug: string;
  categorySlug: CategorySlug;
  name: string;
}

export type FrameMaterial = 'Plastic' | 'Metal' | 'Acetate' | 'Mixed' | 'Titanium';

export type LensOption = 'Photochromic' | 'Polarized' | 'Anti-Radiation' | 'Anti-Fog' | 'UV Protection';

export type FrameShape = 'Round' | 'Square' | 'Cat-Eye' | 'Aviator' | 'Rectangle';

export interface Product {
  slug: string;
  name: string;
  description: string;
  price: number;
  categorySlug: CategorySlug;
  subcategorySlug: string;
  frameMaterial?: FrameMaterial;
  lensOption?: LensOption;
  frameShape?: FrameShape;
  colors: string[];
  warrantyYears: number;
  imageUrl?: string;
  stockQuantity: number;
}

export const LOW_STOCK_THRESHOLD = 5;

export interface FrameMaterialSpec {
  dimensions: string;
  weight: string;
  composition: string;
  performance: string;
  nosePad: 'Fixed' | 'Adjustable Silicone';
}

export interface LensOptionInfo {
  description: string;
}
