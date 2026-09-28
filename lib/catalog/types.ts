export type CategorySlug = 'classic' | 'premium' | 'smart' | 'accessories' | 'collections';

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
}

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
