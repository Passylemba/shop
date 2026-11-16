import shweshweWrap from "@/assets/p-shweshwe-wrap.jpg";
import ankaraTwoPiece from "@/assets/p-ankara-two-piece.jpg";
import ankaraKaftan from "@/assets/p-ankara-kaftan.jpg";
import ankaraSkirt from "@/assets/p-ankara-skirt.jpg";
import kenteDress from "@/assets/p-kente-dress.jpg";
import mudclothDress from "@/assets/p-mudcloth-dress.jpg";
import ankaraDoek from "@/assets/p-ankara-doek.jpg";
import ankaraTote from "@/assets/p-ankara-tote.jpg";
import ndebeleNecklace from "@/assets/p-ndebele-necklace.jpg";
import ankaraEarrings from "@/assets/p-ankara-earrings.jpg";
import kitengeClutch from "@/assets/p-kitenge-clutch.jpg";

export type DepartmentId = "women" | "accessories" | "men" | "kids";

export interface Department {
  id: DepartmentId;
  label: string;
  /** Departments stay disabled until the store has products for them. */
  enabled: boolean;
}

export const departments: Department[] = [
  { id: "women", label: "Women", enabled: true },
  { id: "accessories", label: "Accessories", enabled: true },
  { id: "men", label: "Men", enabled: false },
  { id: "kids", label: "Kids", enabled: false },
];

export interface Product {
  id: string;
  name: string;
  department: DepartmentId;
  fabric: string;
  origin: string;
  price: number;
  tag: string;
  image: string;
}

export const products: Product[] = [
  { id: "shweshwe-wrap", name: "Indigo Shweshwe Wrap Dress", department: "women", fabric: "Shweshwe", origin: "South Africa", price: 899, tag: "Bestseller", image: shweshweWrap },
  { id: "ankara-two-piece", name: "Sunburst Ankara Two-Piece", department: "women", fabric: "Ankara", origin: "South Africa", price: 1099, tag: "New arrival", image: ankaraTwoPiece },
  { id: "ankara-kaftan", name: "Turquoise Ankara Kaftan", department: "women", fabric: "Ankara", origin: "South Africa", price: 949, tag: "Relaxed fit", image: ankaraKaftan },
  { id: "ankara-skirt", name: "Ember Ankara Midi Skirt", department: "women", fabric: "Ankara", origin: "South Africa", price: 649, tag: "Everyday", image: ankaraSkirt },
  { id: "kente-dress", name: "Kente Off-Shoulder Dress", department: "women", fabric: "Kente", origin: "Ghana", price: 1299, tag: "Statement piece", image: kenteDress },
  { id: "mudcloth-dress", name: "Bogolan Mudcloth Shirt Dress", department: "women", fabric: "Mudcloth", origin: "Mali", price: 999, tag: "Handpicked", image: mudclothDress },
  { id: "ankara-doek", name: "Sculpted Ankara Doek", department: "accessories", fabric: "Ankara", origin: "South Africa", price: 249, tag: "Popular", image: ankaraDoek },
  { id: "ankara-tote", name: "Sunflower Ankara Tote", department: "accessories", fabric: "Ankara", origin: "South Africa", price: 549, tag: "Everyday", image: ankaraTote },
  { id: "ndebele-necklace", name: "Ndebele Beaded Collar", department: "accessories", fabric: "Ndebele beadwork", origin: "South Africa", price: 699, tag: "Handmade", image: ndebeleNecklace },
  { id: "ankara-earrings", name: "Ankara Teardrop Earrings", department: "accessories", fabric: "Ankara", origin: "South Africa", price: 189, tag: "Gift idea", image: ankaraEarrings },
  { id: "kitenge-clutch", name: "Kitenge Evening Clutch", department: "accessories", fabric: "Kitenge", origin: "Kenya", price: 429, tag: "New arrival", image: kitengeClutch },
];

export type Filter = "all" | DepartmentId;

export function isDepartmentEnabled(id: DepartmentId) {
  return departments.find((d) => d.id === id)?.enabled ?? false;
}

/** Products shown in the shop: only from enabled departments, matching filter and search. */
export function visibleProducts(filter: Filter, query = "", list: Product[] = products) {
  const q = query.trim().toLowerCase();
  return list.filter((p) => {
    if (!isDepartmentEnabled(p.department)) return false;
    if (filter !== "all" && p.department !== filter) return false;
    if (!q) return true;
    return [p.name, p.fabric, p.origin].some((v) => v.toLowerCase().includes(q));
  });
}

export const formatRand = (n: number) => "R" + n.toLocaleString("en-ZA");
