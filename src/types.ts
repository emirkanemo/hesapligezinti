export interface Facility {
  id: string;
  name: string;
  type: string;
  city: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  openingHours: string;
  closingHours: string;
  imageUrl?: string;
}

export type Page = 'landing' | 'map';

export interface FilterState {
  search: string;
  type: string;
  city: string;
  onlyFavorites: boolean;
  onlyOpenNow: boolean;
}

export type FacilityCategory = 'Sosyal Tesis' | 'Öğrenci Restoranı' | 'Sosyal Kafe';

export function getFacilityCategory(type: string): FacilityCategory {
  const t = (type || "").toLowerCase().trim();
  if (t.includes("öğrenci") || t.includes("kent lokantası") || t.includes("lokanta") || t.includes("restoran") || t.includes("yemek")) {
    return "Öğrenci Restoranı";
  }
  if (t.includes("kafe") || t.includes("nevmekan") || t.includes("kafeterya") || t.includes("kütüphane") || t.includes("kahve")) {
    return "Sosyal Kafe";
  }
  return "Sosyal Tesis";
}
